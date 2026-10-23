import type { Booking } from "./booking/types";
import type { Clinic, ClinicService } from "./clinics/schema";
import { INTL_LOCALE, tr, type Locale } from "./i18n";
import type { MessagingProvider, PreparedReminder } from "./messaging";
import { fillTemplate, firstNameOf, petNameOf } from "./messaging/templates";
import { getNiche } from "./niches/load";
import type { FollowUpRule, Niche } from "./niches/schema";
import { followUpDigestMessages } from "./notify/messages";
import type { OutboxEntry } from "./notify/telegram";
import { REMINDABLE_STATUSES } from "./reminders";
import type { BookingStore } from "./storage/types";
import { addDays, daysBetween, formatDate, zonedDate } from "./time";

/** How far ahead the dashboard lists follow-ups that are not due yet. */
export const FOLLOW_UP_HORIZON_DAYS = 30;
/** A course restarts after a gap this many times longer than its interval. */
const COURSE_BREAK_FACTOR = 3;

export type FollowUpState = "upcoming" | "due" | "overdue";

/**
 * One patient (or pet) who is due back under a niche follow-up rule, computed from booking
 * history. Nothing is stored except, once sent, a timestamp on the visit it was computed from.
 */
export interface FollowUp {
  /** Unique per rule and visit. */
  key: string;
  rule: FollowUpRule;
  /** The last matching visit; "sent" is recorded on it under the rule id. */
  visit: Booking;
  name: string;
  phone: string;
  locale: Locale;
  petName?: string;
  serviceId: string;
  lastVisitDate: string;
  dueDate: string;
  /** Staff are prompted from this date (dueDate − leadDays). */
  notifyFrom: string;
  state: FollowUpState;
  /** Course rules: the session this reminder is for, out of the course total. */
  session?: number;
  sessions?: number;
  sentAt: string | null;
}

/** A visit that happened: confirmed by staff and not in the future. No-shows don't count. */
export function isAttended(b: Booking, today: string): boolean {
  return b.status === "confirmed" && b.date <= today;
}

/**
 * Who a rule tracks. Per patient = phone number; per pet = phone + pet name, so an owner with
 * two pets gets two reminders. Demo rows may all share one phone (DEMO_WHATSAPP_NUMBER), so
 * their fictional names keep them apart.
 */
function subjectKey(b: Booking, per: FollowUpRule["per"]): string {
  const person = b.source === "demo" ? `${b.phone}|${b.name}` : b.phone;
  return per === "pet" ? `${person}|${(b.details?.petName ?? "").trim().toLowerCase()}` : person;
}

function matches(rule: FollowUpRule, b: Booking, services: Map<string, ClinicService>): boolean {
  const { services: ids, categories } = rule.match;
  if (ids?.length && !ids.includes(b.serviceId)) return false;
  if (categories?.length) {
    const category = services.get(b.serviceId)?.category;
    if (!category || !categories.includes(category)) return false;
  }
  return true;
}

const byWhen = (a: Booking, b: Booking) => (a.date + a.time).localeCompare(b.date + b.time);

/** Sessions done in the current run of a course, given that subject's visits in date order. */
function sessionsInCurrentCourse(visits: Booking[], course: { sessions: number; intervalDays: number }): number {
  let count = 0;
  let previous: string | undefined;
  for (const v of visits) {
    const gap = previous ? daysBetween(previous, v.date) : 0;
    if (count >= course.sessions || gap > course.intervalDays * COURSE_BREAK_FACTOR) count = 0;
    count++;
    previous = v.date;
  }
  return count;
}

interface Candidate {
  rule: FollowUpRule;
  visit: Booking;
  dueDate: string;
  /** Bookings that would answer this follow-up (same subject, matching, after the visit). */
  answeredBy: (b: Booking) => boolean;
  session?: number;
  sessions?: number;
}

function candidates(rule: FollowUpRule, clinic: Clinic, bookings: Booking[], today: string): Candidate[] {
  const services = new Map(clinic.services.map((s) => [s.id, s]));
  const attended = bookings.filter((b) => isAttended(b, today) && matches(rule, b, services)).sort(byWhen);
  const groups = new Map<string, Booking[]>();
  const group = (key: string, b: Booking) => groups.set(key, [...(groups.get(key) ?? []), b]);
  const out: Candidate[] = [];

  if (rule.type === "interval") {
    for (const b of attended) group(subjectKey(b, rule.per), b);
    for (const [subject, visits] of groups) {
      const visit = visits[visits.length - 1];
      out.push({
        rule,
        visit,
        dueDate: addDays(visit.date, rule.afterDays),
        answeredBy: (b) => subjectKey(b, rule.per) === subject && matches(rule, b, services),
      });
    }
    return out;
  }

  // Course rule: tracked per subject and service, for services that define a course.
  for (const b of attended) if (services.get(b.serviceId)?.course) group(`${subjectKey(b, rule.per)}#${b.serviceId}`, b);
  for (const [key, visits] of groups) {
    const visit = visits[visits.length - 1];
    const course = services.get(visit.serviceId)!.course!;
    const done = sessionsInCurrentCourse(visits, course);
    if (done >= course.sessions) continue; // course complete
    out.push({
      rule,
      visit,
      dueDate: addDays(visit.date, course.intervalDays),
      answeredBy: (b) => `${subjectKey(b, rule.per)}#${b.serviceId}` === key,
      session: done + 1,
      sessions: course.sessions,
    });
  }
  return out;
}

/**
 * The rule engine: for each of the niche's follow-up rules, find each patient's (or pet's)
 * last attended matching visit, work out when they are due back, and list them unless they
 * already have a new appointment. Returns overdue, due and upcoming items, soonest first.
 */
export function computeFollowUps(
  clinic: Clinic,
  bookings: Booking[],
  now: Date = new Date(),
  options: { niche?: Niche; horizonDays?: number } = {},
): FollowUp[] {
  const niche = options.niche ?? getNiche(clinic.niche);
  const horizon = options.horizonDays ?? FOLLOW_UP_HORIZON_DAYS;
  const today = zonedDate(now, clinic.timeZone);
  const out: FollowUp[] = [];
  for (const rule of niche.reminders.followUps) {
    for (const c of candidates(rule, clinic, bookings, today)) {
      const booked = bookings.some(
        (b) =>
          b.id !== c.visit.id &&
          b.date > c.visit.date &&
          b.date >= today &&
          REMINDABLE_STATUSES.includes(b.status) &&
          c.answeredBy(b),
      );
      if (booked) continue;
      const notifyFrom = addDays(c.dueDate, -rule.leadDays);
      const overdueBy = daysBetween(c.dueDate, today);
      if (overdueBy > rule.stopAfterDays) continue; // gave up on this one
      const state: FollowUpState = overdueBy > 0 ? "overdue" : today >= notifyFrom ? "due" : "upcoming";
      if (state === "upcoming" && daysBetween(today, c.dueDate) > horizon) continue;
      out.push({
        key: `${rule.id}:${c.visit.id}`,
        rule,
        visit: c.visit,
        name: c.visit.name,
        phone: c.visit.phone,
        locale: c.visit.locale,
        ...(c.visit.details?.petName ? { petName: c.visit.details.petName } : {}),
        serviceId: c.visit.serviceId,
        lastVisitDate: c.visit.date,
        dueDate: c.dueDate,
        notifyFrom,
        state,
        ...(c.session ? { session: c.session, sessions: c.sessions } : {}),
        sentAt: c.visit.followUps?.[rule.id] ?? null,
      });
    }
  }
  return out.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.name.localeCompare(b.name));
}

/** Follow-ups whose reminder should go out now. */
export function isActionable(f: FollowUp): boolean {
  return f.state !== "upcoming";
}

/** "Patients due back" stat: distinct people (or pets) whose follow-up is due or overdue. */
export function countDueBack(items: FollowUp[]): number {
  return new Set(items.filter(isActionable).map((f) => `${f.phone}|${f.name}|${f.petName ?? ""}`)).size;
}

/** Patient message for a follow-up, in the patient's language unless another is asked for. */
export function followUpText(f: FollowUp, clinic: Clinic, locale: Locale = f.locale): string {
  const service = clinic.services.find((s) => s.id === f.serviceId);
  return fillTemplate(tr(f.rule.message, locale), {
    firstName: firstNameOf(f.name),
    clinic: clinic.name,
    service: service ? tr(service.name, locale) : f.visit.serviceName,
    petName: petNameOf(f.visit.details, locale),
    dueDate: formatDate(f.dueDate, INTL_LOCALE[locale]),
    session: f.session,
    sessions: f.sessions,
    phone: clinic.phones[0]?.display ?? "",
  });
}

/** How far back the engine needs booking history for this business. */
export function followUpLookbackDays(clinic: Clinic, niche: Niche = getNiche(clinic.niche)): number {
  let days = 0;
  for (const rule of niche.reminders.followUps) {
    if (rule.type === "interval") days = Math.max(days, rule.afterDays + rule.stopAfterDays);
    else
      for (const s of clinic.services)
        if (s.course) days = Math.max(days, s.course.sessions * s.course.intervalDays * COURSE_BREAK_FACTOR + rule.stopAfterDays);
  }
  return Math.min(days + 1, 3 * 366);
}

export interface FollowUpRunResult {
  clinicSlug: string;
  sent: { followUp: FollowUp; message: PreparedReminder }[];
  notifications: OutboxEntry["status"][];
}

export interface FollowUpDeps {
  store: BookingStore;
  messaging: MessagingProvider;
  notify: (clinicSlug: string, kind: OutboxEntry["kind"], html: string) => Promise<OutboxEntry>;
  demo: boolean;
}

/**
 * The daily follow-up job: for each business, prepare a patient message (wa.me link, or a
 * WhatsApp API send) for every due follow-up not sent yet, send staff one Telegram digest,
 * and record them as sent so a re-run does not repeat them.
 */
export async function runFollowUps(clinics: Clinic[], now: Date, deps: FollowUpDeps): Promise<FollowUpRunResult[]> {
  const results: FollowUpRunResult[] = [];
  for (const clinic of clinics) {
    const niche = getNiche(clinic.niche);
    if (niche.reminders.followUps.length === 0) {
      results.push({ clinicSlug: clinic.slug, sent: [], notifications: [] });
      continue;
    }
    const fromDate = addDays(zonedDate(now, clinic.timeZone), -followUpLookbackDays(clinic, niche));
    const rows = await deps.store.list(clinic.slug, { fromDate });
    const due = computeFollowUps(clinic, rows, now, { niche }).filter((f) => isActionable(f) && !f.sentAt);
    if (due.length === 0) {
      results.push({ clinicSlug: clinic.slug, sent: [], notifications: [] });
      continue;
    }
    const messages = await Promise.all(due.map((f) => deps.messaging.sendFollowUp(f, clinic)));
    const sent = due.map((followUp, i) => ({ followUp, message: messages[i] }));
    const notifications: OutboxEntry["status"][] = [];
    for (const html of followUpDigestMessages(clinic, sent, deps.demo)) {
      notifications.push((await deps.notify(clinic.slug, "followup-digest", html)).status);
    }
    await deps.store.markFollowUpSent(
      clinic.slug,
      due.map((f) => ({ id: f.visit.id, key: f.rule.id })),
      now.toISOString(),
    );
    results.push({ clinicSlug: clinic.slug, sent, notifications });
  }
  return results;
}
