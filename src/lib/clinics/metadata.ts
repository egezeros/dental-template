import type { Metadata } from "next";
import { siteDict, tr, type Locale } from "../i18n";
import type { Clinic } from "./schema";

export function clinicMetadata(clinic: Clinic, locale: Locale): Metadata {
  const t = siteDict(locale);
  return {
    title: `${clinic.name} — ${tr(clinic.tagline, locale)}`,
    description: tr(clinic.intro, locale),
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    other: { "demo-notice": t.demoBanner(clinic.name) },
  };
}
