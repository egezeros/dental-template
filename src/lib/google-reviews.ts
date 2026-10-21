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

async function findPlaceId(query: string, key: string, fetchImpl: FetchLike): Promise<string | undefined> {
  const res = await fetchImpl(`${API}/places:searchText`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      // IDs-only field mask: the cheapest Text Search tier.
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: query, regionCode: "az", pageSize: 1, locationRestriction: { rectangle: BAKU_RECTANGLE } }),
    next: { revalidate: GOOGLE_REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Places searchText ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { places?: { id: string }[] };
  return data.places?.[0]?.id;
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

export async function getGoogleReviews(
  clinic: Clinic,
  locale: Locale,
  fetchImpl: FetchLike = fetch as FetchLike,
): Promise<GooglePlaceReviews | null> {
  const key = apiKey();
  if (!key || clinic.google?.enabled === false) return null;
  try {
    const placeId = clinic.google?.placeId ?? (await findPlaceId(clinic.map.query, key, fetchImpl));
    if (!placeId) {
      console.warn(`[google-reviews] no Google place found for ${clinic.slug} ("${clinic.map.query}")`);
      return null;
    }
    const res = await fetchImpl(`${API}/places/${encodeURIComponent(placeId)}?languageCode=${locale}&regionCode=az`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri,reviews",
      },
      next: { revalidate: GOOGLE_REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`Places details ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return mapPlaceDetails((await res.json()) as PlaceDetails);
  } catch (err) {
    // Never break the page over reviews: fall back to the sample block.
    console.error(`[google-reviews] ${clinic.slug}: ${(err as Error).message.replaceAll(key, "***")}`);
    return null;
  }
}
