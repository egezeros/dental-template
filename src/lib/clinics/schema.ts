import { z } from "zod";

/** Marker used for every piece of information that still has to be confirmed with the clinic. */
export const PLACEHOLDER = "[TO CONFIRM]";

export function isPlaceholder(value: unknown): boolean {
  if (typeof value === "string") return value.includes(PLACEHOLDER);
  if (value && typeof value === "object") return Object.values(value).some(isPlaceholder);
  return false;
}

const localized = z.union([
  z.string().min(1),
  z.object({ az: z.string().min(1), ru: z.string().min(1), en: z.string().min(1) }),
]);

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected #rrggbb");
const time = z.string().regex(/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/, "expected HH:MM");

/**
 * How trustworthy a value is. Rendered as a small badge on the site for anything
 * that is not plainly verified, and summarised in REPORT.md.
 */
export const factStatus = z.enum([
  "verified", // seen in a cited source
  "verified-single", // seen once; not reproduced on re-check
  "self-reported", // the clinic's own claim on its own channels
  "conflict", // sources disagree; value shown is the most-cited one
  "outdated", // sourced but dated (e.g. 2020 prices)
  "constructed", // derived by us from verified data (e.g. a map search link)
  "design", // our design choice, not a clinic fact (e.g. brand colour)
  "placeholder", // unknown; must be confirmed
]);
export type FactStatus = z.infer<typeof factStatus>;

const provenance = z.object({
  status: factStatus,
  sources: z.array(z.string().url()).default([]),
  note: z.string().optional(),
});
export type Provenance = z.infer<typeof provenance>;

/** [open, close], null = closed, or the placeholder when the source does not say. */
const dayHours = z.union([z.tuple([time, time]), z.null(), z.literal("[TO CONFIRM]")]);

export const clinicSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase kebab-case"),
  name: z.string().min(1),
  brandColor: hex,
  tagline: localized,
  intro: localized,
  address: localized,
  district: localized,
  metro: localized.optional(),
  phones: z
    .array(
      z.object({
        display: z.string().min(1),
        /** E.164 without spaces, e.g. +994124338217. Empty string when unknown. */
        tel: z.string().regex(/^(\+\d{8,15})?$/),
      }),
    )
    .min(1),
  /** Digits only (international format, no +), or the placeholder marker. */
  whatsapp: z.string().regex(/^(\d{8,15}|\[TO CONFIRM\])$/),
  instagram: z.string().optional(),
  facebook: z.string().url().optional(),
  website: z.string().url().optional(),
  map: z.object({
    /** Free-text query used for the Google Maps embed and directions link. */
    query: z.string().min(1),
  }),
  /**
   * Live Google reviews (needs GOOGLE_MAPS_API_KEY). Without placeId the place is
   * looked up by map.query inside Baku; set placeId to pin the exact listing.
   */
  google: z.object({ placeId: z.string().min(1).optional(), enabled: z.boolean().optional() }).optional(),
  /**
   * Hand-picked reviews copied from the clinic's Google Maps listing, for demos before the
   * live Google feed is switched on. Shown only when live Google reviews are unavailable.
   * Use the reviewer's first name + initial, and record who copied them and when in provenance.reviews.
   */
  featuredReviews: z
    .object({
      /** Link to the clinic's listing, so visitors can read the originals. */
      url: z.string().url().optional(),
      items: z
        .array(
          z.object({
            author: z.string().min(1),
            rating: z.number().int().min(1).max(5),
            text: z.string().min(1),
            /** As shown on Google, e.g. "2 ay əvvəl" / "a month ago". */
            date: z.string().optional(),
          }),
        )
        .min(1)
        .max(6),
    })
    .optional(),
  hours: z.union([
    z.literal(PLACEHOLDER),
    z.object({
      mon: dayHours,
      tue: dayHours,
      wed: dayHours,
      thu: dayHours,
      fri: dayHours,
      sat: dayHours,
      sun: dayHours,
    }),
  ]),
  open24h: z.boolean().default(false),
  /** Time window offered in the booking form; defaults to the opening hours of the chosen day. */
  bookingSlots: z
    .object({ start: time, end: time, stepMinutes: z.number().int().min(10).max(120).default(30) })
    .optional(),
  services: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        name: localized,
        description: localized.optional(),
        price: localized,
        status: factStatus.default("verified"),
      }),
    )
    .min(1),
  doctors: z.array(
    z.object({
      name: z.string().min(1),
      role: localized,
      status: factStatus.default("placeholder"),
    }),
  ),
  whyUs: z
    .array(
      z.object({
        icon: z.enum(["clock", "calendar", "shield", "map", "spark", "chat", "tooth", "star", "scan"]),
        title: localized,
        text: localized,
        status: factStatus.default("verified"),
      }),
    )
    .min(1),
  rating: z
    .object({
      platform: z.string(),
      /** Display value, e.g. "4.7" or "96%". */
      value: z.string(),
      kind: z.enum(["stars", "recommend"]),
      count: z.number().int().nonnegative(),
      asOf: z.string(),
      source: z.string().url(),
    })
    .optional(),
  /** Per-field provenance; keys are field names from this schema. */
  provenance: z.record(z.string(), provenance),
});

export type Clinic = z.infer<typeof clinicSchema>;
export type ClinicService = Clinic["services"][number];
export type OpeningHours = Exclude<Clinic["hours"], typeof PLACEHOLDER>;

/** Fields every clinic file must document in `provenance`. */
export const REQUIRED_PROVENANCE = [
  "name",
  "address",
  "district",
  "phones",
  "whatsapp",
  "instagram",
  "website",
  "hours",
  "services",
  "prices",
  "doctors",
  "rating",
  "map",
  "brandColor",
  "photos",
  "reviews",
] as const;
