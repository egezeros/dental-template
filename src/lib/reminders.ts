import type { Booking, BookingStatus } from "./booking/types";
import type { Clinic } from "./clinics/schema";
import type { MessagingProvider, PreparedReminder } from "./messaging";
import { reminderDigestMessages } from "./notify/messages";
import type { OutboxEntry } from "./notify/telegram";
import type { BookingStore } from "./storage/types";
import { addDays, bakuDate, zonedDate } from "./time";

/** Statuses that still expect the patient to show up. */
export const REMINDABLE_STATUSES: readonly BookingStatus[] = ["new", "confirmed"];

export function tomorrowInBaku(now: Date): string {
  return addDays(bakuDate(now), 1);
}

/** Tomorrow's calendar date in a business's time zone. */
export function tomorrowIn(now: Date, timeZone: string): string {
  return addDays(zonedDate(now, timeZone), 1);
}

/**
 * Pick the bookings that need a reminder: appointments on the next calendar day
 * (Baku time), still active, and not reminded yet. Sorted by appointment time.
 */
export function selectNextDayAppointments(
  bookings: Booking[],
  now: Date,
  options: { includeAlreadyReminded?: boolean; timeZone?: string } = {},
): Booking[] {
  const tomorrow = options.timeZone ? tomorrowIn(now, options.timeZone) : tomorrowInBaku(now);
  return bookings
    .filter(
      (b) =>
        b.date === tomorrow &&
        REMINDABLE_STATUSES.includes(b.status) &&
        (options.includeAlreadyReminded || !b.reminderSentAt),
    )
    .sort((a, b) => a.time.localeCompare(b.time));
}

export interface ReminderRunResult {
  clinicSlug: string;
  date: string;
  reminders: PreparedReminder[];
  notifications: OutboxEntry["status"][];
}

export interface ReminderDeps {
  store: BookingStore;
  messaging: MessagingProvider;
  notify: (clinicSlug: string, kind: OutboxEntry["kind"], html: string) => Promise<OutboxEntry>;
  demo: boolean;
}

/**
 * The daily reminder job: for each clinic, find tomorrow's appointments, prepare a
 * patient reminder for each (wa.me link or WhatsApp API send), send staff one Telegram
 * digest, and mark the bookings as reminded so a re-run does not duplicate them.
 */
export async function runReminders(clinics: Clinic[], now: Date, deps: ReminderDeps): Promise<ReminderRunResult[]> {
  const results: ReminderRunResult[] = [];
  for (const clinic of clinics) {
    const date = tomorrowIn(now, clinic.timeZone);
    const rows = await deps.store.list(clinic.slug, { fromDate: date, toDate: date });
    const due = selectNextDayAppointments(rows, now, { timeZone: clinic.timeZone });
    if (due.length === 0) {
      results.push({ clinicSlug: clinic.slug, date, reminders: [], notifications: [] });
      continue;
    }
    const reminders = await Promise.all(due.map((b) => deps.messaging.sendReminder(b, clinic)));
    const items = due.map((booking, i) => ({ booking, reminder: reminders[i] }));
    const notifications: OutboxEntry["status"][] = [];
    for (const html of reminderDigestMessages(clinic, date, items, deps.demo)) {
      notifications.push((await deps.notify(clinic.slug, "reminder-digest", html)).status);
    }
    await deps.store.markReminderSent(
      clinic.slug,
      due.map((b) => b.id),
      now.toISOString(),
    );
    results.push({ clinicSlug: clinic.slug, date, reminders, notifications });
  }
  return results;
}
