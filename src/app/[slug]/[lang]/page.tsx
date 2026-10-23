import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ClinicSite } from "@/components/site/clinic-site";
import { getClinic, getClinics } from "@/lib/clinics/load";
import { clinicMetadata } from "@/lib/clinics/metadata";
import { getGoogleReviews } from "@/lib/google-reviews";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string; lang: string }> };

export const dynamicParams = false;
// Re-render at most every 12 hours so live Google reviews stay fresh.
export const revalidate = 43200;

export function generateStaticParams() {
  // Every language a business uses; the default one is generated only to redirect /<slug>/<default> → /<slug>.
  return getClinics().flatMap((c) => c.locales.map((lang) => ({ slug: c.slug, lang })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const clinic = getClinic(slug);
  return clinic && isLocale(lang) && clinic.locales.includes(lang) ? clinicMetadata(clinic, lang) : {};
}

/** A business site in one of its other languages: /<slug>/<lang> */
export default async function ClinicLocalePage({ params }: Props) {
  const { slug, lang } = await params;
  const clinic = getClinic(slug);
  if (!clinic || !isLocale(lang) || !clinic.locales.includes(lang)) notFound();
  if (lang === clinic.locales[0]) permanentRedirect(`/${slug}`);
  return <ClinicSite clinic={clinic} locale={lang} google={await getGoogleReviews(clinic, lang)} />;
}
