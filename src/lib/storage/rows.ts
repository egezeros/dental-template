import type { Booking } from "../booking/types";

/** Database row shape (snake_case), shared by the SQLite and Supabase adapters. */
export interface BookingRow {
  id: string;
  clinic_slug: string;
  name: string;
  phone: string;
  service_id: string;
  service_name: string;
  date: string;
  time: string;
  locale: string;
  status: string;
  consent_at: string;
  created_at: string;
  updated_at: string;
  reminder_sent_at: string | null;
  source: string;
}

export function toRow(b: Booking): BookingRow {
  return {
    id: b.id,
    clinic_slug: b.clinicSlug,
    name: b.name,
    phone: b.phone,
    service_id: b.serviceId,
    service_name: b.serviceName,
    date: b.date,
    time: b.time,
    locale: b.locale,
    status: b.status,
    consent_at: b.consentAt,
    created_at: b.createdAt,
    updated_at: b.updatedAt,
    reminder_sent_at: b.reminderSentAt,
    source: b.source,
  };
}

export function fromRow(r: BookingRow): Booking {
  return {
    id: r.id,
    clinicSlug: r.clinic_slug,
    name: r.name,
    phone: r.phone,
    serviceId: r.service_id,
    serviceName: r.service_name,
    date: String(r.date).slice(0, 10),
    time: String(r.time).slice(0, 5),
    locale: r.locale as Booking["locale"],
    status: r.status as Booking["status"],
    consentAt: r.consent_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    reminderSentAt: r.reminder_sent_at,
    source: r.source as Booking["source"],
  };
}
