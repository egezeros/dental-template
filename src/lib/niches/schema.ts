import { z } from "zod";

/**
 * A niche (dental, aesthetic, vet, …) is pure configuration: niches/<id>.json.
 * It picks from fixed libraries of sections, booking-field types, icons, theme presets
 * and follow-up rule types, so adding a niche never needs new code.
 */

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase kebab-case");
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected #rrggbb");
/**
 * Niche-level text in one or more languages. Every business using the niche must find all of
 * its own languages here; the clinic loader checks that (so a Turkish-only niche is fine).
 */
export const localizedFull = z
  .object({
    az: z.string().min(1).optional(),
    ru: z.string().min(1).optional(),
    en: z.string().min(1).optional(),
    tr: z.string().min(1).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "needs at least one language");

/** Page sections the template knows how to render, in any order. */
export const SECTION_IDS = [
  "hero",
  "emergency",
  "services",
  "packages",
  "audience",
  "doctors",
  "gallery",
  "why",
  "reviews",
  "faq",
  "booking",
  "location",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Icons available to niche configs and business files (see src/components/icons.tsx). */
export const ICON_NAMES = [
  "tooth",
  "sparkle",
  "paw",
  "clock",
  "calendar",
  "shield",
  "map",
  "spark",
  "chat",
  "star",
  "scan",
  "heart",
  "leaf",
  "syringe",
  "scissors",
  "home",
  "siren",
  "drop",
  "laser",
  "dog",
  "cat",
  "bird",
  "rabbit",
  "turtle",
  "fish",
  "razor",
] as const;
export type IconName = (typeof ICON_NAMES)[number];

/** Built-in booking field types. Core types appear once; text/select/specialist go into booking.details. */
export const FIELD_TYPES = ["name", "phone", "service", "specialist", "date", "time", "consent", "text", "select"] as const;
export const CORE_FIELD_TYPES = ["name", "phone", "service", "date", "time", "consent"] as const;
/** Core fields keep fixed ids so the booking API body stays the same for every niche. */
export const CORE_FIELD_IDS: Record<(typeof CORE_FIELD_TYPES)[number], string> = {
  name: "name",
  phone: "phone",
  service: "serviceId",
  date: "date",
  time: "time",
  consent: "consent",
};
export type FieldType = (typeof FIELD_TYPES)[number];
/** Request-body keys the booking API uses for other things; extra fields may not take them. */
const RESERVED_FIELD_IDS = ["company", "locale", "details", "source", "status", "clinicSlug", "serviceName"];

const fieldSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-zA-Z0-9]*$/, "camelCase id"),
    type: z.enum(FIELD_TYPES),
    /** Overrides the default label of a built-in type; required for text/select. */
    label: localizedFull.optional(),
    placeholder: localizedFull.optional(),
    required: z.boolean().default(true),
    /**
     * Text fields are deliberately short (names, not notes): free-text boxes invite people to
     * type health details, which this template never collects.
     */
    maxLength: z.number().int().min(1).max(40).optional(),
    options: z.array(z.object({ value: slug, label: localizedFull })).optional(),
  })
  .superRefine((f, ctx) => {
    if ((f.type === "text" || f.type === "select") && !f.label) {
      ctx.addIssue({ code: "custom", message: `field "${f.id}": text/select fields need a label` });
    }
    if (f.type === "select" && !(f.options && f.options.length >= 2)) {
      ctx.addIssue({ code: "custom", message: `field "${f.id}": select fields need at least 2 options` });
    }
    if (f.type !== "select" && f.options) {
      ctx.addIssue({ code: "custom", message: `field "${f.id}": only select fields take options` });
    }
  });
export type BookingFieldConfig = z.infer<typeof fieldSchema>;

/** Which past visits a follow-up rule looks at. Empty = any service. */
const matchSchema = z
  .object({
    services: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
  })
  .default({});

const ruleBase = {
  id: slug,
  /** Staff-facing name, e.g. "6-month check-up". */
  label: localizedFull,
  match: matchSchema,
  /** Notify this many days before the due date. */
  leadDays: z.number().int().min(0).max(60).default(3),
  /** Track per patient (phone) or per pet (phone + pet name). */
  per: z.enum(["patient", "pet"]).default("patient"),
  /** Stop listing an unanswered follow-up this many days after its due date. */
  stopAfterDays: z.number().int().min(1).max(365).default(30),
  /**
   * Patient message. Placeholders: {firstName} {clinic} {service} {petName} {dueDate}
   * {session} {sessions} {phone}.
   */
  message: localizedFull,
};

export const followUpRuleSchema = z.discriminatedUnion("type", [
  /** Due a fixed number of days after the last matching visit (check-ups, vaccinations). */
  z.object({ ...ruleBase, type: z.literal("interval"), afterDays: z.number().int().min(1).max(3650) }),
  /** Next session of a treatment course; sessions and interval come from each service's `course`. */
  z.object({ ...ruleBase, type: z.literal("course") }),
]);
export type FollowUpRule = z.infer<typeof followUpRuleSchema>;

export const nicheSchema = z
  .object({
    id: slug,
    label: localizedFull,
    theme: z.object({
      /** Visual preset defined in globals.css: clinical (dental), luxe (beauty), warm (vet), bold (barber). */
      preset: z.enum(["clinical", "luxe", "warm", "bold"]),
      /** Default brand colour for businesses that don't set one. */
      brandColor: hex,
      /** Monogram icon in the header and footer. */
      icon: z.enum(ICON_NAMES),
      /** Neutral illustration used as the hero image placeholder. */
      heroArt: z.enum(["dental", "beauty", "pet", "barber"]),
      /** Show a prominent emergency call button in the header (vet). */
      emergencyInHeader: z.boolean().default(false),
      /** Emoji that opens staff Telegram notifications. */
      emoji: z.string().min(1).max(8).default("📅"),
    }),
    /** Page sections in display order. Sections without data in a business file are skipped. */
    sections: z.array(z.enum(SECTION_IDS)).min(1),
    /** Sections linked from the header navigation (large screens). */
    nav: z.array(z.enum(SECTION_IDS)).default([]),
    services: z
      .object({
        /** When set, every service must name one of these categories and the page groups by them. */
        categories: z
          .array(z.object({ id: slug, label: localizedFull, icon: z.enum(ICON_NAMES).optional() }))
          .default([]),
      })
      .default({ categories: [] }),
    /** Options for the "audience" section and business `audience` lists (e.g. pet types). */
    audience: z
      .object({ options: z.array(z.object({ id: slug, label: localizedFull, icon: z.enum(ICON_NAMES) })).min(1) })
      .optional(),
    booking: z.object({ fields: z.array(fieldSchema).min(1) }),
    /**
     * Copy overrides: dotted keys into the site dictionary (src/lib/i18n.ts), e.g.
     * "doctors.title". Only plain-string entries can be overridden.
     */
    copy: z.record(z.string(), localizedFull).default({}),
    /** Same, for the admin dashboard dictionary. */
    adminCopy: z.record(z.string(), localizedFull).default({}),
    /** Generic FAQ shown when a business has none of its own. No medical claims. */
    faq: z.array(z.object({ q: localizedFull, a: localizedFull })).default([]),
    reminders: z
      .object({
        /**
         * Day-before appointment reminder text; omit to use the built-in default. Placeholders:
         * {firstName} {clinic} {date} {time} {service} {address} {phone} {petName}.
         */
        appointment: z.object({ message: localizedFull.optional() }).default({}),
        followUps: z.array(followUpRuleSchema).default([]),
      })
      .default({ appointment: {}, followUps: [] }),
    /** Values used to fill extra booking fields in fictional demo data (e.g. pet names). */
    demo: z.object({ values: z.record(z.string(), z.array(z.string()).min(1)).default({}) }).default({ values: {} }),
  })
  .superRefine((n, ctx) => {
    for (const core of CORE_FIELD_TYPES) {
      const matches = n.booking.fields.filter((f) => f.type === core);
      if (matches.length !== 1) ctx.addIssue({ code: "custom", message: `booking.fields must contain exactly one "${core}" field` });
      else if (matches[0].id !== CORE_FIELD_IDS[core]) {
        ctx.addIssue({ code: "custom", message: `the "${core}" field must have id "${CORE_FIELD_IDS[core]}"` });
      }
    }
    if (n.booking.fields.filter((f) => f.type === "specialist").length > 1) {
      ctx.addIssue({ code: "custom", message: "at most one specialist field" });
    }
    for (const f of n.booking.fields) {
      const isCore = (CORE_FIELD_TYPES as readonly string[]).includes(f.type);
      if (!isCore && (RESERVED_FIELD_IDS.includes(f.id) || Object.values(CORE_FIELD_IDS).includes(f.id))) {
        ctx.addIssue({ code: "custom", message: `booking field id "${f.id}" is reserved` });
      }
    }
    const ids = n.booking.fields.map((f) => f.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "booking field ids must be unique" });
    const ruleIds = n.reminders.followUps.map((r) => r.id);
    if (new Set(ruleIds).size !== ruleIds.length) ctx.addIssue({ code: "custom", message: "follow-up rule ids must be unique" });
    const categoryIds = new Set(n.services.categories.map((c) => c.id));
    for (const r of n.reminders.followUps) {
      for (const c of r.match.categories ?? []) {
        if (!categoryIds.has(c)) ctx.addIssue({ code: "custom", message: `rule "${r.id}": unknown category "${c}"` });
      }
      if (r.per === "pet" && !n.booking.fields.some((f) => f.id === "petName")) {
        ctx.addIssue({ code: "custom", message: `rule "${r.id}": per "pet" needs a booking field with id "petName"` });
      }
    }
    if (n.sections.includes("audience") && !n.audience) {
      ctx.addIssue({ code: "custom", message: 'the "audience" section needs audience.options' });
    }
  });

export type Niche = z.infer<typeof nicheSchema>;
