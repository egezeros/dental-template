import { describe, expect, it, vi } from "vitest";
import type { Booking, BookingStatus } from "@/lib/booking/types";
import { WaLinkProvider, WhatsAppCloudProvider } from "@/lib/messaging";
import { reminderText } from "@/lib/messaging/templates";
import type { OutboxEntry } from "@/lib/notify/telegram";
import { runReminders, selectNextDayAppointments, tomorrowInBaku } from "@/lib/reminders";
import { computeStats } from "@/lib/stats";
import { MemoryBookingStore } from "@/lib/storage/memory";
import { testClinic, WED_10AM_BAKU } from "./fixtures";

const clinic = testClinic();

let seq = 0;
function booking(date: string, time: string, status: BookingStatus = "confirmed", extra: Partial<Booking> = {}): Booking {
  seq++;
  return {
    id: `b${seq}`,
    clinicSlug: "test-clinic",
    name: `Patient ${seq}`,
    phone: "+994501234567",
    serviceId: "consultation",
    serviceName: "Konsultasiya",
    date,
    time,
    locale: "az",
    status,
    consentAt: "2026-10-01T00:00:00Z",
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
    reminderSentAt: null,
    source: "web",
    ...extra,
  };
}

describe("tomorrowInBaku", () => {
  it("uses Baku's calendar day, not UTC", () => {
    // 23:30 in Baku on Oct 21 (19:30 UTC) → tomorrow is Oct 22
    expect(tomorrowInBaku(new Date("2026-10-21T19:30:00Z"))).toBe("2026-10-22");
    // 00:30 in Baku on Oct 22 (20:30 UTC on Oct 21) → tomorrow is already Oct 23
    expect(tomorrowInBaku(new Date("2026-10-21T20:30:00Z"))).toBe("2026-10-23");
    // Month / year rollover
    expect(tomorrowInBaku(new Date("2026-12-31T10:00:00Z"))).toBe("2027-01-01");
  });
});

describe("selectNextDayAppointments", () => {
  const rows = [
    booking("2026-10-22", "15:00", "confirmed"),
    booking("2026-10-22", "09:30", "new"),
    booking("2026-10-22", "10:00", "cancelled"),
    booking("2026-10-22", "11:00", "no_show"),
    booking("2026-10-22", "12:00", "confirmed", { reminderSentAt: "2026-10-21T14:00:00Z" }),
    booking("2026-10-21", "16:00", "confirmed"), // today
    booking("2026-10-23", "09:00", "confirmed"), // day after tomorrow
  ];

  it("returns tomorrow's active, not-yet-reminded appointments sorted by time", () => {
    const picked = selectNextDayAppointments(rows, WED_10AM_BAKU);
    expect(picked.map((b) => `${b.time} ${b.status}`)).toEqual(["09:30 new", "15:00 confirmed"]);
  });

  it("can include already-reminded appointments (dashboard view)", () => {
    const picked = selectNextDayAppointments(rows, WED_10AM_BAKU, { includeAlreadyReminded: true });
    expect(picked.map((b) => b.time)).toEqual(["09:30", "12:00", "15:00"]);
  });
});

describe("runReminders", () => {
  function setup() {
    const store = new MemoryBookingStore();
    const notify = vi.fn(
      async (clinicSlug: string, kind: OutboxEntry["kind"], text: string): Promise<OutboxEntry> => ({
        id: "n",
        clinicSlug,
        kind,
        text,
        status: "simulated",
        at: "",
      }),
    );
    return { store, notify, deps: { store, notify, messaging: new WaLinkProvider(), demo: false } };
  }

  async function add(store: MemoryBookingStore, b: Booking) {
    const { id: _id, updatedAt: _u, reminderSentAt: _r, ...rest } = b;
    return store.create(rest);
  }

  it("prepares wa.me reminders, sends one staff digest and is idempotent", async () => {
    const { store, notify, deps } = setup();
    await add(store, booking("2026-10-22", "10:00", "confirmed", { name: "Aysel M.", locale: "az" }));
    await add(store, booking("2026-10-22", "11:00", "new", { name: "Анна К.", locale: "ru", phone: "+994551112233" }));
    await add(store, booking("2026-10-22", "12:00", "cancelled"));

    const [result] = await runReminders([clinic], WED_10AM_BAKU, deps);
    expect(result.date).toBe("2026-10-22");
    expect(result.reminders).toHaveLength(2);
    expect(result.reminders[0].link).toMatch(/^https:\/\/wa\.me\/994501234567\?text=/);
    expect(decodeURIComponent(result.reminders[0].link)).toContain("Salam, Aysel!");
    expect(decodeURIComponent(result.reminders[1].link)).toContain("Здравствуйте, Анна!");
    expect(result.reminders[1].link).toContain("wa.me/994551112233");

    expect(notify).toHaveBeenCalledOnce();
    const digest = notify.mock.calls[0][2];
    expect(digest).toContain("Aysel M.");
    expect(digest).toContain("https://wa.me/994501234567?text=");

    const rows = await store.list("test-clinic", { fromDate: "2026-10-22", toDate: "2026-10-22" });
    expect(rows.filter((b) => b.reminderSentAt).map((b) => b.time)).toEqual(["10:00", "11:00"]);

    const [second] = await runReminders([clinic], WED_10AM_BAKU, deps);
    expect(second.reminders).toHaveLength(0);
    expect(notify).toHaveBeenCalledOnce();
  });

  it("does nothing when there are no appointments tomorrow", async () => {
    const { notify, deps } = setup();
    const [result] = await runReminders([clinic], WED_10AM_BAKU, deps);
    expect(result.reminders).toEqual([]);
    expect(notify).not.toHaveBeenCalled();
  });
});

describe("reminder messages", () => {
  it("writes AZ by default and RU for Russian bookings, with clinic details", () => {
    const az = reminderText(booking("2026-10-22", "10:00", "confirmed", { name: "Rəşad Q." }), clinic);
    expect(az).toContain("Salam, Rəşad!");
    expect(az).toContain("Test Clinic");
    expect(az).toContain("10:00");
    expect(az).toContain("Test küç. 1, Bakı");
    const ru = reminderText(booking("2026-10-22", "10:00", "confirmed", { name: "Анна К.", locale: "ru" }), clinic);
    expect(ru).toContain("Здравствуйте, Анна!");
    expect(ru).toContain("ул. Тест, 1, Баку");
  });

  it("WhatsApp Cloud API provider posts a template message and falls back to a link on error", async () => {
    const cfg = { token: "tok", phoneNumberId: "123", templateName: "appointment_reminder", apiVersion: "v21.0" };
    const ok = vi.fn(async () => new Response("{}", { status: 200 }));
    const sent = await new WhatsAppCloudProvider(cfg, ok as unknown as typeof fetch).sendReminder(
      booking("2026-10-22", "10:00", "confirmed", { locale: "ru" }),
      clinic,
    );
    expect(sent.delivered).toBe(true);
    const [url, init] = ok.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://graph.facebook.com/v21.0/123/messages");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ to: "994501234567", type: "template", template: { name: "appointment_reminder", language: { code: "ru" } } });

    const failing = vi.fn(async () => new Response("bad", { status: 400 }));
    const fallback = await new WhatsAppCloudProvider(cfg, failing as unknown as typeof fetch).sendReminder(
      booking("2026-10-22", "10:00"),
      clinic,
    );
    expect(fallback.delivered).toBe(false);
    expect(fallback.link).toMatch(/^https:\/\/wa\.me\//);
    expect(fallback.error).toContain("400");
  });
});

describe("computeStats", () => {
  it("counts this week's bookings and the 30-day no-show rate", () => {
    const stats = computeStats(
      [
        booking("2026-10-19", "10:00", "confirmed"), // Mon this week, past
        booking("2026-10-20", "10:00", "no_show"), // Tue this week, past
        booking("2026-10-21", "16:00", "new"), // today
        booking("2026-10-25", "10:00", "cancelled"), // Sun this week, cancelled → not counted
        booking("2026-10-27", "10:00", "confirmed"), // next week
        booking("2026-09-01", "10:00", "no_show"), // outside 30-day window
      ],
      WED_10AM_BAKU,
    );
    expect(stats).toEqual({ bookingsThisWeek: 3, upcoming: 2, awaitingConfirmation: 1, noShowRate: 0.5 });
  });
});
