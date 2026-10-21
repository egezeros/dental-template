import { createHmac, timingSafeEqual } from "node:crypto";
import { adminPassword } from "./config";

/** Cookie name per clinic so one browser can be logged into several demo dashboards. */
export function sessionCookieName(slug: string): string {
  return `admin_${slug.replace(/-/g, "_")}`;
}

export const SESSION_TTL_SECONDS = 60 * 60 * 12;

function secretFor(slug: string): string | undefined {
  const password = adminPassword(slug);
  if (!password) return undefined;
  // Binding the secret to the password means changing the password logs everyone out.
  return `${process.env.ADMIN_SESSION_SECRET ?? ""}:${slug}:${password}`;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(slug: string, attempt: string): boolean {
  const password = adminPassword(slug);
  if (!password) return false;
  const a = createHmac("sha256", "pw").update(attempt).digest();
  const b = createHmac("sha256", "pw").update(password).digest();
  return timingSafeEqual(a, b);
}

export function createSessionToken(slug: string, now = Date.now()): string | undefined {
  const secret = secretFor(slug);
  if (!secret) return undefined;
  const exp = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const payload = `${slug}.${exp}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(slug: string, token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const secret = secretFor(slug);
  if (!secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenSlug, exp, sig] = parts;
  if (tokenSlug !== slug) return false;
  if (!/^\d+$/.test(exp) || Number(exp) * 1000 < now) return false;
  return safeEqual(sig, sign(`${tokenSlug}.${exp}`, secret));
}
