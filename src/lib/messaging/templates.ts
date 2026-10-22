import type { Booking } from "../booking/types";
import type { Clinic } from "../clinics/schema";
import { INTL_LOCALE, tr, type Locale } from "../i18n";
import { getNiche } from "../niches/load";
import { formatDate } from "../time";

/** First name for a friendly greeting; demo rows carry a "(demo)" suffix that is dropped. */
export function firstNameOf(name: string): string {
  return name.replace(/\s*\((demo|демо)\)\s*$/i, "").split(" ")[0];
}

/** Used when a template mentions {petName} but the booking has none. */
const PET_FALLBACK: Record<Locale, string> = { az: "ev heyvanınız", ru: "вашего питомца", en: "your pet" };

/** Replace {placeholders} in a niche message template. Unknown placeholders become empty. */
export function fillTemplate(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_m, key: string) => String(vars[key] ?? "")).replace(/ {2,}/g, " ");
}

export function petNameOf(details: Booking["details"], locale: Locale): string {
  return details?.petName || PET_FALLBACK[locale];
}

/**
 * Patient reminder text. Azerbaijani by default, Russian for patients who booked
 * in Russian, English for English bookings. A niche may supply its own template.
 */
export function reminderText(booking: Booking, clinic: Clinic): string {
  const locale: Locale = booking.locale;
  const date = formatDate(booking.date, INTL_LOCALE[locale]);
  const firstName = firstNameOf(booking.name);
  const address = tr(clinic.address, locale);
  const phone = clinic.phones[0]?.display ?? "";
  const template = getNiche(clinic.niche).reminders.appointment.message?.[locale];
  if (template) {
    return fillTemplate(template, {
      firstName,
      clinic: clinic.name,
      date,
      time: booking.time,
      service: booking.serviceName,
      address,
      phone,
      petName: petNameOf(booking.details, locale),
    });
  }
  switch (locale) {
    case "ru":
      return (
        `Здравствуйте, ${firstName}! Напоминаем о вашем приёме в клинике ${clinic.name} ` +
        `завтра, ${date}, в ${booking.time} (${booking.serviceName}). Адрес: ${address}. ` +
        `Если планы изменились, пожалуйста, ответьте на это сообщение или позвоните: ${phone}. Ждём вас!`
      );
    case "en":
      return (
        `Hello ${firstName}! This is a reminder of your appointment at ${clinic.name} ` +
        `tomorrow, ${date}, at ${booking.time} (${booking.serviceName}). Address: ${address}. ` +
        `If your plans have changed, please reply to this message or call ${phone}. See you soon!`
      );
    default:
      return (
        `Salam, ${firstName}! ${clinic.name} klinikasında sabah, ${date}, saat ${booking.time} üçün ` +
        `qəbulunuzu xatırladırıq (${booking.serviceName}). Ünvan: ${address}. ` +
        `Planlarınız dəyişibsə, zəhmət olmasa bu mesaja cavab yazın və ya zəng edin: ${phone}. Sizi gözləyirik!`
      );
  }
}

/** One-tap WhatsApp link that opens a chat with the patient and pre-fills the text. */
export function waMeLink(phoneE164: string, text: string): string {
  return `https://wa.me/${phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
