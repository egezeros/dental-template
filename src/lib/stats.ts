import type { Booking } from "./booking/types";
import { REMINDABLE_STATUSES } from "./reminders";
import { addDays, bakuDate, startOfWeek } from "./time";

export interface DashboardStats {
  /** Appointments scheduled this calendar week (Mon–Sun, Baku), excluding cancelled. */
  bookingsThisWeek: number;
  /** Future appointments still expected (new or confirmed). */
  upcoming: number;
  /** Upcoming appointments not yet confirmed by staff. */
  awaitingConfirmation: number;
  /** no_show / (no_show + confirmed) for appointments in the last 30 days; null without data. */
  noShowRate: number | null;
}

export function computeStats(bookings: Booking[], now: Date = new Date()): DashboardStats {
  const today = bakuDate(now);
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const windowStart = addDays(today, -30);

  let bookingsThisWeek = 0;
  let upcoming = 0;
  let awaitingConfirmation = 0;
  let noShows = 0;
  let attendedOrExpected = 0;

  for (const b of bookings) {
    if (b.date >= weekStart && b.date <= weekEnd && b.status !== "cancelled") bookingsThisWeek++;
    if (b.date >= today && REMINDABLE_STATUSES.includes(b.status)) {
      upcoming++;
      if (b.status === "new") awaitingConfirmation++;
    }
    if (b.date >= windowStart && b.date < today) {
      if (b.status === "no_show") noShows++;
      if (b.status === "confirmed") attendedOrExpected++;
    }
  }
  const denominator = noShows + attendedOrExpected;
  return {
    bookingsThisWeek,
    upcoming,
    awaitingConfirmation,
    noShowRate: denominator === 0 ? null : noShows / denominator,
  };
}
