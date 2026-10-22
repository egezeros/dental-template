import { WEEKDAYS, type Weekday } from "./i18n";

/** All clinics are in Baku. Asia/Baku is UTC+4 all year (no DST since 2016). */
export const CLINIC_TIME_ZONE = "Asia/Baku";

const ymd = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar date (YYYY-MM-DD) in Baku for the given instant. */
export function bakuDate(instant: Date = new Date()): string {
  return ymd.format(instant);
}

const hm = new Intl.DateTimeFormat("en-GB", {
  timeZone: CLINIC_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Wall-clock time (HH:MM) in Baku for the given instant. */
export function bakuTime(instant: Date = new Date()): string {
  return hm.format(instant);
}

/** Add whole days to a YYYY-MM-DD date string. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(date: string): Weekday {
  // getUTCDay: 0 = Sunday … 6 = Saturday
  const js = new Date(`${date}T12:00:00Z`).getUTCDay();
  return WEEKDAYS[(js + 6) % 7];
}

/** Monday of the week containing `date` (weeks start on Monday in Azerbaijan). */
export function startOfWeek(date: string): string {
  return addDays(date, -WEEKDAYS.indexOf(weekdayOf(date)));
}

export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Human-friendly date such as "22 oktyabr, cümə axşamı". */
export function formatDate(date: string, intlLocale: string): string {
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

/** Whole days from `from` to `to` (both YYYY-MM-DD); negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}
