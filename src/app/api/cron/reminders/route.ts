import { NextResponse } from "next/server";
import { getClinics } from "@/lib/clinics/load";
import { cronSecret, isDemoMode } from "@/lib/config";
import { getMessagingProvider } from "@/lib/messaging";
import { notifyStaff } from "@/lib/notify/telegram";
import { runReminders } from "@/lib/reminders";
import { getStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * Daily reminder job, triggered by Vercel Cron (see vercel.json).
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 * Outside demo mode the secret is required.
 */
export async function GET(request: Request) {
  const secret = cronSecret();
  const authorized = secret
    ? request.headers.get("authorization") === `Bearer ${secret}`
    : isDemoMode();
  if (!authorized) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const results = await runReminders(getClinics(), new Date(), {
    store: await getStore(),
    messaging: getMessagingProvider(),
    notify: notifyStaff,
    demo: isDemoMode(),
  });
  return NextResponse.json({
    ok: true,
    results: results.map((r) => ({
      clinic: r.clinicSlug,
      date: r.date,
      reminders: r.reminders.length,
      delivered: r.reminders.filter((x) => x.delivered).length,
      notifications: r.notifications,
    })),
  });
}
