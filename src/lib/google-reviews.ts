import type { Clinic } from "./clinics/schema";
import type { Locale } from "./i18n";

/**
 * Live Google rating + reviews via the official Google Places API (New).
 * Reviews are shown exactly as Google returns them (up to 5, Google's "most relevant"
 * order) with the reviewer attribution and a Google Maps link, as Google's display
 * policy requires. Without GOOGLE_MAPS_API_KEY this returns null and the site keeps
 * its labelled sample reviews.
 */

export interface GoogleReview {
  author: string;
  authorUri?: string;
  authorPhotoUri?: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime?: string;
}

export interface GooglePlaceReviews {
  placeId: string;
  name?: string;
  rating?: number;
  count?: number;
  mapsUri?: string;
  reviews: GoogleReview[];
}

type FetchLike = (url: string, init?: RequestInit & { next?: { revalidate?: number } }) => Promise<Response>;

/** How long Next.js may reuse a Google response before asking again (12 hours). */
export const GOOGLE_REVALIDATE_SECONDS = 60 * 60 * 12;

const API = "https://places.googleapis.com/v1";

/** Greater Baku. Restricting the search here avoids matching a same-named clinic abroad. */
const BAKU_RECTANGLE = {
  low: { latitude: 40.25, longitude: 49.6 },
  high: { latitude: 40.65, longitude: 50.25 },
};

function apiKey(): string | undefined {
  return process.env.GOOGLE_MAPS_API_KEY || undefined;
}

/** A failed Google call, with the step and Google's own error message (never the key). */
export class GoogleApiError extends Error {
  constructor(
    readonly step: "search" | "details",
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function apiError(step: "search" | "details", res: Response, key: string): Promise<GoogleApiError> {
  const body = await res.text().catch(() => "");
  let message = body.slice(0, 300);
  try {
    // Google errors look like {"error":{"code":403,"message":"…","status":"PERMISSION_DENIED"}}
    message = (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? message;
  } catch {}
  return new GoogleApiError(step, res.status, message.replaceAll(key, "***"));
}

type CacheMode = { next: { revalidate: number } } | { cache: "no-store" };

async function searchPlaceId(query: string, key: string, fetchImpl: FetchLike, cache: CacheMode): Promise<string | undefined> {
  const res = await fetchImpl(`${API}/places:searchText`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      // IDs-only field mask: the cheapest Text Search tier.
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: query, regionCode: "az", pageSize: 1, locationRestriction: { rectangle: BAKU_RECTANGLE } }),
    ...cache,
  });
  if (!res.ok) throw await apiError("search", res, key);
  const data = (await res.json()) as { places?: { id: string }[] };
  return data.places?.[0]?.id;
}

/** Queries tried in order: the full map query (name + address), then just the name in Baku. */
export function searchQueries(clinic: Clinic): string[] {
  return [...new Set([clinic.map.query, `${clinic.name} Bakı`])];
}

interface PlaceDetails {
  id: string;
  displayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: {
    rating?: number;
    relativePublishTimeDescription?: string;
    publishTime?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  }[];
}

export function mapPlaceDetails(d: PlaceDetails): GooglePlaceReviews {
  return {
    placeId: d.id,
    name: d.displayName?.text,
    rating: d.rating,
    count: d.userRatingCount,
    mapsUri: d.googleMapsUri,
    reviews: (d.reviews ?? [])
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? "Google user",
        authorUri: r.authorAttribution?.uri,
        authorPhotoUri: r.authorAttribution?.photoUri,
        rating: r.rating ?? 0,
        // Show the reviewer's own words, not a machine translation.
        text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
        relativeTime: r.relativePublishTimeDescription ?? "",
        publishTime: r.publishTime,
      }))
      .filter((r) => r.text.length > 0),
  };
}

interface LoadResult {
  placeId: string | null;
  /** Which search query matched (undefined when the place ID was pinned). */
  matchedQuery?: string;
  data: GooglePlaceReviews | null;
}

async function loadPlace(clinic: Clinic, locale: Locale, key: string, fetchImpl: FetchLike, cache: CacheMode): Promise<LoadResult> {
  let placeId = clinic.google?.placeId;
  let matchedQuery: string | undefined;
  if (!placeId) {
    for (const q of searchQueries(clinic)) {
      placeId = await searchPlaceId(q, key, fetchImpl, cache);
      if (placeId) {
        matchedQuery = q;
        break;
      }
    }
  }
  if (!placeId) return { placeId: null, data: null };
  const res = await fetchImpl(`${API}/places/${encodeURIComponent(placeId)}?languageCode=${locale}&regionCode=az`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri,reviews",
    },
    ...cache,
  });
  if (!res.ok) throw await apiError("details", res, key);
  return { placeId, matchedQuery, data: mapPlaceDetails((await res.json()) as PlaceDetails) };
}

export async function getGoogleReviews(
  clinic: Clinic,
  locale: Locale,
  fetchImpl: FetchLike = fetch as FetchLike,
): Promise<GooglePlaceReviews | null> {
  const key = apiKey();
  if (!key || clinic.google?.enabled === false) return null;
  try {
    const { placeId, data } = await loadPlace(clinic, locale, key, fetchImpl, { next: { revalidate: GOOGLE_REVALIDATE_SECONDS } });
    if (!placeId) console.warn(`[google-reviews] no Google place found in Baku for ${clinic.slug} (${searchQueries(clinic).join(" | ")})`);
    return data;
  } catch (err) {
    // Never break the page over reviews: fall back to the sample block.
    console.error(`[google-reviews] ${clinic.slug}: ${(err as Error).message.replaceAll(key, "***")}`);
    return null;
  }
}

export interface GoogleReviewsDiagnosis {
  clinic: string;
  status: "ok" | "no-reviews" | "not-found" | "disabled" | "error";
  /** Plain-language explanation of what the clinic page will show and why. */
  explanation: string;
  queries?: string[];
  matchedQuery?: string;
  placeId?: string;
  googleName?: string;
  googleMapsUri?: string;
  rating?: number;
  ratingCount?: number;
  reviewsShown?: number;
  error?: { step: string; httpStatus: number; message: string };
}

/** Same lookup as the clinic page, uncached, reporting each step (for /api/google-reviews). */
export async function diagnoseGoogleReviews(
  clinic: Clinic,
  fetchImpl: FetchLike = fetch as FetchLike,
): Promise<GoogleReviewsDiagnosis> {
  const key = apiKey();
  const base = { clinic: clinic.slug, queries: clinic.google?.placeId ? undefined : searchQueries(clinic) };
  if (!key) {
    return { ...base, status: "error", explanation: "GOOGLE_MAPS_API_KEY is not set in this deployment. Add it in Vercel, then redeploy." };
  }
  if (clinic.google?.enabled === false) {
    return { ...base, status: "disabled", explanation: 'Turned off in the clinic file ("google": { "enabled": false }).' };
  }
  try {
    const { placeId, matchedQuery, data } = await loadPlace(clinic, "az", key, fetchImpl, { cache: "no-store" });
    if (!placeId || !data) {
      return {
        ...base,
        status: "not-found",
        explanation:
          "Google found no matching place inside Baku. Pin the right listing with \"google\": { \"placeId\": \"…\" } in the clinic file. Until then, the sample reviews are shown.",
      };
    }
    const found = {
      ...base,
      matchedQuery,
      placeId,
      googleName: data.name,
      googleMapsUri: data.mapsUri,
      rating: data.rating,
      ratingCount: data.count,
      reviewsShown: data.reviews.length,
    };
    if (data.reviews.length === 0) {
      return {
        ...found,
        status: "no-reviews",
        explanation: "Google found the place, but it has no written reviews to show, so the sample reviews stay. Check googleName is the right clinic.",
      };
    }
    return {
      ...found,
      status: "ok",
      explanation: "Working. If the page still shows samples, redeploy (pages refresh every 12 hours). Check googleName is the right clinic.",
    };
  } catch (err) {
    const e = err instanceof GoogleApiError ? err : new GoogleApiError("search", 0, (err as Error).message);
    return {
      ...base,
      status: "error",
      explanation: hint(e),
      error: { step: e.step, httpStatus: e.status, message: e.message.replaceAll(key, "***") },
    };
  }
}

function hint(e: GoogleApiError): string {
  const m = e.message.toLowerCase();
  if (m.includes("billing")) return "Google says billing is not enabled. Attach a billing account to the Google Cloud project.";
  if (m.includes("has not been used") || m.includes("is disabled") || m.includes("service_disabled"))
    return 'The "Places API (New)" is not enabled. In Google Cloud: APIs & Services, then Library, then enable "Places API (New)" (not the legacy "Places API").';
  if (m.includes("referer") || m.includes("referrer"))
    return 'The key has a "Websites" (HTTP referrer) restriction, which blocks server calls. Set Application restrictions to "None" and keep the API restriction to Places API (New).';
  if (m.includes("api key not valid") || m.includes("api_key_invalid")) return "The API key is not valid. Copy it again from Google Cloud: APIs & Services, then Credentials.";
  if (m.includes("blocked") || e.status === 403)
    return "Google refused the request. Check the key's API restrictions include Places API (New), and that the API is enabled.";
  return "Google returned an error. The message below says why.";
}
