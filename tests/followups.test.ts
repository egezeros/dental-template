import { describe, expect, it, vi } from "vitest";
import type { Booking, BookingStatus } from "@/lib/booking/types";
import { getClinics } from "@/lib/clinics/load";
import { computeFollowUps, countDueBack, followUpText, runFollowUps } from "@/lib/followups";
import { WaLinkProvider } from "@/lib/messaging";
import type { OutboxEntry } from "@/lib/notify/telegram";
import { buildDemoBookings } from "@/lib/storage/demo-seed";
import { MemoryBookingStore } from "@/lib/storage/memory";
import { addDays, bakuDate } from "@/lib/time";
import { testAestheticClinic, testClinic, testVetClinic, WED_10AM_BAKU } from "./fixtures";

const TODAY = bakuDate(WED_10AM_BAKU); // 2026-10-21
const day = (offset: number) => addDays(TODAY, offset);

let seq = 0;
function visit(date: string, extra: Partial<Booking> = {}, status: BookingStatus = "confirmed"): Booking {
  seq++;
  return {
    id: `v${seq}`,
    clinicSlug: "test-clinic",
    name: "Test Patient",
    phone: "+994501234567",
    serviceId: "consultation",
    serviceName: "Konsultasiya",
    date,
    time: "10:00",
    locale: "az",
    status,
    consentAt: "2026-01-01T00:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    reminderSentAt: null,
    source: "web",
    ...extra,
  };
}

const notify = () =>
  vi.fn(
    async (clinicSlug: string, kind: OutboxEntry["kind"], text: string): Promise<OutboxEntry> => ({
      id: "n",
      clinicSlug,
      kind,
      text,
      status: "simulated",
      at: "",
    }),
  );

describe("dental: 6-month check-up (interval rule)", () => {
  const clinic = testClinic();
  // niches/dental.json: afterDays 182, leadDays 7, stopAfterDays 30 (default)
  const run = (rows: Booking[]) => computeFollowUps(clinic, rows, WED_10AM_BAKU);

  it("is due 182 days after the last attended visit, from 7 days before", () => {
    const [f, ...rest] = run([visit(day(3 - 182))]);
    expect(rest).toHaveLength(0);
    expect(f).toMatchObject({ dueDate: day(3), notifyFrom: day(-4), state: "due", sentAt: null });
    expect(f.rule.id).toBe("checkup-6m");
  });

  it("uses the latest visit and ignores no-shows, cancellations and unconfirmed requests", () => {
    const rows = [
      visit(day(-400)),
      visit(day(2 - 182)),
      visit(day(-20), {}, "no_show"),
      visit(day(-15), {}, "cancelled"),
      visit(day(-10), {}, "new"),
    ];
    expect(run(rows).map((f) => f.dueDate)).toEqual([day(2)]);
  });

  it("drops a follow-up once the patient has booked again", () => {
    expect(run([visit(day(2 - 182)), visit(day(5), {}, "new")])).toHaveLength(0);
  });

  it("marks overdue items, gives up after stopAfterDays and looks 30 days ahead", () => {
    expect(run([visit(day(-10 - 182))])[0].state).toBe("overdue");
    expect(run([visit(day(-31 - 182))])).toHaveLength(0);
    expect(run([visit(day(20 - 182))])[0].state).toBe("upcoming");
    expect(run([visit(day(40 - 182))])).toHaveLength(0);
  });

  it("tracks patients separately and reads the sent marker from the visit", () => {
    const rows = [
      visit(day(1 - 182), { phone: "+994501111111", followUps: { "checkup-6m": "2026-10-20T10:00:00Z" } }),
      visit(day(2 - 182), { phone: "+994502222222", name: "Other Patient" }),
    ];
    const items = run(rows);
    expect(items.map((f) => f.sentAt)).toEqual(["2026-10-20T10:00:00Z", null]);
    expect(countDueBack(items)).toBe(2);
  });
});

describe("vet: vaccination and check-up reminders per pet", () => {
  const clinic = testVetClinic();
  const run = (rows: Booking[]) => computeFollowUps(clinic, rows, WED_10AM_BAKU);
  const pet = (petName: string, serviceId: string, date: string) =>
    visit(date, { clinicSlug: "test-vet", serviceId, details: { petName, species: "dog" } });

  it("keeps one owner's pets apart and matches rules by service category", () => {
    const items = run([
      pet("Bella", "vaccine", day(5 - 365)),
      pet("Max", "vaccine", day(6 - 365)),
      pet("Bella", "checkup", day(8 - 365)),
      pet("Bella", "surgery", day(4 - 365)), // no rule for surgery
    ]);
    expect(items.map((f) => `${f.rule.id}:${f.petName}:${f.state}`)).toEqual([
      "vaccination-annual:Bella:due",
      "vaccination-annual:Max:due",
      "checkup-annual:Bella:due",
    ]);
    expect(countDueBack(items)).toBe(2); // two pets
  });

  it("is answered by a new booking for the same pet only", () => {
    const rows = [pet("Bella", "vaccine", day(5 - 365)), pet("Max", "vaccine", day(5 - 365))];
    const bookedForMax = { ...pet("Max", "vaccine", day(3)), status: "new" as const };
    expect(run([...rows, bookedForMax]).map((f) => f.petName)).toEqual(["Bella"]);
  });

  it("writes the owner a message naming the pet, in their language", () => {
    const [f] = run([pet("Bella", "vaccine", day(5 - 365))]);
    const az = followUpText(f, clinic);
    expect(az).toContain("Salam, Test!");
    expect(az).toContain("Bella");
    expect(az).toContain("Test Clinic");
    const ru = followUpText(f, clinic, "ru");
    expect(ru).toContain("Здравствуйте, Test!");
    expect(ru).toContain("Bella");
  });
});

describe("aesthetic: next session of a treatment course", () => {
  const clinic = testAestheticClinic();
  // laser: 3 sessions, every 28 days; next-session rule leadDays 3
  const run = (rows: Booking[]) => computeFollowUps(clinic, rows, WED_10AM_BAKU);
  const laser = (date: string) => visit(date, { clinicSlug: "test-aesthetic", serviceId: "laser", serviceName: "Lazer" });

  it("reminds about session n+1 one interval after the last session", () => {
    const [f, ...rest] = run([laser(day(-54)), laser(day(-26))]);
    expect(rest).toHaveLength(0);
    expect(f).toMatchObject({ dueDate: day(2), state: "due", session: 3, sessions: 3 });
    expect(followUpText(f, clinic)).toContain("(3/3)");
  });

  it("stops when the course is complete and restarts after a long break", () => {
    expect(run([laser(day(-82)), laser(day(-54)), laser(day(-26))])).toHaveLength(0);
    const [f] = run([laser(day(-300)), laser(day(-26))]);
    expect(f.session).toBe(2);
  });

  it("ignores treatments that are not courses", () => {
    expect(run([visit(day(-26), { serviceId: "consultation" })])).toHaveLength(0);
  });
});

describe("runFollowUps", () => {
  it("sends due follow-ups once: wa.me message, one staff digest, then marked as sent", async () => {
    const clinic = testClinic();
    const store = new MemoryBookingStore();
    const base = {
      clinicSlug: "test-clinic",
      serviceId: "consultation",
      serviceName: "Konsultasiya",
      time: "10:00",
      consentAt: "2026-01-01T00:00:00Z",
      source: "web" as const,
      status: "confirmed" as const,
    };
    await store.create({ ...base, name: "Aysel Test", phone: "+994501111111", date: day(2 - 182), locale: "az" });
    await store.create({ ...base, name: "Анна Тест", phone: "+994502222222", date: day(-5 - 182), locale: "ru" });
    await store.create({ ...base, name: "Later Patient", phone: "+994503333333", date: day(20 - 182), locale: "en" });

    const deps = { store, messaging: new WaLinkProvider(), notify: notify(), demo: true };
    const [first] = await runFollowUps([clinic], WED_10AM_BAKU, deps);
    expect(first.sent.map((s) => s.followUp.name)).toEqual(["Анна Тест", "Aysel Test"]); // not the upcoming one
    expect(first.sent[0].message.link).toMatch(/^https:\/\/wa\.me\/994502222222\?text=/);
    expect(decodeURIComponent(first.sent[0].message.link)).toContain("Здравствуйте, Анна!");
    expect(deps.notify).toHaveBeenCalledTimes(1);
    expect(deps.notify.mock.calls[0][1]).toBe("followup-digest");
    expect(deps.notify.mock.calls[0][2]).toContain("Aysel Test");

    const [second] = await runFollowUps([clinic], WED_10AM_BAKU, deps);
    expect(second.sent).toHaveLength(0);
    expect(deps.notify).toHaveBeenCalledTimes(1);
    const items = computeFollowUps(clinic, await store.list("test-clinic"), WED_10AM_BAKU);
    expect(items.filter((f) => f.sentAt).map((f) => f.name).sort()).toEqual(["Aysel Test", "Анна Тест"]);
  });
});

describe("demo mode", () => {
  it.each(getClinics().map((c) => [c.slug, c] as const))("%s: seeded mock data shows due and upcoming follow-ups", (_slug, c) => {
    const rows: Booking[] = buildDemoBookings(c, WED_10AM_BAKU).map((b) => ({
      ...b,
      status: b.status ?? "new",
      createdAt: b.createdAt ?? "",
      updatedAt: "",
      reminderSentAt: null,
    }));
    const items = computeFollowUps(c, rows, WED_10AM_BAKU);
    expect(new Set(items.map((f) => f.state))).toEqual(new Set(["overdue", "due", "upcoming"]));
    expect(countDueBack(items)).toBeGreaterThan(0);
    if (c.niche === "vet") expect(items.every((f) => f.petName)).toBe(true);
    if (c.niche === "aesthetic") expect(items.some((f) => f.session && f.sessions)).toBe(true);
  });
});
