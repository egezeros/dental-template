import { adminDict, siteDict, type AdminDictionary, type Locale, type SiteDictionary } from "../i18n";
import type { Niche } from "./schema";

type Overrides = Record<string, Partial<Record<Locale, string>>>;

/** Deep copy that keeps functions (dictionary entries like demoBanner(name) are functions). */
function cloneDict<T>(value: T): T {
  if (Array.isArray(value)) return value.map(cloneDict) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cloneDict(v)])) as T;
  }
  return value;
}

/**
 * Apply dotted-key overrides ("doctors.title") from a niche config to a dictionary.
 * Only existing plain-string entries can be overridden; anything else is a config error.
 */
export function applyCopy<T extends object>(base: T, overrides: Overrides, locale: Locale): T {
  const out = cloneDict(base);
  for (const [dotted, value] of Object.entries(overrides)) {
    const keys = dotted.split(".");
    let node: Record<string, unknown> = out as Record<string, unknown>;
    for (const k of keys.slice(0, -1)) {
      const next = node[k];
      if (!next || typeof next !== "object") throw new Error(`copy key "${dotted}" does not exist`);
      node = next as Record<string, unknown>;
    }
    const last = keys[keys.length - 1];
    if (typeof node[last] !== "string") throw new Error(`copy key "${dotted}" is not a plain text entry`);
    // A language the override doesn't cover keeps the base text (the loader checks each
    // business's languages are covered).
    const text = value[locale];
    if (text !== undefined) node[last] = text;
  }
  return out;
}

const siteCache = new Map<string, SiteDictionary>();
const adminCache = new Map<string, AdminDictionary>();

/** Site dictionary for a niche: the base texts with the niche's tone/terminology applied. */
// Cache in production only, so edits to niches/*.json show up immediately in `next dev`.
const useCache = () => process.env.NODE_ENV === "production";

export function nicheSiteDict(niche: Niche, locale: Locale): SiteDictionary {
  const key = `${niche.id}:${locale}`;
  if (useCache() && siteCache.has(key)) return siteCache.get(key)!;
  const dict = applyCopy(siteDict(locale), niche.copy, locale);
  siteCache.set(key, dict);
  return dict;
}

export function nicheAdminDict(niche: Niche, locale: Locale): AdminDictionary {
  const key = `${niche.id}:${locale}`;
  if (useCache() && adminCache.has(key)) return adminCache.get(key)!;
  const dict = applyCopy(adminDict(locale), niche.adminCopy, locale);
  adminCache.set(key, dict);
  return dict;
}
