import { WEEKDAYS, type Weekday } from "../i18n";
import { fromMinutes, toMinutes, weekdayOf } from "../time";
import { PLACEHOLDER, type Clinic } from "./schema";

const FALLBACK_WINDOW: [string, string] = ["09:00", "19:00"];
const DEFAULT_STEP = 30;

function window(clinic: Clinic, day: Weekday): [string, string] | null {
  if (clinic.bookingSlots) return [clinic.bookingSlots.start, clinic.bookingSlots.end];
  if (clinic.hours === PLACEHOLDER) return FALLBACK_WINDOW;
  const h = clinic.hours[day];
  // Unknown day: don't offer online slots rather than guess.
  return h === PLACEHOLDER ? null : h;
}

/** Bookable start times for a weekday. The last slot starts one step before closing. */
export function slotsForWeekday(clinic: Clinic, day: Weekday): string[] {
  const w = window(clinic, day);
  if (!w) return [];
  const step = clinic.bookingSlots?.stepMinutes ?? DEFAULT_STEP;
  const start = toMinutes(w[0]);
  const end = toMinutes(w[1]);
  const slots: string[] = [];
  for (let t = start; t + step <= end; t += step) slots.push(fromMinutes(t));
  return slots;
}

export function slotsForDate(clinic: Clinic, date: string): string[] {
  return slotsForWeekday(clinic, weekdayOf(date));
}

export function slotsByWeekday(clinic: Clinic): Record<Weekday, string[]> {
  return Object.fromEntries(WEEKDAYS.map((d) => [d, slotsForWeekday(clinic, d)])) as Record<Weekday, string[]>;
}
