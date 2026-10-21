import { z } from "zod";
import type { Clinic } from "../clinics/schema";
import { slotsForDate } from "../clinics/slots";
import { isLocale, tr, type Locale } from "../i18n";
import { addDays, bakuDate, bakuTime, isValidDate } from "../time";
import type { NewBooking } from "./types";

/** How far ahead patients may request an appointment. */
export const MAX_DAYS_AHEAD = 120;

export type BookingField = "name" | "phone" | "service" | "date" | "time" | "consent";

export type ValidationResult =
  | { ok: true; booking: NewBooking; spam: boolean }
  | { ok: false; errors: Partial<Record<BookingField, true>> };

/**
 * Normalise an Azerbaijani or international phone number to E.164.
 * Accepts "050 123 45 67", "50-123-45-67", "+994 50 123 45 67", "00994…", "+7 …".
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!/^[+\d\s\-().]+$/.test(trimmed)) return null;
  const hasPlus = trimmed.startsWith("+");
  const d = trimmed.replace(/\D/g, "");
  if (hasPlus) {
    if (d.startsWith("994")) return /^994\d{9}$/.test(d) ? `+${d}` : null;
    return /^\d{8,15}$/.test(d) ? `+${d}` : null;
  }
  if (/^00\d{8,15}$/.test(d)) return normalizePhone(`+${d.slice(2)}`);
  if (/^994\d{9}$/.test(d)) return `+${d}`;
  if (/^0\d{9}$/.test(d)) return `+994${d.slice(1)}`;
  if (/^\d{9}$/.test(d)) return `+994${d}`;
  return null;
}

/**
 * The request body accepted from the public form. Unknown keys are stripped, so even
 * if someone posts extra fields (e.g. symptoms), nothing beyond this list is stored.
 */
const requestSchema = z.object({
  name: z.string().default(""),
  phone: z.string().default(""),
  serviceId: z.string().default(""),
  date: z.string().default(""),
  time: z.string().default(""),
  consent: z.union([z.boolean(), z.literal("on"), z.literal("true")]).optional(),
  locale: z.string().optional(),
  /** Honeypot: hidden from humans; bots tend to fill it. */
  company: z.string().optional(),
});

export function validateBookingRequest(clinic: Clinic, body: unknown, now: Date = new Date()): ValidationResult {
  const parsed = requestSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return { ok: false, errors: { name: true, phone: true, service: true, date: true, time: true, consent: true } };
  }
  const input = parsed.data;
  const errors: Partial<Record<BookingField, true>> = {};

  const name = input.name.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80 || /[<>{}]/.test(name) || /\d{3,}/.test(name)) errors.name = true;

  const phone = normalizePhone(input.phone);
  if (!phone) errors.phone = true;

  const service = clinic.services.find((s) => s.id === input.serviceId);
  if (!service) errors.service = true;

  const today = bakuDate(now);
  const dateOk = isValidDate(input.date) && input.date >= today && input.date <= addDays(today, MAX_DAYS_AHEAD);
  if (!dateOk) errors.date = true;

  if (dateOk) {
    const slots = slotsForDate(clinic, input.date);
    const inPast = input.date === today && input.time <= bakuTime(now);
    if (!slots.includes(input.time) || inPast) errors.time = true;
  } else if (!/^\d{2}:\d{2}$/.test(input.time)) {
    errors.time = true;
  }

  const consent = input.consent === true || input.consent === "on" || input.consent === "true";
  if (!consent) errors.consent = true;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const locale: Locale = isLocale(input.locale) ? input.locale : "az";
  return {
    ok: true,
    spam: Boolean(input.company && input.company.trim()),
    booking: {
      clinicSlug: clinic.slug,
      name,
      phone: phone!,
      serviceId: service!.id,
      serviceName: tr(service!.name, locale),
      date: input.date,
      time: input.time,
      locale,
      consentAt: now.toISOString(),
      source: "web",
    },
  };
}
