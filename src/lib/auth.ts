import { createHmac, timingSafeEqual } from "node:crypto";
import { adminPassword, demoIndexPassword } from "./config";

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

function passwordMatches(password: string | undefined, attempt: string): boolean {
  if (!password) return false;
  const a = createHmac("sha256", "pw").update(attempt).digest();
  const b = createHmac("sha256", "pw").update(password).digest();
  return timingSafeEqual(a, b);
}

function issueToken(subject: string, secret: string | undefined, ttlSeconds: number, now: number): string | undefined {
  if (!secret) return undefined;
  const exp = Math.floor(now / 1000) + ttlSeconds;
  const payload = `${subject}.${exp}`;
  return `${payload}.${sign(payload, secret)}`;
}

function verifyToken(subject: string, token: string | undefined, secret: string | undefined, now: number): boolean {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenSubject, exp, sig] = parts;
  if (tokenSubject !== subject) return false;
  if (!/^\d+$/.test(exp) || Number(exp) * 1000 < now) return false;
  return safeEqual(sig, sign(`${tokenSubject}.${exp}`, secret));
}

export function checkPassword(slug: string, attempt: string): boolean {
  return passwordMatches(adminPassword(slug), attempt);
}

export function createSessionToken(slug: string, now = Date.now()): string | undefined {
  return issueToken(slug, secretFor(slug), SESSION_TTL_SECONDS, now);
}

export function verifySessionToken(slug: string, token: string | undefined, now = Date.now()): boolean {
  return verifyToken(slug, token, secretFor(slug), now);
}

/** The demo list on "/" (DEMO_INDEX_PASSWORD): one cookie for the whole site, kept 30 days. */
export const INDEX_COOKIE = "demo_index";
export const INDEX_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function indexSecret(): string | undefined {
  const password = demoIndexPassword();
  return password ? `${process.env.ADMIN_SESSION_SECRET ?? ""}:demo-index:${password}` : undefined;
}

export function checkIndexPassword(attempt: string): boolean {
  return passwordMatches(demoIndexPassword(), attempt);
}

export function createIndexToken(now = Date.now()): string | undefined {
  return issueToken("index", indexSecret(), INDEX_SESSION_TTL_SECONDS, now);
}

export function verifyIndexToken(token: string | undefined, now = Date.now()): boolean {
  return verifyToken("index", token, indexSecret(), now);
}
