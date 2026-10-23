import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClinicSite } from "@/components/site/clinic-site";
import { clinicSlugs, getClinic } from "@/lib/clinics/load";
import { clinicMetadata } from "@/lib/clinics/metadata";
import { getGoogleReviews } from "@/lib/google-reviews";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
// Re-render at most every 12 hours so live Google reviews stay fresh.
export const revalidate = 43200;

export function generateStaticParams() {
  return clinicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const clinic = getClinic((await params).slug);
  return clinic ? clinicMetadata(clinic, clinic.locales[0]) : {};
}

/** A business site in its default language (the first of its `locales`): /<slug> */
export default async function ClinicPage({ params }: Props) {
  const clinic = getClinic((await params).slug);
  if (!clinic) notFound();
  const locale = clinic.locales[0];
  return <ClinicSite clinic={clinic} locale={locale} google={await getGoogleReviews(clinic, locale)} />;
}
