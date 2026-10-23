import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { normalizePhone, validateBookingRequest } from "@/lib/booking/validate";
import { getClinic, parseClinic } from "@/lib/clinics/load";
import { computeFollowUps, followUpText } from "@/lib/followups";
import { getNiche } from "@/lib/niches/load";
import { reminderText } from "@/lib/messaging/templates";
import { staffLocale } from "@/lib/notify/messages";
import { buildDemoBookings } from "@/lib/storage/demo-seed";
import { zonedDate, zonedTime } from "@/lib/time";

const barber = () => getClinic("efendi-erkek-kuaforu")!;
// 2026-10-21 20:30 UTC = 23:30 in Ankara (UTC+3) but already 00:30 on the 22nd in Baku (UTC+4).
const LATE_EVENING = new Date("2026-10-21T20:30:00Z");

describe("Turkish phone numbers", () => {
  it.each([
    ["0532 123 45 67", "+905321234567"],
    ["532 123 45 67", "+905321234567"],
    ["+90 532 123 45 67", "+905321234567"],
    ["0090 532 123 45 67", "+905321234567"],
    ["0312 466 22 77", "+903124662277"],
  ])("%s → %s", (input, expected) => {
    expect(normalizePhone(input, "TR")).toBe(expected);
  });

  it("still reads Azerbaijani numbers the old way and rejects bad ones", () => {
    expect(normalizePhone("050 123 45 67")).toBe("+994501234567");
    expect(normalizePhone("050 123 45 67", "TR")).toBeNull();
    expect(normalizePhone("0532 123 45", "TR")).toBeNull();
  });
});

describe("time zones", () => {
  it("each business uses its own calendar day", () => {
    expect(zonedDate(LATE_EVENING, "Europe/Istanbul")).toBe("2026-10-21");
    expect(zonedTime(LATE_EVENING, "Europe/Istanbul")).toBe("23:30");
    expect(zonedDate(LATE_EVENING, "Asia/Baku")).toBe("2026-10-22");
  });

  it("booking 'today' follows the business's time zone", () => {
    const body = { name: "Mehmet", phone: "0532 123 45 67", serviceId: "custom-cut", date: "2026-10-22", time: "11:00", consent: true };
    const ok = validateBookingRequest(barber(), body, LATE_EVENING);
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.booking.phone).toBe("+905321234567");
    expect(ok.booking.locale).toBe("tr"); // default language of the business
    // "Today" in Ankara is still the 21st, so the 21st is not yet in the past.
    expect(validateBookingRequest(barber(), { ...body, date: "2026-10-21", time: "10:00" }, LATE_EVENING)).toMatchObject({
      ok: false,
      errors: { time: true },
    });
  });
});

describe("Turkish businesses", () => {
  it("must provide every text in each of their languages, including their niche's", () => {
    const raw = JSON.parse(fs.readFileSync("clinics/efendi-erkek-kuaforu.json", "utf8"));
    raw.tagline = { tr: "Sadece Türkçe" };
    expect(() => parseClinic(raw, "efendi-erkek-kuaforu.json")).toThrow(/tagline has no text for tr\/en/);
    const dental = JSON.parse(fs.readFileSync("clinics/dent-star.json", "utf8"));
    dental.locales = ["tr"];
    expect(() => parseClinic(dental, "dent-star.json")).toThrow(/niches\/dental\.json/);
  });

  it("send reminders and follow-ups in Turkish, and staff messages in the business's language", () => {
    const c = barber();
    const [visit] = buildDemoBookings(c, new Date("2026-10-21T06:00:00Z"));
    expect(visit.phone).toMatch(/^\+90500000/);
    const booking = { ...visit, status: "confirmed" as const, createdAt: "", updatedAt: "", reminderSentAt: null };
    expect(reminderText({ ...booking, locale: "tr" }, c)).toMatch(/^Merhaba .*randevunuzu hatırlatırız/);
    expect(staffLocale(c)).toBe("tr");

    // Barbers and salons have no follow-up rules until real businesses give us their customers' rhythm.
    const now = new Date("2026-10-21T06:00:00Z");
    expect(computeFollowUps(c, [{ ...booking, date: "2026-08-01" }], now)).toEqual([]);

    // A rule added later is sent in Turkish.
    const rule = {
      id: "next-cut",
      type: "interval" as const,
      label: { tr: "Tıraş", en: "Cut" },
      afterDays: 26,
      leadDays: 2,
      stopAfterDays: 21,
      per: "patient" as const,
      match: {},
      message: { tr: "Merhaba {firstName}! {clinic} sizi bekliyor: {phone}.", en: "Hi {firstName}!" },
    };
    const base = getNiche("barber");
    const niche = { ...base, reminders: { ...base.reminders, followUps: [rule] } };
    const items = computeFollowUps(c, [{ ...booking, date: "2026-09-25" }], now, { niche });
    expect(items.map((f) => [f.rule.id, f.dueDate, f.state])).toEqual([["next-cut", "2026-10-21", "due"]]);
    expect(followUpText(items[0], c, "tr")).toMatch(/^Merhaba .+! Efendi Erkek Kuaförü sizi bekliyor: /);
  });
});
