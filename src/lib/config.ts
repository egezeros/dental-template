/**
 * Central place for reading environment variables.
 * Every integration falls back to a safe, key-less behaviour so the demo
 * runs with zero setup.
 */

function flag(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

/** Upper-snake version of a clinic slug, used in per-clinic env var names. */
export function envKey(slug: string): string {
  return slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

function perClinic(base: string, slug: string): string | undefined {
  return process.env[`${base}_${envKey(slug)}`] || process.env[base] || undefined;
}

/**
 * DEMO_MODE defaults to ON: every site in this repo is an unsolicited demo.
 * Set DEMO_MODE=false once a clinic becomes a real client.
 */
export function isDemoMode(): boolean {
  return flag("DEMO_MODE", true);
}

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function agencyName(): string {
  return process.env.NEXT_PUBLIC_AGENCY_NAME || "[YOUR AGENCY NAME]";
}

/** When set, every WhatsApp button in demo mode opens this number instead of the clinic's. */
export function demoWhatsAppOverride(): string | undefined {
  const n = process.env.DEMO_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return n ? n : undefined;
}

export function showDemoIndex(): boolean {
  return isDemoMode() && !flag("HIDE_DEMO_INDEX", false);
}

/** When set, the demo list on "/" asks for this password, so businesses can't browse it. */
export function demoIndexPassword(): string | undefined {
  return process.env.DEMO_INDEX_PASSWORD?.trim() || undefined;
}

export const DEFAULT_DEMO_PASSWORD = "demo";

/**
 * Admin password for a clinic: ADMIN_PASSWORD_<SLUG> > ADMIN_PASSWORD > "demo" (demo mode only).
 * Returns undefined when no password is configured outside demo mode (admin disabled).
 */
export function adminPassword(slug: string): string | undefined {
  const configured = perClinic("ADMIN_PASSWORD", slug);
  if (configured) return configured;
  return isDemoMode() ? DEFAULT_DEMO_PASSWORD : undefined;
}

export function usingDefaultDemoPassword(slug: string): boolean {
  return !perClinic("ADMIN_PASSWORD", slug) && isDemoMode();
}

export function telegramConfig(slug: string): { token: string; chatId: string } | undefined {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = perClinic("TELEGRAM_CHAT_ID", slug);
  return token && chatId ? { token, chatId } : undefined;
}

/**
 * Accepts both hand-set variables and the ones Vercel's Supabase integration injects
 * (SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY).
 */
export function supabaseConfig(): { url: string; key: string } | undefined {
  const url = projectOrigin(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)?.trim();
  return url && key ? { url, key } : undefined;
}

/**
 * Keep only "https://<ref>.supabase.co". A pasted "RESTful endpoint" (…/rest/v1/) would
 * otherwise make every request go to /rest/v1/rest/v1/… ("Invalid path specified in request URL").
 */
function projectOrigin(raw: string | undefined): string | undefined {
  const value = raw?.trim().replace(/^["']|["']$/g, "");
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

/** Direct Postgres URL (set by Vercel's Supabase integration); used only to create the table. */
export function postgresUrl(): string | undefined {
  return process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || undefined;
}

/** Fictional demo patients are seeded in demo mode unless DEMO_SEED=false. */
export function demoSeedEnabled(): boolean {
  return isDemoMode() && flag("DEMO_SEED", true);
}

export type StorageDriver = "supabase" | "sqlite" | "memory";

export function storageDriver(): StorageDriver {
  const explicit = process.env.STORAGE_DRIVER as StorageDriver | undefined;
  if (explicit === "supabase" || explicit === "sqlite" || explicit === "memory") return explicit;
  if (supabaseConfig()) return "supabase";
  // Serverless filesystems are ephemeral, so SQLite is only a sensible default locally.
  if (process.env.VERCEL) return "memory";
  return isDemoMode() ? "memory" : "sqlite";
}

export function sqlitePath(): string {
  return process.env.SQLITE_PATH || "data/bookings.db";
}

export function cronSecret(): string | undefined {
  return process.env.CRON_SECRET || undefined;
}

export type MessagingProviderName = "wa-link" | "whatsapp-cloud";

export function messagingProvider(): MessagingProviderName {
  return process.env.MESSAGING_PROVIDER === "whatsapp-cloud" ? "whatsapp-cloud" : "wa-link";
}

export function whatsappCloudConfig():
  | { token: string; phoneNumberId: string; templateName: string; followUpTemplateName?: string; apiVersion: string }
  | undefined {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return undefined;
  return {
    token,
    phoneNumberId,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || "appointment_reminder",
    followUpTemplateName: process.env.WHATSAPP_FOLLOWUP_TEMPLATE || undefined,
    apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
  };
}
