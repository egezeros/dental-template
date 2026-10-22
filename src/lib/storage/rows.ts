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
  /** JSON object; SQLite stores it as TEXT, Postgres as jsonb. Missing on pre-niche tables. */
  details?: Record<string, string> | string | null;
  followups?: Record<string, string> | string | null;
}

function parseJson(v: Record<string, string> | string | null | undefined): Record<string, string> | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const obj = typeof v === "string" ? (JSON.parse(v) as Record<string, string>) : v;
  return Object.keys(obj).length > 0 ? obj : undefined;
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
    details: b.details ?? null,
    followups: b.followUps ?? null,
  };
}

export function fromRow(r: BookingRow): Booking {
  const booking: Booking = {
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
  const details = parseJson(r.details);
  const followUps = parseJson(r.followups);
  if (details) booking.details = details;
  if (followUps) booking.followUps = followUps;
  return booking;
}
