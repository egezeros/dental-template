import { detailLines } from "../booking/fields";
import type { Booking } from "../booking/types";
import type { Clinic } from "../clinics/schema";
import type { FollowUp } from "../followups";
import { isLocale, INTL_LOCALE, type Locale } from "../i18n";
import type { PreparedReminder } from "../messaging";
import { getNiche } from "../niches/load";
import { formatDate } from "../time";
import { escapeHtml } from "./telegram";

/** Language of staff notifications (Telegram). STAFF_LOCALE=az|ru|en, default az. */
export function staffLocale(): Locale {
  const v = process.env.STAFF_LOCALE;
  return isLocale(v) ? v : "az";
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
} satisfies Record<Locale, Record<string, string>>;

const e = escapeHtml;

export function newBookingMessage(booking: Booking, clinic: Clinic, adminUrl: string, demo: boolean): string {
  const t = L[staffLocale()];
  const niche = getNiche(clinic.niche);
  const when = `${formatDate(booking.date, INTL_LOCALE[staffLocale()])}, ${booking.time}`;
  const details = detailLines(booking, niche, staffLocale(), { specialist: t.specialist });
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
  const t = L[staffLocale()];
  const header = [
    demo ? `<i>${t.demo}</i>` : null,
    `<b>${t.tomorrow} — ${e(clinic.name)}</b>`,
    e(formatDate(date, INTL_LOCALE[staffLocale()])),
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
  const locale = staffLocale();
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
      `${i + 1}. <b>${who}</b> — ${e(f.rule.label[locale])}${session}`,
      `   ${t.lastVisit}: ${fmt(f.lastVisitDate)} · ${when}`,
      `   <a href="tel:${e(f.phone)}">${e(f.phone)}</a> · ${action}`,
    ].join("\n");
  });
  return splitForTelegram(header, blocks);
}
