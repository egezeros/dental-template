import type { Booking } from "../booking/types";
import type { Clinic } from "../clinics/schema";
import { isLocale, INTL_LOCALE, type Locale } from "../i18n";
import type { PreparedReminder } from "../messaging";
import { formatDate } from "../time";
import { escapeHtml } from "./telegram";

/** Language of staff notifications (Telegram). STAFF_LOCALE=az|ru|en, default az. */
export function staffLocale(): Locale {
  const v = process.env.STAFF_LOCALE;
  return isLocale(v) ? v : "az";
}

const L = {
  az: {
    newBooking: "🦷 Yeni qəbul müraciəti",
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
  },
  ru: {
    newBooking: "🦷 Новая заявка на приём",
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
  },
  en: {
    newBooking: "🦷 New appointment request",
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
  },
} satisfies Record<Locale, Record<string, string>>;

const e = escapeHtml;

export function newBookingMessage(booking: Booking, clinic: Clinic, adminUrl: string, demo: boolean): string {
  const t = L[staffLocale()];
  const when = `${formatDate(booking.date, INTL_LOCALE[staffLocale()])}, ${booking.time}`;
  return [
    demo ? `<i>${t.demo}</i>` : null,
    `<b>${t.newBooking} — ${e(clinic.name)}</b>`,
    "",
    `👤 ${t.name}: <b>${e(booking.name)}</b>`,
    `📞 ${t.phone}: <a href="tel:${e(booking.phone)}">${e(booking.phone)}</a>`,
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
    return [
      `${i + 1}. <b>${booking.time}</b> — ${e(booking.name)} (${status})`,
      `   ${e(booking.serviceName)} · <a href="tel:${e(booking.phone)}">${e(booking.phone)}</a>`,
      `   ${action}`,
    ].join("\n");
  });
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
