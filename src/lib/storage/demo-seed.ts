import { createHash } from "node:crypto";
import type { BookingStatus, DemoBooking } from "../booking/types";
import { demoWhatsAppOverride } from "../config";
import type { Clinic } from "../clinics/schema";
import { slotsForDate } from "../clinics/slots";
import { tr, type Locale } from "../i18n";
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

export function buildDemoBookings(clinic: Clinic, now: Date = new Date()): DemoBooking[] {
  const today = bakuDate(now);
  const override = demoWhatsAppOverride();
  const out: DemoBooking[] = [];
  PLAN.forEach(([offset, slotIndex, status], i) => {
    // Move forward to the next day the clinic is open.
    let date = addDays(today, offset);
    let slots = slotsForDate(clinic, date);
    for (let guard = 0; slots.length === 0 && guard < 7; guard++) {
      date = addDays(date, 1);
      slots = slotsForDate(clinic, date);
    }
    if (slots.length === 0) return;
    const time = slots[Math.min(slotIndex, slots.length - 1)];
    const patient = PATIENTS[i % PATIENTS.length];
    const service = clinic.services[i % clinic.services.length];
    const createdAt = new Date(now.getTime() - (Math.max(1, 3 - offset) * 24 + i) * 3600_000).toISOString();
    out.push({
      id: demoBookingId(clinic.slug, today, i),
      clinicSlug: clinic.slug,
      name: patient.name,
      phone: override ? `+${override}` : `+9945000000${String(i + 1).padStart(2, "0")}`,
      serviceId: service.id,
      serviceName: tr(service.name, patient.locale),
      date,
      time,
      locale: patient.locale,
      status,
      consentAt: createdAt,
      createdAt,
      source: "demo",
    });
  });
  return out;
}
