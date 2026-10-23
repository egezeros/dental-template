import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ICONS, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { sessionCookieName, verifySessionToken } from "@/lib/auth";
import { detailLines } from "@/lib/booking/fields";
import type { Booking, BookingStatus } from "@/lib/booking/types";
import { getClinic } from "@/lib/clinics/load";
import type { Clinic } from "@/lib/clinics/schema";
import { adminPassword, isDemoMode, usingDefaultDemoPassword } from "@/lib/config";
import { computeFollowUps, countDueBack, followUpText, type FollowUp, type FollowUpState } from "@/lib/followups";
import { INTL_LOCALE, isLocale, LOCALE_LABELS, siteDict, tr, type Locale } from "@/lib/i18n";
import { WaLinkProvider } from "@/lib/messaging";
import { waMeLink } from "@/lib/messaging/templates";
import { nicheAdminDict } from "@/lib/niches/copy";
import { getNiche } from "@/lib/niches/load";
import type { Niche } from "@/lib/niches/schema";
import { selectNextDayAppointments, tomorrowIn } from "@/lib/reminders";
import { computeStats } from "@/lib/stats";
import { ensureDemoData, getStore } from "@/lib/storage";
import { formatDate, zonedDate } from "@/lib/time";
import { login, logout, markFollowUpSent, runFollowUpsNow, runRemindersNow, setBookingStatus } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; tab?: string; error?: string }>;
};

const FOLLOW_UP_STYLE: Record<FollowUpState, string> = {
  overdue: "bg-rose-50 text-rose-800 ring-rose-200",
  due: "bg-amber-50 text-amber-900 ring-amber-200",
  upcoming: "bg-sky-50 text-sky-800 ring-sky-200",
};

const STATUS_STYLE: Record<BookingStatus, string> = {
  new: "bg-sky-50 text-sky-800 ring-sky-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  no_show: "bg-rose-50 text-rose-800 ring-rose-200",
};

export default async function AdminPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const clinic = getClinic(slug);
  if (!clinic) notFound();

  const defaultLocale = clinic.locales[0];
  const locale: Locale = isLocale(sp.lang) && clinic.locales.includes(sp.lang) ? sp.lang : defaultLocale;
  const niche = getNiche(clinic.niche);
  const t = nicheAdminDict(niche, locale);
  const Icon = ICONS[niche.theme.icon];
  const demo = isDemoMode();
  const langQuery = (l: Locale, extra: Record<string, string> = {}) => {
    const q = new URLSearchParams({ ...(l !== defaultLocale ? { lang: l } : {}), ...extra }).toString();
    return `/${slug}/admin${q ? `?${q}` : ""}`;
  };
  const style = { "--brand": clinic.brandColor } as CSSProperties;
  const theme = niche.theme.preset;

  if (!adminPassword(slug)) {
    return (
      <Shell style={style} theme={theme}>
        <p className="card mx-auto mt-24 max-w-md p-6 text-center text-sm text-muted">{t.disabled}</p>
      </Shell>
    );
  }

  const jar = await cookies();
  const authed = verifySessionToken(slug, jar.get(sessionCookieName(slug))?.value);

  if (!authed) {
    return (
      <Shell style={style} theme={theme}>
        <form action={login.bind(null, slug)} className="card mx-auto mt-20 grid max-w-sm gap-4 p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <Icon size={20} />
            </span>
            <div>
              <p className="font-semibold">{clinic.name}</p>
              <p className="text-xs text-muted">{t.title}</p>
            </div>
          </div>
          <input type="hidden" name="lang" value={locale} />
          <label className="grid gap-1.5">
            <span className="field-label mb-0">{t.password}</span>
            <input name="password" type="password" autoComplete="current-password" className="field" required autoFocus />
          </label>
          {sp.error && <p className="field-error mt-0">{t.wrongPassword}</p>}
          <button className="btn-primary w-full">{t.login}</button>
          {usingDefaultDemoPassword(slug) && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-900 ring-1 ring-amber-200">
              {t.demoHint(adminPassword(slug)!)}
            </p>
          )}
        </form>
      </Shell>
    );
  }

  const store = await getStore();
  const now = new Date();
  const today = zonedDate(now, clinic.timeZone);
  let all: Booking[];
  try {
    await ensureDemoData(store, clinic, now);
    all = await store.list(slug);
  } catch (err) {
    console.error("[admin] storage error:", err);
    return (
      <Shell style={style} theme={theme}>
        <div className="card mx-auto mt-20 max-w-lg space-y-2 p-6 text-sm">
          <p className="font-semibold text-rose-700">{t.storageError}</p>
          <p className="font-mono text-xs break-words text-muted">{(err as Error).message}</p>
        </div>
      </Shell>
    );
  }
  // On Vercel each route runs in its own serverless instance, so in-memory bookings made on
  // the public site are invisible here. Say so instead of looking broken.
  const memoryOnServerless = store.driver === "memory" && Boolean(process.env.VERCEL);
  const stats = computeStats(all, now, clinic.timeZone);
  const tab = sp.tab === "past" || sp.tab === "all" ? sp.tab : "upcoming";
  const rows =
    tab === "all"
      ? all
      : tab === "past"
        ? all.filter((b) => b.date < today).reverse()
        : all.filter((b) => b.date >= today);

  const tomorrow = tomorrowIn(now, clinic.timeZone);
  const wa = new WaLinkProvider();
  const tomorrowRows = await Promise.all(
    selectNextDayAppointments(all, now, { includeAlreadyReminded: true, timeZone: clinic.timeZone }).map(async (b) => ({
      booking: b,
      reminder: await wa.sendReminder(b, clinic),
    })),
  );
  const fmt = (d: string) => formatDate(d, INTL_LOCALE[locale]);
  const followUps = computeFollowUps(clinic, all, now, { niche });
  const specialistLabel = siteDict(locale).booking.specialist;
  const details = (b: Booking) =>
    detailLines(b, niche, locale, { specialist: specialistLabel })
      .map((d) => d.value)
      .join(" · ");

  return (
    <Shell style={style} theme={theme}>
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-white">
              <Icon size={18} />
            </span>
            <p className="truncate text-sm font-semibold">
              {clinic.name} <span className="font-normal text-muted">· {t.title}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {clinic.locales.map((l) => (
              <Link
                key={l}
                href={langQuery(l, tab !== "upcoming" ? { tab } : {})}
                className={`rounded-full px-2 py-1 font-semibold ${l === locale ? "bg-brand/10 text-brand" : "text-muted"}`}
              >
                {LOCALE_LABELS[l]}
              </Link>
            ))}
            <Link href={`/${slug}`} className="hidden font-medium text-muted hover:text-brand sm:inline">
              {t.viewSite}
            </Link>
            <form action={logout.bind(null, slug)}>
              <button className="font-medium text-muted hover:text-rose-600">{t.logout}</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {memoryOnServerless && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
            {t.memoryWarning}
          </p>
        )}
        {demo && (
          <p className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
            {t.demoData}
          </p>
        )}

        <section className={`grid grid-cols-2 gap-3 ${niche.reminders.followUps.length ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
          <Stat label={t.stats.week} value={String(stats.bookingsThisWeek)} />
          <Stat label={t.stats.upcoming} value={String(stats.upcoming)} />
          <Stat label={t.stats.pending} value={String(stats.awaitingConfirmation)} />
          <Stat
            label={t.stats.noShowRate}
            value={stats.noShowRate === null ? "—" : `${Math.round(stats.noShowRate * 100)}%`}
          />
          {niche.reminders.followUps.length > 0 && (
            <a href="#follow-ups" className="col-span-2 md:col-span-1">
              <Stat label={t.stats.dueBack} value={String(countDueBack(followUps))} highlight />
            </a>
          )}
        </section>

        <section className="card p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">
                {t.reminders.title} · <span className="text-muted">{fmt(tomorrow)}</span>
              </h2>
              <p className="text-xs text-muted">{t.reminders.subtitle}</p>
            </div>
            <form action={runRemindersNow.bind(null, slug)}>
              <button className="btn-secondary px-4 py-2 text-xs">{t.reminders.run}</button>
            </form>
          </div>
          {tomorrowRows.length === 0 ? (
            <p className="mt-4 text-sm text-muted">{t.reminders.none}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {tomorrowRows.map(({ booking: b, reminder }) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {b.time} · {b.name}
                      {b.details?.petName ? ` · ${b.details.petName}` : ""}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {b.serviceName} · {b.phone} · {b.locale.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.reminderSentAt && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        {t.reminders.sent}
                      </span>
                    )}
                    <a
                      href={reminder.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn inline-flex bg-[#25D366] px-3 py-2 text-xs text-white"
                    >
                      <WhatsAppIcon size={16} />
                      {t.reminders.send}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {niche.reminders.followUps.length > 0 && (
          <FollowUpsPanel slug={slug} clinic={clinic} niche={niche} items={followUps} t={t} locale={locale} fmt={fmt} />
        )}

        <section className="card overflow-hidden">
          <div className="flex gap-1 border-b border-line p-2">
            {(["upcoming", "past", "all"] as const).map((k) => (
              <Link
                key={k}
                href={langQuery(locale, k === "upcoming" ? {} : { tab: k })}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === k ? "bg-brand/10 text-brand" : "text-muted hover:text-ink"}`}
              >
                {t.tabs[k]}
              </Link>
            ))}
          </div>
          {rows.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">{t.empty}</p>
          ) : (
            <ul className="divide-y divide-line">
              {rows.map((b) => (
                <BookingRow key={b.id} b={b} slug={slug} t={t} when={`${fmt(b.date)}, ${b.time}`} details={details(b)} />
              ))}
            </ul>
          )}
        </section>

      </main>
    </Shell>
  );
}

function Shell({ children, style, theme }: { children: React.ReactNode; style: CSSProperties; theme: Niche["theme"]["preset"] }) {
  return (
    <div style={style} data-theme={theme} className="min-h-screen bg-canvas pb-10">
      {children}
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card p-4 ${highlight ? "ring-2 ring-brand/40" : ""}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${highlight ? "text-brand" : ""}`}>{value}</p>
    </div>
  );
}

type AdminText = ReturnType<typeof nicheAdminDict>;

/** Patients (or pets) due back under the niche's follow-up rules, with one-tap WhatsApp messages. */
function FollowUpsPanel({
  slug,
  clinic,
  niche,
  items,
  t,
  locale,
  fmt,
}: {
  slug: string;
  clinic: Clinic;
  niche: Niche;
  items: FollowUp[];
  t: AdminText;
  locale: Locale;
  fmt: (d: string) => string;
}) {
  return (
    <section id="follow-ups" className="card scroll-mt-20 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t.followUps.title}</h2>
          <p className="text-xs text-muted">{t.followUps.subtitle}</p>
          <p className="mt-1 text-[11px] text-muted">
            {niche.reminders.followUps.map((r) => tr(r.label, locale)).join(" · ")}
          </p>
        </div>
        <form action={runFollowUpsNow.bind(null, slug)}>
          <button className="btn-secondary px-4 py-2 text-xs">{t.followUps.run}</button>
        </form>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{t.followUps.none}</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {items.map((f) => {
            // Message in the patient's language, plus one other language of the business (AZ↔RU, TR↔EN).
            const others = clinic.locales.filter((l) => l !== f.locale);
            const other: Locale = others.find((l) => l !== "en") ?? others[0] ?? f.locale;
            const link = waMeLink(f.phone, followUpText(f, clinic));
            const otherLink = waMeLink(f.phone, followUpText(f, clinic, other));
            return (
              <li key={f.key} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {f.name}
                    {f.petName && <span className="font-normal text-muted">· {f.petName}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${FOLLOW_UP_STYLE[f.state]}`}>
                      {t.followUps[f.state]}
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    {tr(f.rule.label, locale)}
                    {f.session ? ` · ${t.followUps.session(f.session, f.sessions!)}` : ""} · {f.visit.serviceName}
                  </p>
                  <p className="text-xs text-muted">
                    {t.followUps.lastVisit(fmt(f.lastVisitDate))} · <b className="text-ink">{t.followUps.dueOn(fmt(f.dueDate))}</b> ·{" "}
                    {f.phone} · {f.locale.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {f.sentAt ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      {t.followUps.sent}
                    </span>
                  ) : (
                    f.state !== "upcoming" && (
                      <form action={markFollowUpSent.bind(null, slug, f.visit.id, f.rule.id)}>
                        <button className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted ring-1 ring-line hover:text-ink">
                          ✓ {t.followUps.markSent}
                        </button>
                      </form>
                    )
                  )}
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn inline-flex bg-[#25D366] px-3 py-2 text-xs text-white"
                  >
                    <WhatsAppIcon size={16} />
                    {t.followUps.send} {f.locale.toUpperCase()}
                  </a>
                  <a
                    href={otherLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#128C7E] ring-1 ring-[#25D366]/40 hover:bg-[#25D366]/10"
                  >
                    {other.toUpperCase()}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function BookingRow({
  b,
  slug,
  t,
  when,
  details,
}: {
  b: Booking;
  slug: string;
  t: AdminText;
  when: string;
  details: string;
}) {
  const action = (status: BookingStatus) => setBookingStatus.bind(null, slug, b.id, status);
  const buttons: { status: BookingStatus; label: string; cls: string }[] = [];
  if (b.status !== "confirmed") buttons.push({ status: "confirmed", label: t.actions.confirm, cls: "text-emerald-700 ring-emerald-200 hover:bg-emerald-50" });
  if (b.status !== "cancelled") buttons.push({ status: "cancelled", label: t.actions.cancel, cls: "text-slate-600 ring-slate-200 hover:bg-slate-50" });
  if (b.status !== "no_show") buttons.push({ status: "no_show", label: t.actions.noShow, cls: "text-rose-700 ring-rose-200 hover:bg-rose-50" });
  if (b.status !== "new") buttons.push({ status: "new", label: t.actions.reset, cls: "text-sky-700 ring-sky-200 hover:bg-sky-50" });

  return (
    <li className="grid gap-3 p-4 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {b.name}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${STATUS_STYLE[b.status]}`}>
            {t.status[b.status]}
          </span>
        </p>
        <a href={`tel:${b.phone}`} className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted hover:text-brand">
          <PhoneIcon size={12} />
          {b.phone}
        </a>
        {details && <p className="mt-0.5 text-xs text-muted">{details}</p>}
      </div>
      <div className="text-sm">
        <p className="font-medium">{when}</p>
        <p className="text-xs text-muted">{b.serviceName}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {buttons.map((btn) => (
          <form key={btn.status} action={action(btn.status)}>
            <button className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ${btn.cls}`}>{btn.label}</button>
          </form>
        ))}
      </div>
    </li>
  );
}
