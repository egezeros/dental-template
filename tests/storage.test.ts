import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n";
import { ensureDemoData, setStoreForTesting } from "@/lib/storage";
import { buildDemoBookings, demoBookingId } from "@/lib/storage/demo-seed";
import { MemoryBookingStore } from "@/lib/storage/memory";
import { SqliteBookingStore } from "@/lib/storage/sqlite";
import { isMissingTable, SupabaseBookingStore } from "@/lib/storage/supabase";
import type { BookingStore } from "@/lib/storage/types";
import { testClinic } from "./fixtures";

const clinic = testClinic();
const DAY1 = new Date("2026-10-21T06:00:00Z"); // Wed 10:00 Baku
const DAY2 = new Date("2026-10-22T06:00:00Z");

const webBooking = {
  clinicSlug: "test-clinic",
  name: "Web Patient",
  phone: "+994501234567",
  serviceId: "consultation",
  serviceName: "Konsultasiya",
  date: "2026-10-23",
  time: "10:00",
  locale: "az" as const,
  consentAt: "2026-10-21T06:00:00Z",
  source: "web" as const,
};

describe("demo booking IDs", () => {
  it("are valid, deterministic UUIDs per clinic, day and position", () => {
    const id = demoBookingId("test-clinic", "2026-10-21", 0);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(demoBookingId("test-clinic", "2026-10-21", 0)).toBe(id);
    expect(demoBookingId("test-clinic", "2026-10-22", 0)).not.toBe(id);
    expect(demoBookingId("other", "2026-10-21", 0)).not.toBe(id);
  });
});

describe.each([
  ["memory", async () => new MemoryBookingStore() as BookingStore],
  ["sqlite", async () => (await SqliteBookingStore.open(":memory:")) as BookingStore],
])("%s store: replaceDemoBookings", (_name, make) => {
  it("is idempotent, keeps status changes, refreshes daily and never touches real bookings", async () => {
    const store = await make();
    const real = await store.create(webBooking);
    const day1 = buildDemoBookings(clinic, DAY1);

    await store.replaceDemoBookings("test-clinic", day1);
    await store.replaceDemoBookings("test-clinic", day1); // a second instance seeding the same day
    expect(await store.count("test-clinic")).toBe(day1.length + 1);

    // A status change made during a demo survives a re-seed on the same day.
    await store.updateStatus("test-clinic", day1[0].id, "no_show");
    await store.replaceDemoBookings("test-clinic", day1);
    const rows = await store.list("test-clinic");
    expect(rows.find((b) => b.id === day1[0].id)?.status).toBe("no_show");

    // Next day: yesterday's demo rows are replaced, the real booking stays.
    const day2 = buildDemoBookings(clinic, DAY2);
    await store.replaceDemoBookings("test-clinic", day2);
    const after = await store.list("test-clinic");
    expect(after).toHaveLength(day2.length + 1);
    expect(after.some((b) => b.id === real.id && b.source === "web")).toBe(true);
    expect(after.filter((b) => b.source === "demo").map((b) => b.id).sort()).toEqual(day2.map((b) => b.id).sort());
  });
});

describe.each([
  ["memory", async () => new MemoryBookingStore() as BookingStore],
  ["sqlite", async () => (await SqliteBookingStore.open(":memory:")) as BookingStore],
])("%s store: niche details and follow-ups", (_name, make) => {
  it("round-trips extra booking fields and merges follow-up markers", async () => {
    const store = await make();
    const b = await store.create({ ...webBooking, details: { petName: "Bella", species: "cat" } });
    const plain = await store.create(webBooking);
    await store.markFollowUpSent("test-clinic", [{ id: b.id, key: "vaccination-annual" }], "2026-10-21T06:00:00.000Z");
    await store.markFollowUpSent("test-clinic", [{ id: b.id, key: "checkup-annual" }], "2026-10-22T06:00:00.000Z");
    await store.markFollowUpSent("other-clinic", [{ id: plain.id, key: "x" }], "2026-10-22T06:00:00.000Z");
    const rows = await store.list("test-clinic");
    const saved = rows.find((r) => r.id === b.id)!;
    expect(saved.details).toEqual({ petName: "Bella", species: "cat" });
    expect(saved.followUps).toEqual({
      "vaccination-annual": "2026-10-21T06:00:00.000Z",
      "checkup-annual": "2026-10-22T06:00:00.000Z",
    });
    const other = rows.find((r) => r.id === plain.id)!;
    expect(other.details).toBeUndefined();
    expect(other.followUps).toBeUndefined();
  });
});

describe("SQLite upgrade", () => {
  it("adds the new columns to a database file created by the dental-only version", async () => {
    const file = path.join(os.tmpdir(), `bookings-upgrade-${process.pid}-${Date.now()}.db`);
    try {
      const { DatabaseSync } = await import("node:sqlite");
      const old = new DatabaseSync(file);
      old.exec(`CREATE TABLE bookings (id TEXT PRIMARY KEY, clinic_slug TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL,
        service_id TEXT NOT NULL, service_name TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, locale TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new', consent_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        reminder_sent_at TEXT, source TEXT NOT NULL DEFAULT 'web')`);
      old.exec(`INSERT INTO bookings VALUES ('old-1', 'test-clinic', 'Old Patient', '+994501234567', 'consultation', 'K',
        '2026-10-23', '10:00', 'az', 'new', 'x', 'x', 'x', NULL, 'web')`);
      old.close();
      const store = await SqliteBookingStore.open(file);
      await store.markFollowUpSent("test-clinic", [{ id: "old-1", key: "checkup-6m" }], "2026-10-21T06:00:00.000Z");
      const [row] = await store.list("test-clinic");
      expect(row).toMatchObject({ id: "old-1", name: "Old Patient", followUps: { "checkup-6m": "2026-10-21T06:00:00.000Z" } });
    } finally {
      fs.rmSync(file, { force: true });
    }
  });
});

describe("ensureDemoData", () => {
  beforeEach(() => setStoreForTesting(undefined));

  it("seeds once per day per process and refreshes on a new day", async () => {
    const store = new MemoryBookingStore();
    await ensureDemoData(store, clinic, DAY1);
    await ensureDemoData(store, clinic, DAY1);
    const n = await store.count("test-clinic");
    expect(n).toBe(buildDemoBookings(clinic, DAY1).length);
    await ensureDemoData(store, clinic, DAY2);
    expect(await store.count("test-clinic")).toBe(buildDemoBookings(clinic, DAY2).length);
  });

  it("does nothing outside demo mode", async () => {
    process.env.DEMO_MODE = "false";
    try {
      const store = new MemoryBookingStore();
      await ensureDemoData(store, clinic, DAY1);
      expect(await store.count("test-clinic")).toBe(0);
    } finally {
      delete process.env.DEMO_MODE;
    }
  });
});

describe("Supabase store", () => {
  const postgrest = (status: number, body: object) =>
    (async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })) as typeof fetch;

  it("explains how to create the table when it is missing and POSTGRES_URL is not set", async () => {
    delete process.env.POSTGRES_URL;
    delete process.env.POSTGRES_URL_NON_POOLING;
    const store = new SupabaseBookingStore(
      "https://example.supabase.co",
      "service-key",
      postgrest(404, { code: "PGRST205", message: "Could not find the table 'public.bookings' in the schema cache" }),
    );
    await expect(store.list("test-clinic")).rejects.toThrow(/does not exist yet.*SQL Editor.*schema\.sql/);
  });

  it("explains how to upgrade a table created before the multi-niche columns", async () => {
    delete process.env.POSTGRES_URL;
    delete process.env.POSTGRES_URL_NON_POOLING;
    const store = new SupabaseBookingStore(
      "https://example.supabase.co",
      "service-key",
      postgrest(400, { code: "42703", message: "column bookings.followups does not exist" }),
    );
    await expect(store.markFollowUpSent("test-clinic", [{ id: "a", key: "k" }], "now")).rejects.toThrow(
      /older version.*details.*followups.*schema\.sql again/,
    );
  });

  it("explains how to upgrade a table whose language check predates Turkish", async () => {
    delete process.env.POSTGRES_URL;
    delete process.env.POSTGRES_URL_NON_POOLING;
    const store = new SupabaseBookingStore(
      "https://example.supabase.co",
      "service-key",
      postgrest(400, {
        code: "23514",
        message: 'new row for relation "bookings" violates check constraint "bookings_locale_check"',
      }),
    );
    await expect(store.create({ ...webBooking, locale: "tr" })).rejects.toThrow(/older version.*Turkish.*schema\.sql again/);
  });

  it("allows every app language in supabase/schema.sql, also on upgraded tables", () => {
    const sql = fs.readFileSync("supabase/schema.sql", "utf8");
    const allowed = `locale in (${LOCALES.map((l) => `'${l}'`).join(", ")})`;
    expect(sql).toContain(`check (${allowed})`);
    expect(sql).toContain(`add constraint bookings_locale_check check (${allowed})`);
  });

  it("passes other errors through unchanged", async () => {
    const store = new SupabaseBookingStore(
      "https://example.supabase.co",
      "service-key",
      postgrest(401, { code: "42501", message: "permission denied for table bookings" }),
    );
    const err = await store.list("test-clinic").catch((e: unknown) => e);
    expect(isMissingTable(err)).toBe(false);
    expect(String(err)).toContain("Supabase select failed: permission denied");
  });
});

describe("supabaseConfig", () => {
  it("keeps only the project origin, so a pasted REST endpoint still works", async () => {
    const { supabaseConfig } = await import("@/lib/config");
    process.env.SUPABASE_URL = ' "https://abcdefgh.supabase.co/rest/v1/" ';
    process.env.SUPABASE_SECRET_KEY = " sb_secret_test \n";
    try {
      expect(supabaseConfig()).toEqual({ url: "https://abcdefgh.supabase.co", key: "sb_secret_test" });
    } finally {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SECRET_KEY;
    }
  });
});
