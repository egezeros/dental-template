import type { Locale } from "../i18n";

export const BOOKING_STATUSES = ["new", "confirmed", "cancelled", "no_show"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/**
 * A booking request. Deliberately holds NO medical or health information:
 * only what is needed to call the patient back and schedule the visit.
 */
export interface Booking {
  id: string;
  clinicSlug: string;
  name: string;
  /** E.164, e.g. +994501234567 */
  phone: string;
  serviceId: string;
  /** Service name at booking time, in the patient's language. */
  serviceName: string;
  /** Preferred date in Baku time, YYYY-MM-DD */
  date: string;
  /** Preferred time in Baku time, HH:MM */
  time: string;
  locale: Locale;
  status: BookingStatus;
  consentAt: string;
  createdAt: string;
  updatedAt: string;
  reminderSentAt: string | null;
  /** "demo" for seeded mock rows, "web" for real form submissions. */
  source: "web" | "demo";
}

export type NewBooking = Omit<Booking, "id" | "status" | "createdAt" | "updatedAt" | "reminderSentAt"> & {
  status?: BookingStatus;
  createdAt?: string;
};
