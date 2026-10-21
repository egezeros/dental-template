import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ClinicSite } from "@/components/site/clinic-site";
import { clinicSlugs, getClinic } from "@/lib/clinics/load";
import { clinicMetadata } from "@/lib/clinics/metadata";
import { getGoogleReviews } from "@/lib/google-reviews";
import type { Locale } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string; lang: string }> };

/** Non-default languages. Azerbaijani lives at /<slug> itself. */
const EXTRA_LOCALES: Locale[] = ["ru", "en"];

export const dynamicParams = false;
// Re-render at most every 12 hours so live Google reviews stay fresh.
export const revalidate = 43200;

export function generateStaticParams() {
  // "az" is generated too, only to redirect /<slug>/az → /<slug>.
  return clinicSlugs().flatMap((slug) => [...EXTRA_LOCALES, "az"].map((lang) => ({ slug, lang })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const clinic = getClinic(slug);
  return clinic && EXTRA_LOCALES.includes(lang as Locale) ? clinicMetadata(clinic, lang as Locale) : {};
}

export default async function ClinicLocalePage({ params }: Props) {
  const { slug, lang } = await params;
  const clinic = getClinic(slug);
  if (clinic && lang === "az") permanentRedirect(`/${slug}`);
  if (!clinic || !EXTRA_LOCALES.includes(lang as Locale)) notFound();
  return <ClinicSite clinic={clinic} locale={lang as Locale} google={await getGoogleReviews(clinic, lang as Locale)} />;
}
