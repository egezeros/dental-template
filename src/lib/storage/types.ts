import type { Booking, BookingStatus, NewBooking } from "../booking/types";

export interface ListOptions {
  /** Inclusive YYYY-MM-DD bounds on the appointment date. */
  fromDate?: string;
  toDate?: string;
}

/**
 * Storage adapter. Implementations: Supabase (production), SQLite (local, persistent),
 * in-memory (demo / zero-setup). Every method is scoped to one clinic.
 */
export interface BookingStore {
  readonly driver: "supabase" | "sqlite" | "memory";
  create(input: NewBooking): Promise<Booking>;
  list(clinicSlug: string, options?: ListOptions): Promise<Booking[]>;
  updateStatus(clinicSlug: string, id: string, status: BookingStatus): Promise<Booking | null>;
  markReminderSent(clinicSlug: string, ids: string[], at: string): Promise<void>;
  /** Number of bookings stored for a clinic (used to decide whether to seed demo data). */
  count(clinicSlug: string): Promise<number>;
}

export function sortBookings(rows: Booking[]): Booking[] {
  return rows.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time) || a.createdAt.localeCompare(b.createdAt));
}
