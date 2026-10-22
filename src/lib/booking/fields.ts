import { isPlaceholder, type Clinic } from "../clinics/schema";
import type { Locale } from "../i18n";
import type { BookingFieldConfig, Niche } from "../niches/schema";
import type { Booking } from "./types";

/** Default (and maximum) length of short text fields such as a pet's name. */
export const TEXT_FIELD_MAX = 40;

/** A non-core booking field (text, select or specialist) resolved for one business. */
export interface ExtraField {
  id: string;
  type: "text" | "select" | "specialist";
  required: boolean;
  maxLength: number;
  /** Allowed values for select / specialist fields. */
  options: { value: string; label: Record<Locale, string> | string }[];
  config: BookingFieldConfig;
}

/** Specialists a visitor can pick: confirmed names only, never placeholders. */
export function bookableSpecialists(clinic: Clinic): string[] {
  return clinic.doctors.filter((d) => !isPlaceholder(d.name)).map((d) => d.name);
}

/**
 * The niche's extra booking fields for this business. A specialist field is dropped when the
 * business has no confirmed specialists, so visitors are never offered placeholder names.
 */
export function extraFields(clinic: Clinic, niche: Niche): ExtraField[] {
  const out: ExtraField[] = [];
  for (const f of niche.booking.fields) {
    if (f.type !== "text" && f.type !== "select" && f.type !== "specialist") continue;
    const options =
      f.type === "select"
        ? (f.options ?? []).map((o) => ({ value: o.value, label: o.label }))
        : f.type === "specialist"
          ? bookableSpecialists(clinic).map((name) => ({ value: name, label: name }))
          : [];
    if (f.type === "specialist" && options.length === 0) continue;
    out.push({ id: f.id, type: f.type, required: f.required, maxLength: f.maxLength ?? TEXT_FIELD_MAX, options, config: f });
  }
  return out;
}

/** Human-readable label/value pairs for a booking's extra fields (staff views and notifications). */
export function detailLines(
  booking: Pick<Booking, "details">,
  niche: Niche,
  locale: Locale,
  defaults: { specialist: string },
): { id: string; label: string; value: string }[] {
  if (!booking.details) return [];
  const lines: { id: string; label: string; value: string }[] = [];
  for (const f of niche.booking.fields) {
    const value = booking.details[f.id];
    if (!value) continue;
    const label = f.label?.[locale] ?? (f.type === "specialist" ? defaults.specialist : f.id);
    const option = f.type === "select" ? f.options?.find((o) => o.value === value) : undefined;
    lines.push({ id: f.id, label, value: option ? option.label[locale] : value });
  }
  return lines;
}
