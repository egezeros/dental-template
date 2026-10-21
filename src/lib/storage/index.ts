import type { Clinic } from "../clinics/schema";
import { demoSeedEnabled, sqlitePath, storageDriver, supabaseConfig } from "../config";
import { bakuDate } from "../time";
import { buildDemoBookings } from "./demo-seed";
import { MemoryBookingStore } from "./memory";
import type { BookingStore } from "./types";

export type { BookingStore } from "./types";

// Keep one store per server process (and survive hot reloads in `next dev`).
const g = globalThis as unknown as { __bookingStore?: Promise<BookingStore>; __seeded?: Set<string> };

async function createStore(): Promise<BookingStore> {
  const driver = storageDriver();
  if (driver === "supabase") {
    const cfg = supabaseConfig();
    if (!cfg) throw new Error("STORAGE_DRIVER=supabase but SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
    const { SupabaseBookingStore } = await import("./supabase");
    return new SupabaseBookingStore(cfg.url, cfg.key);
  }
  if (driver === "sqlite") {
    try {
      const { SqliteBookingStore } = await import("./sqlite");
      return await SqliteBookingStore.open(sqlitePath());
    } catch (err) {
      console.warn("[storage] SQLite unavailable, falling back to in-memory store:", (err as Error).message);
    }
  }
  return new MemoryBookingStore();
}

export async function getStore(): Promise<BookingStore> {
  g.__bookingStore ??= createStore();
  return g.__bookingStore;
}

/**
 * Demo mode: make sure the clinic has today's set of fictional patients, so the dashboard,
 * stats and "tomorrow's reminders" always look alive. Refreshed once per day; idempotent
 * across server instances (deterministic IDs); real bookings are never touched.
 */
export async function ensureDemoData(store: BookingStore, clinic: Clinic, now: Date = new Date()): Promise<void> {
  if (!demoSeedEnabled()) return;
  const key = `${clinic.slug}:${bakuDate(now)}`;
  g.__seeded ??= new Set();
  if (g.__seeded.has(key)) return;
  await store.replaceDemoBookings(clinic.slug, buildDemoBookings(clinic, now));
  g.__seeded.add(key);
}

/** For tests: inject a store. */
export function setStoreForTesting(store: BookingStore | undefined): void {
  g.__bookingStore = store ? Promise.resolve(store) : undefined;
  g.__seeded = undefined;
}
