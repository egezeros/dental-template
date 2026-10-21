import type { Booking, BookingStatus, DemoBooking, NewBooking } from "../booking/types";

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
  /** Number of bookings stored for a clinic. */
  count(clinicSlug: string): Promise<number>;
  /**
   * Make the clinic's demo rows exactly `rows`: delete demo rows not in the list and insert
   * missing ones, keeping existing ones (and any status changes made to them). Real bookings
   * (source "web") are never touched.
   */
  replaceDemoBookings(clinicSlug: string, rows: DemoBooking[]): Promise<void>;
}

export function sortBookings(rows: Booking[]): Booking[] {
  return rows.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time) || a.createdAt.localeCompare(b.createdAt));
}
