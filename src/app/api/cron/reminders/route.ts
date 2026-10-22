import { NextResponse } from "next/server";
import { getClinics } from "@/lib/clinics/load";
import { cronSecret, isDemoMode } from "@/lib/config";
import { runFollowUps } from "@/lib/followups";
import { getMessagingProvider } from "@/lib/messaging";
import { notifyStaff } from "@/lib/notify/telegram";
import { runReminders } from "@/lib/reminders";
import { getStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * Daily reminder job, triggered by Vercel Cron (see vercel.json): tomorrow's appointment
 * reminders, then the niche follow-ups (check-ups, next course sessions, vaccinations).
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 * Outside demo mode the secret is required.
 */
export async function GET(request: Request) {
  const secret = cronSecret();
  const authorized = secret
    ? request.headers.get("authorization") === `Bearer ${secret}`
    : isDemoMode();
  if (!authorized) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const now = new Date();
  const deps = { store: await getStore(), messaging: getMessagingProvider(), notify: notifyStaff, demo: isDemoMode() };
  const results = await runReminders(getClinics(), now, deps);
  const followUps = await runFollowUps(getClinics(), now, deps);
  return NextResponse.json({
    ok: true,
    results: results.map((r) => ({
      clinic: r.clinicSlug,
      date: r.date,
      reminders: r.reminders.length,
      delivered: r.reminders.filter((x) => x.delivered).length,
      notifications: r.notifications,
    })),
    followUps: followUps.map((r) => ({
      clinic: r.clinicSlug,
      sent: r.sent.length,
      delivered: r.sent.filter((x) => x.message.delivered).length,
      notifications: r.notifications,
    })),
  });
}
