import { randomUUID } from "node:crypto";
import { telegramConfig } from "../config";

export type OutboxStatus = "delivered" | "simulated" | "failed";

export interface OutboxEntry {
  id: string;
  clinicSlug: string;
  kind: "booking" | "reminder-digest" | "status";
  text: string;
  status: OutboxStatus;
  error?: string;
  at: string;
}

const OUTBOX_LIMIT = 50;
const g = globalThis as unknown as { __outbox?: OutboxEntry[] };

/**
 * Recent staff notifications, kept in memory per server process so the admin
 * dashboard can show what was (or, without keys, would have been) sent.
 */
export function getOutbox(clinicSlug: string): OutboxEntry[] {
  return (g.__outbox ?? []).filter((e) => e.clinicSlug === clinicSlug);
}

function record(entry: Omit<OutboxEntry, "id" | "at">): OutboxEntry {
  const full = { ...entry, id: randomUUID(), at: new Date().toISOString() };
  g.__outbox = [full, ...(g.__outbox ?? [])].slice(0, OUTBOX_LIMIT * 4);
  return full;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/**
 * Send an HTML-formatted message to the clinic's staff chat.
 * Uses TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID_<SLUG> (or TELEGRAM_CHAT_ID).
 * Without keys the message is only recorded in the outbox ("simulated").
 * Never throws: a failed notification must not lose the booking.
 */
export async function notifyStaff(
  clinicSlug: string,
  kind: OutboxEntry["kind"],
  html: string,
  fetchImpl: FetchLike = fetch,
): Promise<OutboxEntry> {
  const cfg = telegramConfig(clinicSlug);
  if (!cfg) {
    console.info(`[telegram:simulated] ${clinicSlug}\n${html}`);
    return record({ clinicSlug, kind, text: html, status: "simulated" });
  }
  try {
    const res = await fetchImpl(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text: html,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Telegram API ${res.status}: ${body.slice(0, 200)}`);
    }
    return record({ clinicSlug, kind, text: html, status: "delivered" });
  } catch (err) {
    const message = (err as Error).message.replace(cfg.token, "***");
    console.error(`[telegram] failed for ${clinicSlug}: ${message}`);
    return record({ clinicSlug, kind, text: html, status: "failed", error: message });
  }
}
