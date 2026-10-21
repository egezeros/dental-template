import { NextResponse } from "next/server";
import { createBooking } from "@/lib/booking/service";
import { getClinic } from "@/lib/clinics/load";
import { isDemoMode, siteUrl } from "@/lib/config";
import { notifyStaff } from "@/lib/notify/telegram";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const clinic = getClinic(slug);
  if (!clinic) return NextResponse.json({ ok: false, error: "unknown_clinic" }, { status: 404 });

  if (!rateLimit(`booking:${slug}:${clientIp(request.headers)}`, 8, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    const result = await createBooking(clinic, body, {
      store: await getStore(),
      notify: notifyStaff,
      adminUrl: `${siteUrl()}/${slug}/admin`,
      demo: isDemoMode(),
    });
    if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
    return NextResponse.json({ ok: true, id: result.booking?.id ?? null }, { status: 201 });
  } catch (err) {
    console.error("[bookings] failed to create booking:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
