import { describe, expect, it, vi } from "vitest";
import { createBooking } from "@/lib/booking/service";
import { normalizePhone, validateBookingRequest } from "@/lib/booking/validate";
import type { OutboxEntry } from "@/lib/notify/telegram";
import { MemoryBookingStore } from "@/lib/storage/memory";
import { SqliteBookingStore } from "@/lib/storage/sqlite";
import { testClinic, WED_10AM_BAKU } from "./fixtures";

const clinic = testClinic();

const valid = {
  name: "  Aysel   Məmmədova ",
  phone: "050 123 45 67",
  serviceId: "whitening",
  date: "2026-10-22",
  time: "11:30",
  consent: true,
  locale: "ru",
};

function fakeNotify(status: OutboxEntry["status"] = "simulated") {
  return vi.fn(async (clinicSlug: string, kind: OutboxEntry["kind"], text: string): Promise<OutboxEntry> => ({
    id: "n1",
    clinicSlug,
    kind,
    text,
    status,
    at: new Date().toISOString(),
  }));
}

describe("normalizePhone", () => {
  it.each([
    ["050 123 45 67", "+994501234567"],
    ["50-123-45-67", "+994501234567"],
    ["+994 (50) 123 45 67", "+994501234567"],
    ["994501234567", "+994501234567"],
    ["00994501234567", "+994501234567"],
    ["(012) 433-82-17", "+994124338217"],
    ["+7 912 345 67 89", "+79123456789"],
  ])("%s → %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["", "12345", "+994 50 123", "call me", "+994 50 123 45 678"])("rejects %j", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("validateBookingRequest", () => {
  it("accepts a valid request and normalises it", () => {
    const r = validateBookingRequest(clinic, valid, WED_10AM_BAKU);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.booking).toMatchObject({
      clinicSlug: "test-clinic",
      name: "Aysel Məmmədova",
      phone: "+994501234567",
      serviceId: "whitening",
      serviceName: "Отбеливание",
      date: "2026-10-22",
      time: "11:30",
      locale: "ru",
      source: "web",
    });
    expect(r.spam).toBe(false);
  });

  it("requires consent", () => {
    const r = validateBookingRequest(clinic, { ...valid, consent: false }, WED_10AM_BAKU);
    expect(r).toEqual({ ok: false, errors: { consent: true } });
  });

  it("rejects past dates and past times today (Baku time)", () => {
    expect(validateBookingRequest(clinic, { ...valid, date: "2026-10-20" }, WED_10AM_BAKU)).toMatchObject({
      ok: false,
      errors: { date: true },
    });
    // 09:30 today has already passed at 10:00 Baku time; 10:30 has not.
    expect(validateBookingRequest(clinic, { ...valid, date: "2026-10-21", time: "09:30" }, WED_10AM_BAKU)).toMatchObject({
      ok: false,
      errors: { time: true },
    });
    expect(validateBookingRequest(clinic, { ...valid, date: "2026-10-21", time: "10:30" }, WED_10AM_BAKU).ok).toBe(true);
  });

  it("only accepts slots inside opening hours, and no slots on closed days", () => {
    // Saturday 2026-10-24 is open 10:00–14:00 → 15:00 is outside.
    expect(validateBookingRequest(clinic, { ...valid, date: "2026-10-24", time: "15:00" }, WED_10AM_BAKU)).toMatchObject({
      ok: false,
      errors: { time: true },
    });
    // Sunday is closed.
    expect(validateBookingRequest(clinic, { ...valid, date: "2026-10-25", time: "11:00" }, WED_10AM_BAKU)).toMatchObject({
      ok: false,
      errors: { time: true },
    });
  });

  it("rejects unknown services, bad names and bad phones", () => {
    const r = validateBookingRequest(clinic, { ...valid, serviceId: "x", name: "A", phone: "123" }, WED_10AM_BAKU);
    expect(r).toEqual({ ok: false, errors: { service: true, name: true, phone: true } });
  });

  it("drops any extra fields, so health details can never be stored", () => {
    const r = validateBookingRequest(clinic, { ...valid, symptoms: "toothache", notes: "allergic to X" }, WED_10AM_BAKU);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(Object.keys(r.booking).sort()).toEqual(
      ["clinicSlug", "consentAt", "date", "locale", "name", "phone", "serviceId", "serviceName", "source", "time"].sort(),
    );
  });

  it("flags the honeypot as spam", () => {
    const r = validateBookingRequest(clinic, { ...valid, company: "ACME" }, WED_10AM_BAKU);
    expect(r.ok && r.spam).toBe(true);
  });
});

describe("createBooking", () => {
  const deps = (notify = fakeNotify()) => ({
    store: new MemoryBookingStore(),
    notify,
    adminUrl: "https://example.test/test-clinic/admin",
    demo: false,
    now: WED_10AM_BAKU,
  });

  it("saves the booking as 'new' and notifies staff", async () => {
    const d = deps();
    const r = await createBooking(clinic, valid, d);
    expect(r.ok).toBe(true);
    const rows = await d.store.list("test-clinic");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: "new", phone: "+994501234567", reminderSentAt: null });
    expect(d.notify).toHaveBeenCalledOnce();
    const [slug, kind, text] = d.notify.mock.calls[0];
    expect(slug).toBe("test-clinic");
    expect(kind).toBe("booking");
    expect(text).toContain("Aysel Məmmədova");
    expect(text).toContain("+994501234567");
    expect(text).toContain("https://example.test/test-clinic/admin");
  });

  it("keeps the booking even if the Telegram notification fails", async () => {
    const d = deps(fakeNotify("failed"));
    const r = await createBooking(clinic, valid, d);
    expect(r).toMatchObject({ ok: true, notification: "failed" });
    expect(await d.store.count("test-clinic")).toBe(1);
  });

  it("stores nothing and sends nothing for invalid or spam requests", async () => {
    const d = deps();
    expect((await createBooking(clinic, { ...valid, consent: false }, d)).ok).toBe(false);
    expect((await createBooking(clinic, { ...valid, company: "bot" }, d)).ok).toBe(true);
    expect(await d.store.count("test-clinic")).toBe(0);
    expect(d.notify).not.toHaveBeenCalled();
  });

  it("escapes HTML in staff notifications", async () => {
    const d = deps();
    await createBooking(clinic, { ...valid, name: "Ali & Vali" }, d);
    expect(d.notify.mock.calls[0][2]).toContain("Ali &amp; Vali");
  });
});

describe("SqliteBookingStore", () => {
  it("round-trips bookings and status changes", async () => {
    const store = await SqliteBookingStore.open(":memory:");
    const r = validateBookingRequest(clinic, valid, WED_10AM_BAKU);
    if (!r.ok) throw new Error("fixture invalid");
    const created = await store.create(r.booking);
    expect(await store.count("test-clinic")).toBe(1);
    await store.updateStatus("test-clinic", created.id, "confirmed");
    await store.markReminderSent("test-clinic", [created.id], "2026-10-21T14:00:00.000Z");
    const [row] = await store.list("test-clinic", { fromDate: "2026-10-22", toDate: "2026-10-22" });
    expect(row).toMatchObject({ id: created.id, status: "confirmed", reminderSentAt: "2026-10-21T14:00:00.000Z" });
    // Scoped per clinic.
    expect(await store.updateStatus("other-clinic", created.id, "cancelled")).toBeNull();
  });
});
