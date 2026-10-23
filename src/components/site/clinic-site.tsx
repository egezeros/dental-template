import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import { ICONS, SirenIcon } from "@/components/icons";
import { isPlaceholder, type Clinic } from "@/lib/clinics/schema";
import { agencyName, demoWhatsAppOverride, isDemoMode } from "@/lib/config";
import type { GooglePlaceReviews } from "@/lib/google-reviews";
import { LOCALE_LABELS, tr, type Locale } from "@/lib/i18n";
import { nicheSiteDict } from "@/lib/niches/copy";
import { getNiche } from "@/lib/niches/load";
import type { SectionId } from "@/lib/niches/schema";
import { Fill } from "./fill";
import { FloatingActions } from "./floating-actions";
import { emergencyPhones, hasSection, SECTIONS, SELF_STYLED, type SiteContext } from "./sections";

/** Page URL for a language: the business's default language lives at /<slug>, others at /<slug>/<lang>. */
export function clinicHref(clinic: Pick<Clinic, "slug" | "locales">, locale: Locale): string {
  return locale === clinic.locales[0] ? `/${clinic.slug}` : `/${clinic.slug}/${locale}`;
}

/**
 * A business website. Everything niche-specific — sections and their order, theme, icon,
 * wording, booking fields — comes from niches/<niche>.json; the facts come from clinics/<slug>.json.
 */
export function ClinicSite({
  clinic,
  locale,
  google = null,
}: {
  clinic: Clinic;
  locale: Locale;
  /** Live Google rating + reviews, when GOOGLE_MAPS_API_KEY is configured. */
  google?: GooglePlaceReviews | null;
}) {
  const niche = getNiche(clinic.niche);
  const t = nicheSiteDict(niche, locale);
  const demo = isDemoMode();
  const L = (v: Parameters<typeof tr>[0]) => tr(v, locale);
  const Icon = ICONS[niche.theme.icon];

  const override = demo ? demoWhatsAppOverride() : undefined;
  const waNumber = override ?? (isPlaceholder(clinic.whatsapp) ? null : clinic.whatsapp);
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(t.whatsappMessage(clinic.name))}`
    : null;
  const primaryTel = clinic.phones.find((p) => p.tel)?.tel ?? null;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.map.query)}`;

  // A live Google rating beats the researched snapshot in the clinic file.
  const rating =
    google?.rating && google.count
      ? {
          value: google.rating.toFixed(1),
          kind: "stars" as const,
          platform: "Google",
          count: google.count,
          source: google.mapsUri ?? directions,
        }
      : clinic.rating;
  // Live Google reviews win; otherwise hand-picked reviews from the clinic file; otherwise samples.
  const reviews: GooglePlaceReviews | null =
    google && google.reviews.length > 0
      ? google
      : clinic.featuredReviews
        ? {
            placeId: "",
            mapsUri: clinic.featuredReviews.url,
            reviews: clinic.featuredReviews.items.map((r) => ({
              author: r.author,
              rating: r.rating,
              text: r.text,
              relativeTime: r.date ? L(r.date) : "",
            })),
          }
        : null;

  const ctx: SiteContext = {
    clinic,
    niche,
    locale,
    t,
    L,
    status: (key) => clinic.provenance[key]?.status,
    demo,
    rating,
    reviews,
    primaryTel,
    directions,
    mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(clinic.map.query)}&hl=${locale}&z=16&output=embed`,
  };

  const sections = (clinic.sections ?? niche.sections).filter((id) => hasSection(id, ctx));
  const navLabel: Record<SectionId, string> = {
    hero: clinic.name,
    emergency: t.nav.emergency,
    services: t.nav.services,
    packages: t.nav.packages,
    audience: t.nav.audience,
    doctors: t.nav.doctors,
    gallery: t.nav.gallery,
    why: t.nav.why,
    reviews: t.nav.reviews,
    faq: t.nav.faq,
    booking: t.hero.cta,
    location: t.nav.location,
  };
  const nav = niche.nav.filter((id) => sections.includes(id));
  const emergencyTel = niche.theme.emergencyInHeader ? (emergencyPhones(clinic).find((p) => p.tel)?.tel ?? null) : null;

  // Regular sections alternate between the page canvas and the surface colour.
  let position = 0;
  const rendered = sections.map((id) => {
    const tone = SELF_STYLED.includes(id) ? "plain" : ++position % 2 === 0 ? "surface" : "plain";
    return <Fragment key={id}>{SECTIONS[id](ctx, tone)}</Fragment>;
  });

  return (
    <div
      style={{ "--brand": clinic.brandColor } as CSSProperties}
      lang={locale}
      data-theme={niche.theme.preset}
      className="min-h-screen pb-20 md:pb-0"
    >
      {/* Discreet demo notice */}
      <div className="bg-ink px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-white/75">
        {t.demoBanner(clinic.name)}
      </div>

      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href={clinicHref(clinic, locale)} className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white" aria-hidden="true">
              <Icon size={20} />
            </span>
            <span
              className={`truncate font-display tracking-tight ${
                niche.theme.preset === "luxe" ? "text-xl font-medium" : "text-base font-semibold"
              }`}
            >
              {clinic.name}
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted lg:flex" aria-label="Main">
            {nav.map((id) => (
              <a key={id} href={`#${id}`} className="hover:text-brand">
                {navLabel[id]}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {emergencyTel && (
              <a
                href={`tel:${emergencyTel}`}
                className="btn bg-rose-700 px-3 py-2 text-white hover:bg-rose-800"
                aria-label={`${t.emergency.title} ${t.emergency.call}`}
              >
                <SirenIcon size={16} />
                <span className="hidden sm:inline">{t.nav.emergency}</span>
              </a>
            )}
            <div className="flex rounded-full bg-canvas p-0.5 ring-1 ring-line" role="navigation" aria-label="Language">
              {clinic.locales.map((l) => (
                <Link
                  key={l}
                  href={clinicHref(clinic, l)}
                  hrefLang={l}
                  aria-current={l === locale ? "page" : undefined}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    l === locale ? "bg-surface text-brand shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </Link>
              ))}
            </div>
            <a href="#booking" className="btn-primary hidden px-4 py-2 md:inline-flex">
              {t.hero.cta}
            </a>
          </div>
        </div>
      </header>

      <main>{rendered}</main>

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted md:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 font-semibold text-ink">
              <Icon size={18} className="text-brand" />
              {clinic.name}
            </p>
            <p className="mt-2">
              <Fill text={L(clinic.address)} />
            </p>
          </div>
          <div className="space-y-1.5">
            {clinic.phones.map((p) => (
              <p key={p.display}>
                {p.tel ? (
                  <a href={`tel:${p.tel}`} className="hover:text-brand">
                    {p.display}
                  </a>
                ) : (
                  <Fill text={p.display} />
                )}
              </p>
            ))}
          </div>
          <div className="space-y-2 text-xs">
            <p>{t.footer.privacy}</p>
            <p>{t.footer.demo(agencyName())}</p>
            <p>© {new Date().getFullYear()} {clinic.name}</p>
          </div>
        </div>
      </footer>

      <FloatingActions
        whatsappHref={waHref}
        whatsappAria={t.whatsappAria}
        whatsappMissing={t.whatsappMissing}
        tel={primaryTel}
        callLabel={t.hero.call}
        bookLabel={t.hero.cta}
      />
    </div>
  );
}
