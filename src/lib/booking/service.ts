import type { Clinic } from "../clinics/schema";
import { newBookingMessage } from "../notify/messages";
import type { OutboxEntry } from "../notify/telegram";
import type { BookingStore } from "../storage/types";
import type { Booking } from "./types";
import { validateBookingRequest, type BookingField } from "./validate";

export type CreateBookingResult =
  | { ok: true; booking: Booking | null; notification: OutboxEntry["status"] | null }
  | { ok: false; errors: Partial<Record<BookingField, true>> };

export interface CreateBookingDeps {
  store: BookingStore;
  notify: (clinicSlug: string, kind: OutboxEntry["kind"], html: string) => Promise<OutboxEntry>;
  adminUrl: string;
  demo: boolean;
  now?: Date;
}

/**
 * Validate → save → notify staff. The booking is saved before notifying so a
 * Telegram outage can never lose a patient's request.
 */
export async function createBooking(clinic: Clinic, body: unknown, deps: CreateBookingDeps): Promise<CreateBookingResult> {
  const result = validateBookingRequest(clinic, body, deps.now);
  if (!result.ok) return result;
  // Honeypot tripped: answer like a success so bots learn nothing, but store nothing.
  if (result.spam) return { ok: true, booking: null, notification: null };

  const booking = await deps.store.create(result.booking);
  const entry = await deps.notify(clinic.slug, "booking", newBookingMessage(booking, clinic, deps.adminUrl, deps.demo));
  return { ok: true, booking, notification: entry.status };
}
