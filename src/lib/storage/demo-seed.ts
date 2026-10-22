import { createHash } from "node:crypto";
import { extraFields } from "../booking/fields";
import type { BookingStatus, DemoBooking } from "../booking/types";
import { demoWhatsAppOverride } from "../config";
import type { Clinic, ClinicService } from "../clinics/schema";
import { slotsForDate } from "../clinics/slots";
import { tr, type Locale } from "../i18n";
import { getNiche } from "../niches/load";
import type { FollowUpRule, Niche } from "../niches/schema";
import { addDays, bakuDate } from "../time";

/**
 * Fictional patients for demo mode. Names are invented; phone numbers use the
 * unassigned +994 50 000 00 xx range unless DEMO_WHATSAPP_NUMBER is set, in which
 * case every demo patient gets that number so reminders can be tried on your own phone.
 */
const PATIENTS: { name: string; locale: Locale }[] = [
  { name: "Aysel M. (demo)", locale: "az" },
  { name: "Rəşad Q. (demo)", locale: "az" },
  { name: "Анна К. (демо)", locale: "ru" },
  { name: "Leyla H. (demo)", locale: "az" },
  { name: "Elvin A. (demo)", locale: "az" },
  { name: "Тимур Р. (демо)", locale: "ru" },
  { name: "Nigar S. (demo)", locale: "az" },
  { name: "Murad İ. (demo)", locale: "az" },
  { name: "Sevinc T. (demo)", locale: "az" },
  { name: "Ольга В. (демо)", locale: "ru" },
  { name: "Kamran B. (demo)", locale: "az" },
  { name: "Emma J. (demo)", locale: "en" },
];

/** More fictional people, used for the past visits that drive the follow-up demo. */
const HISTORY_PATIENTS: { name: string; locale: Locale }[] = [
  { name: "Günel R. (demo)", locale: "az" },
  { name: "Сергей Л. (демо)", locale: "ru" },
  { name: "Orxan K. (demo)", locale: "az" },
  { name: "Lalə N. (demo)", locale: "az" },
  { name: "Мария С. (демо)", locale: "ru" },
  { name: "Fərid Ə. (demo)", locale: "az" },
  { name: "Aytən M. (demo)", locale: "az" },
  { name: "Zaur H. (demo)", locale: "az" },
];

/** Follow-up demo: due dates relative to today (overdue, due now, coming up). */
const DUE_OFFSETS = [-3, 2, 12];

/** [day offset from today, slot index, status] */
const PLAN: [number, number, BookingStatus][] = [
  [-12, 2, "confirmed"],
  [-9, 4, "no_show"],
  [-6, 1, "confirmed"],
  [-4, 6, "cancelled"],
  [-3, 3, "confirmed"],
  [-2, 8, "no_show"],
  [-1, 5, "confirmed"],
  [0, 10, "confirmed"],
  [1, 1, "confirmed"],
  [1, 4, "new"],
  [1, 9, "confirmed"],
  [3, 2, "new"],
];

/**
 * Stable UUID for a demo row, derived from clinic, day and position. Every server instance
 * computes the same IDs, so seeding from several instances never creates duplicates.
 */
export function demoBookingId(clinicSlug: string, day: string, index: number): string {
  const h = createHash("sha1").update(`demo|${clinicSlug}|${day}|${index}`).digest("hex");
  const variant = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** The first day on or after `date` that has bookable slots, with its slots. */
function openDay(clinic: Clinic, date: string): { date: string; slots: string[] } | null {
  let d = date;
  for (let guard = 0; guard < 8; guard++, d = addDays(d, 1)) {
    const slots = slotsForDate(clinic, d);
    if (slots.length > 0) return { date: d, slots };
  }
  return null;
}

/** Plausible values for the niche's extra booking fields (pet name, species, specialist). */
function demoDetails(clinic: Clinic, niche: Niche, i: number): Record<string, string> | undefined {
  const details: Record<string, string> = {};
  for (const f of extraFields(clinic, niche)) {
    const pool = f.type === "text" ? niche.demo.values[f.id] : f.options.map((o) => o.value);
    if (pool?.length) details[f.id] = pool[i % pool.length];
  }
  return Object.keys(details).length > 0 ? details : undefined;
}

function servicesForRule(rule: FollowUpRule, clinic: Clinic): ClinicService[] {
  return clinic.services.filter(
    (s) =>
      (!rule.match.services?.length || rule.match.services.includes(s.id)) &&
      (!rule.match.categories?.length || (s.category !== undefined && rule.match.categories.includes(s.category))) &&
      (rule.type === "interval" || s.course !== undefined),
  );
}

export function buildDemoBookings(clinic: Clinic, now: Date = new Date()): DemoBooking[] {
  const today = bakuDate(now);
  const override = demoWhatsAppOverride();
  const niche = getNiche(clinic.niche);
  const out: DemoBooking[] = [];
  const add = (
    index: number,
    patient: { name: string; locale: Locale },
    phone: string,
    service: ClinicService,
    day: { date: string; slots: string[] },
    slotIndex: number,
    status: BookingStatus,
    createdAt: string,
    details: Record<string, string> | undefined,
  ) =>
    out.push({
      id: demoBookingId(clinic.slug, today, index),
      clinicSlug: clinic.slug,
      name: patient.name,
      phone: override ? `+${override}` : phone,
      serviceId: service.id,
      serviceName: tr(service.name, patient.locale),
      date: day.date,
      time: day.slots[Math.min(slotIndex, day.slots.length - 1)],
      locale: patient.locale,
      status,
      consentAt: createdAt,
      createdAt,
      source: "demo",
      ...(details ? { details } : {}),
    });

  PLAN.forEach(([offset, slotIndex, status], i) => {
    // Move forward to the next day the clinic is open.
    const day = openDay(clinic, addDays(today, offset));
    if (!day) return;
    const createdAt = new Date(now.getTime() - (Math.max(1, 3 - offset) * 24 + i) * 3600_000).toISOString();
    const phone = `+9945000000${String(i + 1).padStart(2, "0")}`;
    add(i, PATIENTS[i % PATIENTS.length], phone, clinic.services[i % clinic.services.length], day, slotIndex, status, createdAt, demoDetails(clinic, niche, i));
  });

  // Past attended visits that make the niche's follow-up rules fire: one person overdue,
  // one due now and one coming up per rule (two earlier sessions for course treatments).
  let h = 0;
  for (const rule of niche.reminders.followUps) {
    const services = servicesForRule(rule, clinic);
    if (services.length === 0) continue;
    DUE_OFFSETS.forEach((dueOffset, k) => {
      const service = services[k % services.length];
      const interval = rule.type === "interval" ? rule.afterDays : service.course!.intervalDays;
      const patient = HISTORY_PATIENTS[h % HISTORY_PATIENTS.length];
      const phone = `+9945000001${String(h + 1).padStart(2, "0")}`;
      const details = demoDetails(clinic, niche, h + 3);
      const visits = rule.type === "course" ? [2 * interval, interval] : [interval];
      for (const [v, daysBefore] of visits.entries()) {
        const day = openDay(clinic, addDays(today, dueOffset - daysBefore));
        if (!day) continue;
        const createdAt = new Date(`${addDays(day.date, -3)}T08:00:00Z`).toISOString();
        add(100 + h * 4 + v, patient, phone, service, day, 2 + k, "confirmed", createdAt, details);
      }
      h++;
    });
  }
  return out;
}
