import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  ExternalIcon,
  FacebookIcon,
  GlobeIcon,
  ICONS,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  QuoteIcon,
  StarIcon,
  ToothIcon,
} from "@/components/icons";
import { isPlaceholder, PLACEHOLDER, type Clinic } from "@/lib/clinics/schema";
import { slotsByWeekday } from "@/lib/clinics/slots";
import { agencyName, demoWhatsAppOverride, isDemoMode } from "@/lib/config";
import { LOCALE_LABELS, LOCALES, siteDict, tr, WEEKDAYS, type Locale } from "@/lib/i18n";
import { BookingForm, type BookingFormText } from "./booking-form";
import { ConfirmBadge, Fill } from "./fill";
import { FloatingActions, ServiceBookLink } from "./floating-actions";
import { HoursTable } from "./hours-table";
import { AvatarPlaceholder, PlaceholderImage } from "./placeholder-art";

export function clinicHref(slug: string, locale: Locale): string {
  return locale === "az" ? `/${slug}` : `/${slug}/${locale}`;
}

export function ClinicSite({ clinic, locale }: { clinic: Clinic; locale: Locale }) {
  const t = siteDict(locale);
  const demo = isDemoMode();
  const L = (v: Parameters<typeof tr>[0]) => tr(v, locale);
  const status = (key: string) => clinic.provenance[key]?.status;

  const override = demo ? demoWhatsAppOverride() : undefined;
  const waNumber = override ?? (isPlaceholder(clinic.whatsapp) ? null : clinic.whatsapp);
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(t.whatsappMessage(clinic.name))}`
    : null;
  const primaryTel = clinic.phones.find((p) => p.tel)?.tel ?? null;
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(clinic.map.query)}&hl=${locale}&z=16&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.map.query)}`;

  const formText: BookingFormText = { ...t.booking, consent: t.booking.consent(clinic.name) };
  const hoursRows = WEEKDAYS.map((d) => {
    const h = clinic.hours === PLACEHOLDER ? PLACEHOLDER : clinic.hours[d];
    const value =
      h === PLACEHOLDER
        ? PLACEHOLDER
        : h === null
          ? t.hours.closed
          : h[0] === "00:00" && h[1] === "24:00"
            ? t.hours.allDay
            : `${h[0]} – ${h[1]}`;
    return { day: d, label: t.days[d], value, closed: h === null };
  });

  const nav = [
    ["services", t.nav.services],
    ["why", t.nav.why],
    ["doctors", t.nav.doctors],
    ["reviews", t.nav.reviews],
    ["location", t.nav.location],
  ] as const;

  return (
    <div style={{ "--brand": clinic.brandColor } as CSSProperties} lang={locale} className="min-h-screen pb-20 md:pb-0">
      {/* Discreet demo notice */}
      <div className="bg-ink px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-white/75">
        {t.demoBanner(clinic.name)}
      </div>

      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href={clinicHref(clinic.slug, locale)} className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white" aria-hidden="true">
              <ToothIcon size={20} />
            </span>
            <span className="truncate text-base font-semibold tracking-tight">{clinic.name}</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted lg:flex" aria-label="Main">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="hover:text-brand">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-canvas p-0.5 ring-1 ring-line" role="navigation" aria-label="Language">
              {LOCALES.map((l) => (
                <Link
                  key={l}
                  href={clinicHref(clinic.slug, l)}
                  hrefLang={l}
                  aria-current={l === locale ? "page" : undefined}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    l === locale ? "bg-white text-brand shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"
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

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand/10 via-brand/[0.03] to-transparent" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-14 md:grid-cols-[1.05fr_0.95fr] md:pt-16 md:pb-20">
            <div>
              <p className="inline-flex flex-wrap items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/20">
                <MapPinIcon size={14} />
                {L(clinic.district)}
                {clinic.open24h && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-brand/40" />
                    <ClockIcon size={14} />
                    {t.hours.open24}
                  </>
                )}
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance md:text-5xl">{clinic.name}</h1>
              <p className="mt-3 text-lg font-medium text-balance text-brand md:text-xl">{L(clinic.tagline)}</p>
              <p className="mt-4 max-w-xl leading-relaxed text-muted">{L(clinic.intro)}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#booking" className="btn-primary px-6 py-3.5 text-base">
                  <CalendarIcon size={18} />
                  {t.hero.cta}
                </a>
                {primaryTel && (
                  <a href={`tel:${primaryTel}`} className="btn-secondary px-6 py-3.5 text-base">
                    <PhoneIcon size={18} />
                    {t.hero.call}
                  </a>
                )}
              </div>
              <p className="mt-3 text-xs text-muted">{t.hero.note}</p>
              {clinic.rating && (
                <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                  <StarIcon size={16} className="text-amber-500" fill="currentColor" />
                  <span className="whitespace-nowrap">
                    <span className="font-semibold text-ink">{clinic.rating.value}</span>
                    {clinic.rating.kind === "recommend" ? ` ${t.reviews.recommend}` : ""}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">{clinic.rating.platform}</span>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">{t.reviews.ratingsCount(clinic.rating.count)}</span>
                </p>
              )}
            </div>
            <PlaceholderImage label={t.placeholderImage} className="aspect-[4/3] w-full" />
          </div>
        </section>

        {/* Services & prices */}
        <section id="services" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="eyebrow">{t.nav.services}</p>
          <h2 className="section-title mt-2">{t.services.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{t.services.subtitle}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clinic.services.map((s) => (
              <li key={s.id} className="card flex flex-col justify-between gap-3 p-4 md:p-5">
                <div>
                  <h3 className="font-semibold">
                    {L(s.name)}
                    <ConfirmBadge status={s.status} />
                  </h3>
                  {s.description && <p className="mt-1 text-sm text-muted">{L(s.description)}</p>}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
                  <span className="text-sm font-semibold text-ink">
                    <Fill text={L(s.price)} />
                  </span>
                  <ServiceBookLink serviceId={s.id} label={t.services.book} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Why choose us */}
        <section id="why" className="bg-white py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="eyebrow">{t.nav.why}</p>
            <h2 className="section-title mt-2">{t.why.title}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clinic.whyUs.map((w, i) => {
                const Icon = ICONS[w.icon];
                return (
                  <li key={i} className="rounded-2xl bg-canvas p-5 ring-1 ring-line/70">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                      <Icon size={22} />
                    </span>
                    <h3 className="mt-4 font-semibold">
                      {L(w.title)}
                      {!isPlaceholder(L(w.text)) && <ConfirmBadge status={w.status} />}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      <Fill text={L(w.text)} />
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Doctors */}
        <section id="doctors" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="eyebrow">{t.doctors.subtitle}</p>
          <h2 className="section-title mt-2">
            {t.doctors.title}
            <ConfirmBadge status={status("doctors")} />
          </h2>
          <ul className="mt-8 grid grid-cols-3 gap-2.5 md:gap-4">
            {clinic.doctors.map((d, i) => (
              <li key={i} className="card p-2 md:p-3">
                <AvatarPlaceholder label={t.photoPlaceholder} />
                <div className="px-0.5 pt-2.5 pb-1 md:px-1 md:pt-3">
                  <p className="text-sm font-semibold md:text-base">
                    <Fill text={d.name} />
                  </p>
                  <p className="text-xs text-muted md:text-sm">{L(d.role)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Reviews (sample placeholders, never attributed to real people) */}
        <section id="reviews" className="bg-white py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="eyebrow">{t.nav.reviews}</p>
            <h2 className="section-title mt-2">{t.reviews.title}</h2>
            {clinic.rating && (
              <div className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-canvas px-4 py-3 ring-1 ring-line">
                <StarIcon size={20} className="text-amber-500" fill="currentColor" />
                <span className="text-2xl font-semibold">{clinic.rating.value}</span>
                <span className="text-sm text-muted">
                  {clinic.rating.kind === "recommend" ? `${t.reviews.recommend} · ` : ""}
                  {t.reviews.ratingOn(clinic.rating.platform)} · {t.reviews.ratingsCount(clinic.rating.count)}
                </span>
                <a
                  href={clinic.rating.source}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  {t.reviews.source} <ExternalIcon size={12} />
                </a>
              </div>
            )}
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 outline-1 outline-amber-300 outline-dashed">
              {t.reviews.sampleLabel}
            </p>
            <ul className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
              {[1, 2, 3].map((n) => (
                <li key={n} className="w-[82%] shrink-0 snap-start rounded-2xl bg-canvas p-5 ring-1 ring-line/70 md:w-auto">
                  <QuoteIcon size={22} className="text-brand/50" />
                  <p className="mt-3 text-sm leading-relaxed text-muted italic">{t.reviews.sampleText}</p>
                  <p className="mt-4 text-sm font-semibold">
                    {t.reviews.sampleAuthor} #{n}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Booking */}
        <section id="booking" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
            <div>
              <p className="eyebrow">{t.hero.cta}</p>
              <h2 className="section-title mt-2">{t.booking.title}</h2>
              <p className="mt-3 leading-relaxed text-muted">{t.booking.subtitle}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {clinic.phones.map((p) => (
                  <li key={p.display}>
                    {p.tel ? (
                      <a href={`tel:${p.tel}`} className="inline-flex items-center gap-2 font-medium hover:text-brand">
                        <PhoneIcon size={16} className="text-brand" />
                        {p.display}
                      </a>
                    ) : (
                      <Fill text={p.display} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5 md:p-7">
              <BookingForm
                slug={clinic.slug}
                locale={locale}
                services={clinic.services.map((s) => ({ id: s.id, name: L(s.name) }))}
                slotsByWeekday={slotsByWeekday(clinic)}
                text={formText}
                demo={demo}
              />
            </div>
          </div>
        </section>

        {/* Location & hours */}
        <section id="location" className="bg-white py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="eyebrow">{t.nav.location}</p>
              <h2 className="section-title mt-2">{t.location.title}</h2>
              <p className="mt-3 flex items-start gap-2 text-muted">
                <MapPinIcon size={18} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  {L(clinic.address)}
                  <ConfirmBadge status={status("address")} />
                </span>
              </p>
              <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-line">
                <iframe
                  title={`${clinic.name} — Google Maps`}
                  src={mapEmbed}
                  className="aspect-[4/3] w-full md:aspect-[16/10]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={directions} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  {t.location.directions}
                  <ArrowRightIcon size={16} />
                </a>
                {clinic.instagram && (
                  <a
                    href={`https://www.instagram.com/${clinic.instagram}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <InstagramIcon size={16} />@{clinic.instagram}
                  </a>
                )}
                {clinic.facebook && (
                  <a href={clinic.facebook} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <FacebookIcon size={16} />
                    Facebook
                  </a>
                )}
                {clinic.website && (
                  <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <GlobeIcon size={16} />
                    {t.location.website}
                  </a>
                )}
              </div>
            </div>
            <div id="hours">
              <p className="eyebrow">{t.nav.hours}</p>
              <h2 className="section-title mt-2">
                {t.hours.title}
                <ConfirmBadge status={status("hours")} />
              </h2>
              <HoursTable rows={hoursRows} todayLabel={t.hours.today} />
              {clinic.open24h && clinic.bookingSlots && (
                <p className="mt-3 text-xs text-muted">
                  {t.hours.nightNote(clinic.bookingSlots.start, clinic.bookingSlots.end)}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted md:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 font-semibold text-ink">
              <ToothIcon size={18} className="text-brand" />
              {clinic.name}
            </p>
            <p className="mt-2">{L(clinic.address)}</p>
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
