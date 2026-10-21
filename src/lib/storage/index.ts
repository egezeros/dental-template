import { isDemoMode, sqlitePath, storageDriver, supabaseConfig } from "../config";
import { getClinics } from "../clinics/load";
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

/**
 * In demo mode, give every clinic a realistic set of fictional bookings the first time
 * its data is touched, so the dashboard and reminders have something to show.
 * Supabase is never seeded automatically (set DEMO_SEED_SUPABASE=true to opt in).
 */
async function seedIfNeeded(store: BookingStore): Promise<void> {
  if (!isDemoMode()) return;
  if (store.driver === "supabase" && process.env.DEMO_SEED_SUPABASE !== "true") return;
  g.__seeded ??= new Set();
  for (const clinic of getClinics()) {
    if (g.__seeded.has(clinic.slug)) continue;
    g.__seeded.add(clinic.slug);
    if ((await store.count(clinic.slug)) > 0) continue;
    for (const b of buildDemoBookings(clinic)) await store.create(b);
  }
}

export async function getStore(): Promise<BookingStore> {
  g.__bookingStore ??= createStore().then(async (store) => {
    await seedIfNeeded(store);
    return store;
  });
  return g.__bookingStore;
}

/** For tests: inject a store. */
export function setStoreForTesting(store: BookingStore | undefined): void {
  g.__bookingStore = store ? Promise.resolve(store) : undefined;
  g.__seeded = undefined;
}
