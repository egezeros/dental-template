import type { CSSProperties, ReactNode } from "react";
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
  SirenIcon,
  StarIcon,
} from "@/components/icons";
import { extraFields } from "@/lib/booking/fields";
import { COUNTRIES, isPlaceholder, PLACEHOLDER, type Clinic, type FactStatus } from "@/lib/clinics/schema";
import { slotsByWeekday } from "@/lib/clinics/slots";
import type { GooglePlaceReviews } from "@/lib/google-reviews";
import { tr, WEEKDAYS, type Locale, type Localized, type SiteDictionary } from "@/lib/i18n";
import type { Niche, SectionId } from "@/lib/niches/schema";
import { BookingForm, type BookingFormText, type FormField } from "./booking-form";
import { ConfirmBadge, Fill } from "./fill";
import { ServiceBookLink } from "./floating-actions";
import { GoogleReviews } from "./google-reviews";
import { HoursTable } from "./hours-table";
import { AvatarPlaceholder, BeforeAfterPlaceholder, PlaceholderImage } from "./placeholder-art";

/** Everything a section needs, resolved once per page. */
export interface SiteContext {
  clinic: Clinic;
  niche: Niche;
  locale: Locale;
  t: SiteDictionary;
  L: (v: Localized | undefined) => string;
  status: (key: string) => FactStatus | undefined;
  demo: boolean;
  rating: { value: string; kind: "stars" | "recommend"; platform: string; count: number; source: string } | undefined;
  reviews: GooglePlaceReviews | null;
  primaryTel: string | null;
  directions: string;
  mapEmbed: string;
}

type Tone = "plain" | "surface";

/** Background for cards inside a section: the opposite of the section's own tone. */
const inset = (tone: Tone) => (tone === "surface" ? "bg-canvas" : "bg-surface");

function Section({ id, tone, inner = "", children }: { id: string; tone: Tone; inner?: string; children: ReactNode }) {
  return (
    <section id={id} className={tone === "surface" ? "bg-surface py-14 md:py-20" : "py-14 md:py-20"}>
      <div className={`mx-auto max-w-6xl px-4 ${inner}`}>{children}</div>
    </section>
  );
}

function Heading({ eyebrow, title, badge, sub }: { eyebrow: string; title: string; badge?: FactStatus; sub?: string }) {
  return (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-2">
        {title}
        {badge && <ConfirmBadge status={badge} />}
      </h2>
      {sub && <p className="mt-2 max-w-2xl text-sm text-muted">{sub}</p>}
    </>
  );
}

/** Emergency phones: the business's own emergency line, else its main numbers. */
export function emergencyPhones(clinic: Clinic) {
  return clinic.emergency?.phones?.length ? clinic.emergency.phones : clinic.phones;
}

/** Which sections have something to show for this business. */
export function hasSection(id: SectionId, ctx: SiteContext): boolean {
  const { clinic } = ctx;
  switch (id) {
    case "packages":
      return Boolean(clinic.packages?.length);
    case "audience":
      return Boolean(ctx.niche.audience && clinic.audience?.length);
    case "faq":
      return (clinic.faq ?? ctx.niche.faq).length > 0;
    default:
      return true;
  }
}

/** Form fields for this business, from the niche config, in the page language. */
export function bookingFormFields(ctx: SiteContext): FormField[] {
  const { niche, clinic, locale, t } = ctx;
  const extras = new Map(extraFields(clinic, niche).map((f) => [f.id, f]));
  const core: Record<string, string> = {
    name: t.booking.name,
    phone: t.booking.phone,
    service: t.booking.service,
    date: t.booking.date,
    time: t.booking.time,
    consent: "",
  };
  const out: FormField[] = [];
  for (const f of niche.booking.fields) {
    const label = f.label ? tr(f.label, locale) : undefined;
    const placeholder = f.placeholder ? tr(f.placeholder, locale) : undefined;
    if (f.type in core) {
      out.push({ id: f.id, type: f.type, label: label ?? core[f.type], placeholder, required: true });
      continue;
    }
    const x = extras.get(f.id);
    if (!x) continue; // e.g. a specialist field when no specialist is confirmed yet
    const options = x.options.map((o) => ({ value: o.value, label: tr(o.label, locale) }));
    out.push({
      id: f.id,
      type: x.type,
      label: label ?? (x.type === "specialist" ? t.booking.specialist : f.id),
      placeholder,
      required: x.required,
      maxLength: x.maxLength,
      options: x.type === "specialist" && !x.required ? [{ value: "", label: t.booking.anySpecialist }, ...options] : options,
    });
  }
  return out;
}

// ─── Hero ──────────────────────────────────────────────────────────────────────────────────

const HERO_BACKDROP: Record<Niche["theme"]["preset"], CSSProperties | undefined> = {
  clinical: undefined,
  luxe: {
    background:
      "radial-gradient(55% 60% at 88% 8%, color-mix(in oklab, var(--brand) 16%, transparent), transparent 70%)," +
      "radial-gradient(45% 55% at 0% 100%, color-mix(in oklab, var(--brand) 9%, transparent), transparent 70%)",
  },
  warm: {
    background:
      "radial-gradient(60% 70% at 100% 0%, color-mix(in oklab, var(--brand) 14%, transparent), transparent 70%)," +
      "radial-gradient(40% 50% at 0% 90%, color-mix(in oklab, #f2b33d 16%, transparent), transparent 70%)",
  },
  // Barber: a faint diagonal stripe, a nod to the barber pole.
  bold: {
    background:
      "repeating-linear-gradient(135deg, color-mix(in oklab, var(--brand) 6%, transparent) 0 18px, transparent 18px 46px)," +
      "linear-gradient(180deg, color-mix(in oklab, var(--brand) 8%, transparent), transparent 85%)",
  },
};

function Hero(ctx: SiteContext) {
  const { clinic, t, L, rating, primaryTel } = ctx;
  const preset = ctx.niche.theme.preset;
  const backdrop = HERO_BACKDROP[preset];
  const luxe = preset === "luxe";
  return (
    // Themed presets paint the page background on the wrapper, so their hero needs its own stacking context.
    <section className={`relative overflow-hidden ${backdrop ? "isolate" : ""}`}>
      {backdrop ? (
        <div className="absolute inset-0 -z-10" style={backdrop} />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand/10 via-brand/[0.03] to-transparent" />
      )}
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-14 md:grid-cols-[1.05fr_0.95fr] md:pt-16 md:pb-20">
        <div>
          <p className="inline-flex flex-wrap items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/20">
            <MapPinIcon size={14} />
            <Fill text={L(clinic.district)} />
            {clinic.open24h && (
              <>
                <span className="h-1 w-1 rounded-full bg-brand/40" />
                <ClockIcon size={14} />
                {t.hours.open24}
              </>
            )}
          </p>
          <h1
            className={`mt-5 font-display tracking-tight text-balance ${
              luxe
                ? "text-5xl leading-[1.02] font-medium md:text-7xl"
                : preset === "warm"
                  ? "text-4xl font-extrabold md:text-5xl"
                  : preset === "bold"
                    ? "text-5xl leading-[1.08] font-bold uppercase md:text-7xl"
                    : "text-4xl font-semibold md:text-5xl"
            }`}
          >
            {clinic.name}
          </h1>
          <p
            className={`mt-3 text-balance text-brand ${
              luxe ? "font-display text-2xl italic md:text-3xl" : "text-lg font-medium md:text-xl"
            }`}
          >
            <Fill text={L(clinic.tagline)} />
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            <Fill text={L(clinic.intro)} />
          </p>
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
          {rating && (
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <StarIcon size={16} className="text-amber-500" fill="currentColor" />
              <span className="whitespace-nowrap">
                <span className="font-semibold text-ink">{rating.value}</span>
                {rating.kind === "recommend" ? ` ${t.reviews.recommend}` : ""}
              </span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{rating.platform}</span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{t.reviews.ratingsCount(rating.count)}</span>
            </p>
          )}
        </div>
        <PlaceholderImage label={t.placeholderImage} className="aspect-[4/3] w-full" art={ctx.niche.theme.heroArt} />
      </div>
    </section>
  );
}

// ─── Emergency (vet) ───────────────────────────────────────────────────────────────────────

function Emergency(ctx: SiteContext) {
  const { clinic, t, L } = ctx;
  const phones = emergencyPhones(clinic);
  return (
    <section id="emergency" className="pb-4">
      <div className="mx-auto max-w-6xl px-4">
      <div className="flex flex-col gap-5 rounded-3xl bg-rose-700 p-5 text-white shadow-lg shadow-rose-900/20 md:flex-row md:items-center md:justify-between md:p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15" aria-hidden="true">
            <SirenIcon size={26} />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold md:text-2xl">{t.emergency.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-white/90">{t.emergency.text}</p>
            {clinic.emergency?.note && (
              <p className="mt-2 text-xs text-white/85">
                <Fill text={L(clinic.emergency.note)} />
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {phones.map((p) =>
            p.tel ? (
              <a
                key={p.display}
                href={`tel:${p.tel}`}
                className="btn bg-white px-5 py-3 text-base text-rose-800 hover:bg-rose-50"
                aria-label={`${t.emergency.call}: ${p.display}`}
              >
                <PhoneIcon size={18} />
                {p.display}
              </a>
            ) : (
              <span key={p.display} className="btn bg-white/90 px-5 py-3 text-rose-800">
                <Fill text={p.display} />
              </span>
            ),
          )}
        </div>
      </div>
      </div>
    </section>
  );
}

// ─── Services ──────────────────────────────────────────────────────────────────────────────

function ServiceCard({ ctx, s }: { ctx: SiteContext; s: Clinic["services"][number] }) {
  const { L, t } = ctx;
  return (
    <li className="card flex flex-col justify-between gap-3 p-4 md:p-5">
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
  );
}

function Services(ctx: SiteContext, tone: Tone) {
  const { clinic, niche, t, L } = ctx;
  const groups = niche.services.categories
    .map((c) => ({ category: c, services: clinic.services.filter((s) => s.category === c.id) }))
    .filter((g) => g.services.length > 0);
  const heading = <Heading eyebrow={t.nav.services} title={t.services.title} sub={t.services.subtitle} />;

  if (groups.length === 0) {
    return (
      <Section id="services" tone={tone}>
        {heading}
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clinic.services.map((s) => (
            <ServiceCard key={s.id} ctx={ctx} s={s} />
          ))}
        </ul>
      </Section>
    );
  }

  // One panel per category, prices aligned on the right: a treatment menu (luxe) or a friendly price list (warm).
  const luxe = niche.theme.preset === "luxe";
  return (
    <Section id="services" tone={tone}>
      {heading}
      <div className={`mt-10 grid gap-5 md:grid-cols-2 ${luxe ? "" : "lg:grid-cols-3"}`}>
        {groups.map(({ category, services }) => {
          const Icon = ICONS[category.icon ?? "sparkle"];
          return (
            <div key={category.id} className={`card ${luxe ? "p-6 md:p-8" : "p-5 md:p-6"}`}>
              <h3
                className={`flex items-center gap-3 font-display ${luxe ? "text-2xl font-medium md:text-3xl" : "text-lg font-bold"}`}
              >
                <span className={`grid h-10 w-10 place-items-center bg-brand/10 text-brand ${luxe ? "rounded-full" : "rounded-xl"}`}>
                  <Icon size={20} />
                </span>
                {L(category.label)}
              </h3>
              <ul className="mt-4 divide-y divide-line">
                {services.map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-4 py-3.5">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {L(s.name)}
                        <ConfirmBadge status={s.status} />
                      </p>
                      {s.description && <p className="mt-0.5 text-sm text-muted">{L(s.description)}</p>}
                      <div className="mt-1.5">
                        <ServiceBookLink serviceId={s.id} label={t.services.book} />
                      </div>
                    </div>
                    <span className="shrink-0 text-right text-sm font-semibold">
                      <Fill text={L(s.price)} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Packages / courses (aesthetic) ───────────────────────────────────────────────────────

function Packages(ctx: SiteContext, tone: Tone) {
  const { clinic, t, L } = ctx;
  return (
    <Section id="packages" tone={tone}>
      <Heading eyebrow={t.nav.packages} title={t.packages.title} sub={t.packages.subtitle} />
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {clinic.packages!.map((p) => (
          <li key={p.id} className="card flex flex-col p-6">
            {p.sessions && (
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand uppercase">{t.packages.sessions(p.sessions)}</p>
            )}
            <h3 className="mt-2 font-display text-2xl font-medium">
              <Fill text={L(p.name)} />
              <ConfirmBadge status={p.status} />
            </h3>
            {p.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <Fill text={L(p.description)} />
              </p>
            )}
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
              <span className="text-sm font-semibold">
                <Fill text={L(p.price)} />
              </span>
              {p.serviceId ? (
                <ServiceBookLink serviceId={p.serviceId} label={t.packages.book} />
              ) : (
                <a href="#booking" className="text-sm font-semibold text-brand hover:underline">
                  {t.packages.book} →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ─── Audience (vet: pet types) ─────────────────────────────────────────────────────────────

function Audience(ctx: SiteContext, tone: Tone) {
  const { clinic, niche, t, L } = ctx;
  const unconfirmed = ["placeholder", "conflict", "outdated"].includes(ctx.status("audience") ?? "");
  const options = niche.audience!.options.filter((o) => clinic.audience!.includes(o.id));
  return (
    <Section id="audience" tone={tone}>
      <Heading eyebrow={t.nav.audience} title={t.audience.title} badge={ctx.status("audience")} />
      <ul className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-6">
        {options.map((o) => {
          const Icon = ICONS[o.icon];
          return (
            <li
              key={o.id}
              className={`card flex flex-col items-center gap-2 p-4 text-center ${unconfirmed ? "outline-1 outline-amber-300 outline-dashed" : ""}`}
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand">
                <Icon size={24} />
              </span>
              <span className="text-sm font-semibold">{L(o.label)}</span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// ─── Doctors / specialists ─────────────────────────────────────────────────────────────────

function Doctors(ctx: SiteContext, tone: Tone) {
  const { clinic, t, L } = ctx;
  return (
    <Section id="doctors" tone={tone}>
      <Heading eyebrow={t.doctors.subtitle} title={t.doctors.title} badge={ctx.status("doctors")} />
      <ul className="mt-8 grid grid-cols-3 gap-2.5 md:gap-4">
        {clinic.doctors.map((d, i) => (
          <li key={i} className="card p-2 md:p-3">
            <AvatarPlaceholder label={t.photoPlaceholder} />
            <div className="px-0.5 pt-2.5 pb-1 md:px-1 md:pt-3">
              <p className="text-sm font-semibold md:text-base">
                <Fill text={d.name} />
              </p>
              <p className="text-xs text-muted md:text-sm">{L(d.role)}</p>
              {d.specialties && (
                <p className="mt-1 text-[11px] text-muted md:text-xs">
                  <Fill text={L(d.specialties)} />
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ─── Before / after gallery (placeholders only) ────────────────────────────────────────────

function Gallery(ctx: SiteContext, tone: Tone) {
  const { clinic, t } = ctx;
  const count = clinic.gallery?.count ?? 3;
  return (
    <Section id="gallery" tone={tone}>
      <Heading eyebrow={t.nav.gallery} title={t.gallery.title} sub={t.gallery.subtitle} />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <BeforeAfterPlaceholder before={t.gallery.before} after={t.gallery.after} label={t.photoPlaceholder} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">{t.gallery.note}</p>
    </Section>
  );
}

// ─── Why us ───────────────────────────────────────────────────────────────────────────────

function Why(ctx: SiteContext, tone: Tone) {
  const { clinic, t, L } = ctx;
  return (
    <Section id="why" tone={tone}>
      <Heading eyebrow={t.nav.why} title={t.why.title} />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clinic.whyUs.map((w, i) => {
          const Icon = ICONS[w.icon];
          return (
            <li key={i} className={`rounded-2xl ${inset(tone)} p-5 ring-1 ring-line/70`}>
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
    </Section>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────────────────

/** Live from Google when configured, then hand-copied ones, otherwise labelled samples (never attributed to real people). */
function Reviews(ctx: SiteContext, tone: Tone) {
  const { t, rating, reviews } = ctx;
  return (
    <Section id="reviews" tone={tone}>
      <Heading eyebrow={t.nav.reviews} title={t.reviews.title} />
      {rating && (
        <div className={`mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl ${inset(tone)} px-4 py-3 ring-1 ring-line`}>
          <StarIcon size={20} className="text-amber-500" fill="currentColor" />
          <span className="text-2xl font-semibold">{rating.value}</span>
          <span className="text-sm text-muted">
            {rating.kind === "recommend" ? `${t.reviews.recommend} · ` : ""}
            {t.reviews.ratingOn(rating.platform)} · {t.reviews.ratingsCount(rating.count)}
          </span>
          <a
            href={rating.source}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            {t.reviews.source} <ExternalIcon size={12} />
          </a>
        </div>
      )}
      {reviews ? (
        <GoogleReviews data={reviews} t={t.reviews} cardClass={inset(tone)} />
      ) : (
        <>
          <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 outline-1 outline-amber-300 outline-dashed">
            {t.reviews.sampleLabel}
          </p>
          <ul className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
            {[1, 2, 3].map((n) => (
              <li key={n} className={`w-[82%] shrink-0 snap-start rounded-2xl ${inset(tone)} p-5 ring-1 ring-line/70 md:w-auto`}>
                <QuoteIcon size={22} className="text-brand/50" />
                <p className="mt-3 text-sm leading-relaxed text-muted italic">{t.reviews.sampleText}</p>
                <p className="mt-4 text-sm font-semibold">
                  {t.reviews.sampleAuthor} #{n}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────────────────

function Faq(ctx: SiteContext, tone: Tone) {
  const { clinic, niche, t, L } = ctx;
  const items = clinic.faq ?? niche.faq;
  return (
    <Section id="faq" tone={tone}>
      <Heading eyebrow={t.nav.faq} title={t.faq.title} />
      <div className="card mt-8 divide-y divide-line">
        {items.map((f, i) => (
          <details key={i} className="group p-5" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              <span>{L(f.q)}</span>
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{L(f.a)}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

// ─── Booking ──────────────────────────────────────────────────────────────────────────────

function Booking(ctx: SiteContext, tone: Tone) {
  const { clinic, t, L, locale } = ctx;
  const formText: BookingFormText = { ...t.booking, consent: t.booking.consent(clinic.name) };
  return (
    <Section id="booking" tone={tone}>
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
            fields={bookingFormFields(ctx)}
            services={clinic.services.map((s) => ({ id: s.id, name: L(s.name) }))}
            slotsByWeekday={slotsByWeekday(clinic)}
            text={formText}
            timeZone={clinic.timeZone}
            phonePlaceholder={COUNTRIES[clinic.country].phonePlaceholder}
          />
        </div>
      </div>
    </Section>
  );
}

// ─── Location & hours ─────────────────────────────────────────────────────────────────────

function Location(ctx: SiteContext, tone: Tone) {
  const { clinic, t, L } = ctx;
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
  return (
    <Section id="location" tone={tone} inner="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
      <div>
        <Heading eyebrow={t.nav.location} title={t.location.title} />
        <p className="mt-3 flex items-start gap-2 text-muted">
          <MapPinIcon size={18} className="mt-0.5 shrink-0 text-brand" />
          <span>
            <Fill text={L(clinic.address)} />
            <ConfirmBadge status={ctx.status("address")} />
          </span>
        </p>
        <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-line">
          <iframe
            title={`${clinic.name} — Google Maps`}
            src={ctx.mapEmbed}
            className="aspect-[4/3] w-full md:aspect-[16/10]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={ctx.directions} target="_blank" rel="noopener noreferrer" className="btn-primary">
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
        <Heading eyebrow={t.nav.hours} title={t.hours.title} badge={ctx.status("hours")} />
        <HoursTable rows={hoursRows} todayLabel={t.hours.today} timeZone={clinic.timeZone} />
        {clinic.open24h && clinic.bookingSlots && (
          <p className="mt-3 text-xs text-muted">{t.hours.nightNote(clinic.bookingSlots.start, clinic.bookingSlots.end)}</p>
        )}
      </div>
    </Section>
  );
}

/** The section library. Every niche picks and orders from these ids. */
export const SECTIONS: Record<SectionId, (ctx: SiteContext, tone: Tone) => ReactNode> = {
  hero: Hero,
  emergency: Emergency,
  services: Services,
  packages: Packages,
  audience: Audience,
  doctors: Doctors,
  gallery: Gallery,
  why: Why,
  reviews: Reviews,
  faq: Faq,
  booking: Booking,
  location: Location,
};

/** Hero and emergency carry their own backgrounds; the rest alternate canvas / surface. */
export const SELF_STYLED: SectionId[] = ["hero", "emergency"];
