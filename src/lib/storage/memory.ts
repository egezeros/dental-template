import { randomUUID } from "node:crypto";
import type { Booking, BookingStatus, NewBooking } from "../booking/types";
import { sortBookings, type BookingStore, type ListOptions } from "./types";

/**
 * In-memory store. Zero setup, but data lives only as long as the server process
 * (on Vercel: per serverless instance). Good for demos and tests.
 */
export class MemoryBookingStore implements BookingStore {
  readonly driver = "memory" as const;
  private rows = new Map<string, Booking>();

  async create(input: NewBooking): Promise<Booking> {
    const now = new Date().toISOString();
    const booking: Booking = {
      ...input,
      id: randomUUID(),
      status: input.status ?? "new",
      createdAt: input.createdAt ?? now,
      updatedAt: now,
      reminderSentAt: null,
    };
    this.rows.set(booking.id, booking);
    return { ...booking };
  }

  async list(clinicSlug: string, options: ListOptions = {}): Promise<Booking[]> {
    const rows = [...this.rows.values()].filter(
      (b) =>
        b.clinicSlug === clinicSlug &&
        (!options.fromDate || b.date >= options.fromDate) &&
        (!options.toDate || b.date <= options.toDate),
    );
    return sortBookings(rows.map((b) => ({ ...b })));
  }

  async updateStatus(clinicSlug: string, id: string, status: BookingStatus): Promise<Booking | null> {
    const row = this.rows.get(id);
    if (!row || row.clinicSlug !== clinicSlug) return null;
    row.status = status;
    row.updatedAt = new Date().toISOString();
    return { ...row };
  }

  async markReminderSent(clinicSlug: string, ids: string[], at: string): Promise<void> {
    for (const id of ids) {
      const row = this.rows.get(id);
      if (row && row.clinicSlug === clinicSlug) row.reminderSentAt = at;
    }
  }

  async count(clinicSlug: string): Promise<number> {
    let n = 0;
    for (const b of this.rows.values()) if (b.clinicSlug === clinicSlug) n++;
    return n;
  }
}
