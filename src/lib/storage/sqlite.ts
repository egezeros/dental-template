import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import type { Booking, BookingStatus, DemoBooking, NewBooking } from "../booking/types";
import { fromRow, toRow, type BookingRow } from "./rows";
import { type BookingStore, type ListOptions } from "./types";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  clinic_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  locale TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  reminder_sent_at TEXT,
  source TEXT NOT NULL DEFAULT 'web'
);
CREATE INDEX IF NOT EXISTS bookings_clinic_date ON bookings (clinic_slug, date);
`;

/**
 * SQLite store using Node's built-in `node:sqlite` (Node 22.13+, no native build step).
 * Persistent across restarts locally; not suitable for serverless (ephemeral disk).
 */
export class SqliteBookingStore implements BookingStore {
  readonly driver = "sqlite" as const;

  private constructor(private db: DatabaseSync) {
    db.exec(SCHEMA);
  }

  static async open(file: string): Promise<SqliteBookingStore> {
    const { DatabaseSync } = await import("node:sqlite");
    if (file !== ":memory:") fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
    return new SqliteBookingStore(new DatabaseSync(file));
  }

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
    const r = toRow(booking);
    this.db
      .prepare(
        `INSERT INTO bookings (id, clinic_slug, name, phone, service_id, service_name, date, time, locale, status,
          consent_at, created_at, updated_at, reminder_sent_at, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        r.id, r.clinic_slug, r.name, r.phone, r.service_id, r.service_name, r.date, r.time, r.locale, r.status,
        r.consent_at, r.created_at, r.updated_at, r.reminder_sent_at, r.source,
      );
    return booking;
  }

  async list(clinicSlug: string, options: ListOptions = {}): Promise<Booking[]> {
    const rows = this.db
      .prepare(
        `SELECT * FROM bookings
         WHERE clinic_slug = ? AND date >= ? AND date <= ?
         ORDER BY date, time, created_at`,
      )
      .all(clinicSlug, options.fromDate ?? "0000-00-00", options.toDate ?? "9999-99-99") as unknown as BookingRow[];
    return rows.map(fromRow);
  }

  async updateStatus(clinicSlug: string, id: string, status: BookingStatus): Promise<Booking | null> {
    const now = new Date().toISOString();
    this.db
      .prepare(`UPDATE bookings SET status = ?, updated_at = ? WHERE id = ? AND clinic_slug = ?`)
      .run(status, now, id, clinicSlug);
    const row = this.db
      .prepare(`SELECT * FROM bookings WHERE id = ? AND clinic_slug = ?`)
      .get(id, clinicSlug) as unknown as BookingRow | undefined;
    return row ? fromRow(row) : null;
  }

  async markReminderSent(clinicSlug: string, ids: string[], at: string): Promise<void> {
    const stmt = this.db.prepare(`UPDATE bookings SET reminder_sent_at = ? WHERE id = ? AND clinic_slug = ?`);
    for (const id of ids) stmt.run(at, id, clinicSlug);
  }

  async replaceDemoBookings(clinicSlug: string, rows: DemoBooking[]): Promise<void> {
    const keep = new Set(rows.map((r) => r.id));
    const existing = this.db
      .prepare(`SELECT id FROM bookings WHERE clinic_slug = ? AND source = 'demo'`)
      .all(clinicSlug) as unknown as { id: string }[];
    const del = this.db.prepare(`DELETE FROM bookings WHERE id = ? AND clinic_slug = ?`);
    for (const { id } of existing) if (!keep.has(id)) del.run(id, clinicSlug);
    const now = new Date().toISOString();
    const insert = this.db.prepare(
      `INSERT OR IGNORE INTO bookings (id, clinic_slug, name, phone, service_id, service_name, date, time, locale, status,
        consent_at, created_at, updated_at, reminder_sent_at, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'demo')`,
    );
    for (const r of rows) {
      insert.run(
        r.id, r.clinicSlug, r.name, r.phone, r.serviceId, r.serviceName, r.date, r.time, r.locale, r.status ?? "new",
        r.consentAt, r.createdAt ?? now, now,
      );
    }
  }

  async count(clinicSlug: string): Promise<number> {
    const row = this.db.prepare(`SELECT COUNT(*) AS n FROM bookings WHERE clinic_slug = ?`).get(clinicSlug) as
      | { n: number }
      | undefined;
    return Number(row?.n ?? 0);
  }
}
