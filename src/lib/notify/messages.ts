import { detailLines } from "../booking/fields";
import type { Booking } from "../booking/types";
import type { Clinic } from "../clinics/schema";
import type { FollowUp } from "../followups";
import { isLocale, INTL_LOCALE, tr, type Locale } from "../i18n";
import type { PreparedReminder } from "../messaging";
import { envKey } from "../config";
import { getNiche } from "../niches/load";
import { formatDate } from "../time";
import { escapeHtml } from "./telegram";

/**
 * Language of a business's staff notifications (Telegram): STAFF_LOCALE_<SLUG>, else
 * STAFF_LOCALE when the business uses that language, else the business's default language.
 */
export function staffLocale(clinic: Pick<Clinic, "slug" | "locales">): Locale {
  const own = process.env[`STAFF_LOCALE_${envKey(clinic.slug)}`];
  if (isLocale(own)) return own;
  const global = process.env.STAFF_LOCALE;
  if (isLocale(global) && clinic.locales.includes(global)) return global;
  return clinic.locales[0];
}

const L = {
  az: {
    newBooking: "Yeni qəbul müraciəti",
    specialist: "Mütəxəssis",
    name: "Ad",
    phone: "Telefon",
    service: "Xidmət",
    when: "Arzu olunan vaxt",
    lang: "Dil",
    admin: "Admin paneli",
    demo: "DEMO — test müraciəti",
    tomorrow: "⏰ Sabahkı qəbullar",
    tapToRemind: "WhatsApp xatırlatmasını göndər",
    sentViaApi: "WhatsApp API ilə göndərildi",
    statusNew: "təsdiqlənməyib",
    statusConfirmed: "təsdiqlənib",
    followUps: "🔁 Təkrar qəbula dəvət vaxtıdır",
    tapToSend: "WhatsApp mesajını göndər",
    lastVisit: "son qəbul",
    due: "vaxtı",
    overdue: "gecikib",
    session: "seans",
  },
  ru: {
    newBooking: "Новая заявка на приём",
    specialist: "Специалист",
    name: "Имя",
    phone: "Телефон",
    service: "Услуга",
    when: "Желаемое время",
    lang: "Язык",
    admin: "Панель администратора",
    demo: "ДЕМО — тестовая заявка",
    tomorrow: "⏰ Записи на завтра",
    tapToRemind: "Отправить напоминание в WhatsApp",
    sentViaApi: "Отправлено через WhatsApp API",
    statusNew: "не подтверждена",
    statusConfirmed: "подтверждена",
    followUps: "🔁 Пора пригласить на повторный визит",
    tapToSend: "Отправить сообщение в WhatsApp",
    lastVisit: "последний визит",
    due: "срок",
    overdue: "просрочено",
    session: "сеанс",
  },
  en: {
    newBooking: "New appointment request",
    specialist: "Specialist",
    name: "Name",
    phone: "Phone",
    service: "Service",
    when: "Preferred time",
    lang: "Language",
    admin: "Admin dashboard",
    demo: "DEMO — test request",
    tomorrow: "⏰ Tomorrow's appointments",
    tapToRemind: "Send WhatsApp reminder",
    sentViaApi: "Sent via WhatsApp API",
    statusNew: "not confirmed",
    statusConfirmed: "confirmed",
    followUps: "🔁 Follow-ups due",
    tapToSend: "Send WhatsApp message",
    lastVisit: "last visit",
    due: "due",
    overdue: "overdue",
    session: "session",
  },
  tr: {
    newBooking: "Yeni randevu talebi",
    specialist: "Uzman",
    name: "Ad",
    phone: "Telefon",
    service: "Hizmet",
    when: "Tercih edilen zaman",
    lang: "Dil",
    admin: "Yönetim paneli",
    demo: "DEMO — test talebi",
    tomorrow: "⏰ Yarının randevuları",
    tapToRemind: "WhatsApp hatırlatması gönder",
    sentViaApi: "WhatsApp API ile gönderildi",
    statusNew: "onaylanmadı",
    statusConfirmed: "onaylandı",
    followUps: "🔁 Tekrar ziyaret zamanı gelenler",
    tapToSend: "WhatsApp mesajını gönder",
    lastVisit: "son ziyaret",
    due: "zamanı",
    overdue: "gecikti",
    session: "seans",
  },
} satisfies Record<Locale, Record<string, string>>;

const e = escapeHtml;

export function newBookingMessage(booking: Booking, clinic: Clinic, adminUrl: string, demo: boolean): string {
  const locale = staffLocale(clinic);
  const t = L[locale];
  const niche = getNiche(clinic.niche);
  const when = `${formatDate(booking.date, INTL_LOCALE[locale])}, ${booking.time}`;
  const details = detailLines(booking, niche, locale, { specialist: t.specialist });
  return [
    demo ? `<i>${t.demo}</i>` : null,
    `<b>${niche.theme.emoji} ${t.newBooking} — ${e(clinic.name)}</b>`,
    "",
    `👤 ${t.name}: <b>${e(booking.name)}</b>`,
    `📞 ${t.phone}: <a href="tel:${e(booking.phone)}">${e(booking.phone)}</a>`,
    ...details.map((d) => `• ${e(d.label)}: <b>${e(d.value)}</b>`),
    `🩺 ${t.service}: ${e(booking.serviceName)}`,
    `📅 ${t.when}: <b>${e(when)}</b>`,
    `🌐 ${t.lang}: ${booking.locale.toUpperCase()}`,
    "",
    `<a href="${e(adminUrl)}">${t.admin} →</a>`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

const TELEGRAM_LIMIT = 3800;

/** Staff digest of tomorrow's appointments, split into Telegram-sized messages. */
export function reminderDigestMessages(
  clinic: Clinic,
  date: string,
  items: { booking: Booking; reminder: PreparedReminder }[],
  demo: boolean,
): string[] {
  const locale = staffLocale(clinic);
  const t = L[locale];
  const header = [
    demo ? `<i>${t.demo}</i>` : null,
    `<b>${t.tomorrow} — ${e(clinic.name)}</b>`,
    e(formatDate(date, INTL_LOCALE[locale])),
  ]
    .filter((l) => l !== null)
    .join("\n");
  const blocks = items.map(({ booking, reminder }, i) => {
    const status = booking.status === "confirmed" ? t.statusConfirmed : t.statusNew;
    const action = reminder.delivered
      ? `✅ ${t.sentViaApi}`
      : `👉 <a href="${e(reminder.link)}">${t.tapToRemind}</a>`;
    const pet = booking.details?.petName ? ` · ${e(booking.details.petName)}` : "";
    return [
      `${i + 1}. <b>${booking.time}</b> — ${e(booking.name)}${pet} (${status})`,
      `   ${e(booking.serviceName)} · <a href="tel:${e(booking.phone)}">${e(booking.phone)}</a>`,
      `   ${action}`,
    ].join("\n");
  });
  return splitForTelegram(header, blocks);
}

function splitForTelegram(header: string, blocks: string[]): string[] {
  const messages: string[] = [];
  let current = header;
  for (const block of blocks) {
    if ((current + "\n\n" + block).length > TELEGRAM_LIMIT) {
      messages.push(current);
      current = header;
    }
    current += "\n\n" + block;
  }
  messages.push(current);
  return messages;
}

/** Staff digest of patients (or pets) due back under the niche's follow-up rules. */
export function followUpDigestMessages(
  clinic: Clinic,
  items: { followUp: FollowUp; message: PreparedReminder }[],
  demo: boolean,
): string[] {
  const locale = staffLocale(clinic);
  const t = L[locale];
  const fmt = (d: string) => formatDate(d, INTL_LOCALE[locale]);
  const header = [demo ? `<i>${t.demo}</i>` : null, `<b>${t.followUps} — ${e(clinic.name)}</b>`]
    .filter((l) => l !== null)
    .join("\n");
  const blocks = items.map(({ followUp: f, message }, i) => {
    const who = f.petName ? `${e(f.name)} · ${e(f.petName)}` : e(f.name);
    const session = f.session ? ` · ${t.session} ${f.session}/${f.sessions}` : "";
    const when = f.state === "overdue" ? `${t.overdue} (${t.due}: ${fmt(f.dueDate)})` : `${t.due}: ${fmt(f.dueDate)}`;
    const action = message.delivered
      ? `✅ ${t.sentViaApi}`
      : `👉 <a href="${e(message.link)}">${t.tapToSend}</a>`;
    return [
      `${i + 1}. <b>${who}</b> — ${e(tr(f.rule.label, locale))}${session}`,
      `   ${t.lastVisit}: ${fmt(f.lastVisitDate)} · ${when}`,
      `   <a href="tel:${e(f.phone)}">${e(f.phone)}</a> · ${action}`,
    ].join("\n");
  });
  return splitForTelegram(header, blocks);
}
