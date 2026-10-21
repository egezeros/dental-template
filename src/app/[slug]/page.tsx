import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClinicSite } from "@/components/site/clinic-site";
import { clinicSlugs, getClinic } from "@/lib/clinics/load";
import { clinicMetadata } from "@/lib/clinics/metadata";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return clinicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const clinic = getClinic((await params).slug);
  return clinic ? clinicMetadata(clinic, "az") : {};
}

/** Azerbaijani (default language) version of a clinic site: /<slug> */
export default async function ClinicPage({ params }: Props) {
  const clinic = getClinic((await params).slug);
  if (!clinic) notFound();
  return <ClinicSite clinic={clinic} locale="az" />;
}
