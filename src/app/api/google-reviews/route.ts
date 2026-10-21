import { getClinic, getClinics } from "@/lib/clinics/load";
import { cronSecret, isDemoMode } from "@/lib/config";
import { describeApiKey, diagnoseGoogleReviews } from "@/lib/google-reviews";

export const dynamic = "force-dynamic";

/**
 * Diagnostics for live Google reviews: open /api/google-reviews in a browser
 * (add ?clinic=<slug> for one clinic). Outside demo mode, add ?secret=<CRON_SECRET>.
 * Never returns the API key.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = cronSecret();
  const allowed = isDemoMode() || (secret !== undefined && url.searchParams.get("secret") === secret);
  if (!allowed) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const slug = url.searchParams.get("clinic");
  const clinics = slug ? [getClinic(slug)].filter((c) => c !== undefined) : getClinics();
  if (slug && clinics.length === 0) return Response.json({ ok: false, error: "unknown_clinic" }, { status: 404 });

  const results = await Promise.all(clinics.map((c) => diagnoseGoogleReviews(c)));
  const body = {
    keyConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    keyCheck: describeApiKey(),
    note: "Clinic pages are built at deploy time and refresh every 12 hours: after changing the key or clinic files, redeploy.",
    results,
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
