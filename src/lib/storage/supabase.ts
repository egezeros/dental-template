import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Booking, BookingStatus, DemoBooking, NewBooking } from "../booking/types";
import { postgresUrl } from "../config";
import { fromRow, type BookingRow } from "./rows";
import { type BookingStore, type FollowUpMark, type ListOptions } from "./types";

const TABLE = "bookings";

class SupabaseError extends Error {
  constructor(
    readonly code: string | undefined,
    message: string,
  ) {
    super(message);
  }
}

function fail(action: string, error: { code?: string; message: string }): never {
  throw new SupabaseError(error.code, `Supabase ${action} failed: ${error.message}`);
}

/** PostgREST's answers when the table hasn't been created yet. */
export function isMissingTable(err: unknown): boolean {
  if (!(err instanceof SupabaseError)) return false;
  return err.code === "PGRST205" || err.code === "42P01" || /does not exist|schema cache/i.test(err.message);
}

/** A table created before the multi-niche columns (details, followups) were added. */
export function isMissingColumn(err: unknown): boolean {
  if (!(err instanceof SupabaseError)) return false;
  return err.code === "PGRST204" || err.code === "42703" || /column .* does not exist|find the '.*' column/i.test(err.message);
}

/**
 * Create or upgrade the table from supabase/schema.sql (idempotent) over a direct Postgres
 * connection. Vercel's Supabase integration provides POSTGRES_URL; without it, run the SQL by hand.
 */
async function createSchema(reason: "table" | "columns"): Promise<void> {
  const url = postgresUrl();
  if (!url) {
    throw new Error(
      reason === "table"
        ? "The Supabase table 'bookings' does not exist yet. Open Supabase → SQL Editor and run supabase/schema.sql " +
            "(or connect Supabase from Vercel's Storage tab, which sets POSTGRES_URL so the table is created automatically)."
        : "The Supabase table 'bookings' was created by an older version and lacks the columns 'details' and 'followups'. " +
            "Open Supabase → SQL Editor and run supabase/schema.sql again (it only adds what is missing), " +
            "or set POSTGRES_URL so the app upgrades the table automatically.",
    );
  }
  const sqlText = fs.readFileSync(path.join(process.cwd(), "supabase", "schema.sql"), "utf8");
  const { default: postgres } = await import("postgres");
  const conn = new URL(url);
  conn.search = ""; // drop provider-specific query flags; SSL is set explicitly
  const sql = postgres(conn.toString(), { ssl: "require", prepare: false, max: 1, connect_timeout: 10, idle_timeout: 5 });
  try {
    await sql.unsafe(sqlText);
    await sql.unsafe("notify pgrst, 'reload schema'");
  } finally {
    await sql.end({ timeout: 5 });
  }
  // PostgREST reloads its schema cache asynchronously.
  await new Promise((r) => setTimeout(r, 1500));
}

/**
 * Supabase (Postgres) store. Uses the service-role / secret key on the server only; the table
 * has Row Level Security enabled with no public policies (see supabase/schema.sql), so
 * browsers can never read bookings directly. Creates the table on first use when possible.
 */
export class SupabaseBookingStore implements BookingStore {
  readonly driver = "supabase" as const;
  private client: SupabaseClient;
  private schemaAttempt: Promise<void> | undefined;

  constructor(url: string, serviceRoleKey: string, fetchImpl?: typeof fetch) {
    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
      ...(fetchImpl ? { global: { fetch: fetchImpl } } : {}),
    });
  }

  /** Run an operation; if the table (or a newer column) is missing, run the schema once and retry. */
  private async withTable<T>(op: () => Promise<T>): Promise<T> {
    try {
      return await op();
    } catch (err) {
      const reason = isMissingColumn(err) ? "columns" : isMissingTable(err) ? "table" : null;
      if (!reason) throw err;
      // Retry the creation on the next request if it failed (e.g. after the SQL was run by hand).
      this.schemaAttempt ??= createSchema(reason).catch((e: unknown) => {
        this.schemaAttempt = undefined;
        throw e;
      });
      await this.schemaAttempt;
      return op();
    }
  }

  async create(input: NewBooking): Promise<Booking> {
    return this.withTable(async () => {
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
          // Only sent when present, so niches without extra fields work on pre-niche tables too.
          ...(input.details ? { details: input.details } : {}),
          ...(input.createdAt ? { created_at: input.createdAt } : {}),
        })
        .select()
        .single();
      if (error) fail("insert", error);
      return fromRow(data as BookingRow);
    });
  }

  async list(clinicSlug: string, options: ListOptions = {}): Promise<Booking[]> {
    return this.withTable(async () => {
      let q = this.client.from(TABLE).select("*").eq("clinic_slug", clinicSlug);
      if (options.fromDate) q = q.gte("date", options.fromDate);
      if (options.toDate) q = q.lte("date", options.toDate);
      const { data, error } = await q.order("date").order("time").order("created_at").limit(2000);
      if (error) fail("select", error);
      return (data as BookingRow[]).map(fromRow);
    });
  }

  async updateStatus(clinicSlug: string, id: string, status: BookingStatus): Promise<Booking | null> {
    return this.withTable(async () => {
      const { data, error } = await this.client
        .from(TABLE)
        .update({ status, updated_at: new Date().toISOString() })
        .eq("clinic_slug", clinicSlug)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) fail("update", error);
      return data ? fromRow(data as BookingRow) : null;
    });
  }

  async markReminderSent(clinicSlug: string, ids: string[], at: string): Promise<void> {
    if (ids.length === 0) return;
    return this.withTable(async () => {
      const { error } = await this.client
        .from(TABLE)
        .update({ reminder_sent_at: at })
        .eq("clinic_slug", clinicSlug)
        .in("id", ids);
      if (error) fail("update", error);
    });
  }

  async markFollowUpSent(clinicSlug: string, items: FollowUpMark[], at: string): Promise<void> {
    if (items.length === 0) return;
    return this.withTable(async () => {
      const ids = [...new Set(items.map((i) => i.id))];
      const { data, error } = await this.client
        .from(TABLE)
        .select("id, followups")
        .eq("clinic_slug", clinicSlug)
        .in("id", ids);
      if (error) fail("select", error);
      for (const row of data as { id: string; followups: Record<string, string> | null }[]) {
        const merged = { ...row.followups };
        for (const i of items) if (i.id === row.id) merged[i.key] = at;
        const { error: upError } = await this.client
          .from(TABLE)
          .update({ followups: merged })
          .eq("clinic_slug", clinicSlug)
          .eq("id", row.id);
        if (upError) fail("update", upError);
      }
    });
  }

  async count(clinicSlug: string): Promise<number> {
    return this.withTable(async () => {
      const { count, error } = await this.client
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("clinic_slug", clinicSlug);
      if (error) fail("count", error);
      return count ?? 0;
    });
  }

  async replaceDemoBookings(clinicSlug: string, rows: DemoBooking[]): Promise<void> {
    return this.withTable(async () => {
      const keep = rows.map((r) => r.id);
      let del = this.client.from(TABLE).delete().eq("clinic_slug", clinicSlug).eq("source", "demo");
      if (keep.length) del = del.not("id", "in", `(${keep.join(",")})`);
      const { error: delError } = await del;
      if (delError) fail("delete", delError);
      if (rows.length === 0) return;
      const now = new Date().toISOString();
      const { error } = await this.client.from(TABLE).upsert(
        rows.map((r) => ({
          id: r.id,
          clinic_slug: r.clinicSlug,
          name: r.name,
          phone: r.phone,
          service_id: r.serviceId,
          service_name: r.serviceName,
          date: r.date,
          time: r.time,
          locale: r.locale,
          status: r.status ?? "new",
          consent_at: r.consentAt,
          created_at: r.createdAt ?? now,
          updated_at: now,
          source: "demo",
          ...(r.details ? { details: r.details } : {}),
        })),
        // Existing demo rows keep any status changes made during a demo.
        { onConflict: "id", ignoreDuplicates: true },
      );
      if (error) fail("upsert", error);
    });
  }
}
