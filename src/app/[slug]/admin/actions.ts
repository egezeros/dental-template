"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, createSessionToken, SESSION_TTL_SECONDS, sessionCookieName, verifySessionToken } from "@/lib/auth";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/booking/types";
import { getClinic } from "@/lib/clinics/load";
import { isDemoMode } from "@/lib/config";
import { isLocale } from "@/lib/i18n";
import { getMessagingProvider } from "@/lib/messaging";
import { notifyStaff } from "@/lib/notify/telegram";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { runReminders } from "@/lib/reminders";
import { getStore } from "@/lib/storage";

function adminPath(slug: string, lang?: string | null, extra = ""): string {
  const params = new URLSearchParams();
  if (lang && isLocale(lang) && lang !== "az") params.set("lang", lang);
  if (extra) for (const [k, v] of new URLSearchParams(extra)) params.set(k, v);
  const q = params.toString();
  return `/${slug}/admin${q ? `?${q}` : ""}`;
}

async function requireSession(slug: string): Promise<void> {
  const jar = await cookies();
  if (!getClinic(slug) || !verifySessionToken(slug, jar.get(sessionCookieName(slug))?.value)) {
    redirect(adminPath(slug));
  }
}

export async function login(slug: string, formData: FormData): Promise<void> {
  const lang = String(formData.get("lang") ?? "");
  if (!getClinic(slug)) redirect("/");
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${slug}:${ip}`, 10, 15 * 60_000)) redirect(adminPath(slug, lang, "error=rate"));

  const password = String(formData.get("password") ?? "");
  if (!checkPassword(slug, password)) redirect(adminPath(slug, lang, "error=1"));

  const token = createSessionToken(slug);
  if (!token) redirect(adminPath(slug, lang));
  (await cookies()).set(sessionCookieName(slug), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/${slug}/admin`,
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect(adminPath(slug, lang));
}

export async function logout(slug: string): Promise<void> {
  (await cookies()).delete({ name: sessionCookieName(slug), path: `/${slug}/admin` });
  redirect(adminPath(slug));
}

export async function setBookingStatus(slug: string, id: string, status: BookingStatus): Promise<void> {
  await requireSession(slug);
  if (!BOOKING_STATUSES.includes(status)) return;
  const store = await getStore();
  await store.updateStatus(slug, id, status);
  revalidatePath(`/${slug}/admin`);
}

export async function runRemindersNow(slug: string): Promise<void> {
  await requireSession(slug);
  const clinic = getClinic(slug);
  if (!clinic) return;
  await runReminders([clinic], new Date(), {
    store: await getStore(),
    messaging: getMessagingProvider(),
    notify: notifyStaff,
    demo: isDemoMode(),
  });
  revalidatePath(`/${slug}/admin`);
}
