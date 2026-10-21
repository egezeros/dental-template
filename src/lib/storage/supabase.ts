import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Booking, BookingStatus, NewBooking } from "../booking/types";
import { fromRow, type BookingRow } from "./rows";
import { type BookingStore, type ListOptions } from "./types";

const TABLE = "bookings";

/**
 * Supabase (Postgres) store. Uses the service-role key on the server only; the table
 * has Row Level Security enabled with no public policies (see supabase/schema.sql),
 * so browsers can never read bookings directly.
 */
export class SupabaseBookingStore implements BookingStore {
  readonly driver = "supabase" as const;
  private client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  }

  async create(input: NewBooking): Promise<Booking> {
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        clinic_slug: input.clinicSlug,
        name: input.name,
        phone: input.phone,
        service_id: input.serviceId,
        service_name: input.serviceName,
        date: input.date,
        time: input.time,
        locale: input.locale,
        status: input.status ?? "new",
        consent_at: input.consentAt,
        source: input.source,
        ...(input.createdAt ? { created_at: input.createdAt } : {}),
      })
      .select()
      .single();
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return fromRow(data as BookingRow);
  }

  async list(clinicSlug: string, options: ListOptions = {}): Promise<Booking[]> {
    let q = this.client.from(TABLE).select("*").eq("clinic_slug", clinicSlug);
    if (options.fromDate) q = q.gte("date", options.fromDate);
    if (options.toDate) q = q.lte("date", options.toDate);
    const { data, error } = await q.order("date").order("time").order("created_at").limit(2000);
    if (error) throw new Error(`Supabase select failed: ${error.message}`);
    return (data as BookingRow[]).map(fromRow);
  }

  async updateStatus(clinicSlug: string, id: string, status: BookingStatus): Promise<Booking | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("clinic_slug", clinicSlug)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`Supabase update failed: ${error.message}`);
    return data ? fromRow(data as BookingRow) : null;
  }

  async markReminderSent(clinicSlug: string, ids: string[], at: string): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await this.client
      .from(TABLE)
      .update({ reminder_sent_at: at })
      .eq("clinic_slug", clinicSlug)
      .in("id", ids);
    if (error) throw new Error(`Supabase update failed: ${error.message}`);
  }

  async count(clinicSlug: string): Promise<number> {
    const { count, error } = await this.client
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .eq("clinic_slug", clinicSlug);
    if (error) throw new Error(`Supabase count failed: ${error.message}`);
    return count ?? 0;
  }
}
