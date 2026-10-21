import type { Booking } from "../booking/types";
import type { Clinic } from "../clinics/schema";
import { INTL_LOCALE, tr, type Locale } from "../i18n";
import { formatDate } from "../time";

/**
 * Patient reminder text. Azerbaijani by default, Russian for patients who booked
 * in Russian, English for English bookings.
 */
export function reminderText(booking: Booking, clinic: Clinic): string {
  const locale: Locale = booking.locale;
  const date = formatDate(booking.date, INTL_LOCALE[locale]);
  const firstName = booking.name.replace(/\s*\((demo|демо)\)\s*$/i, "").split(" ")[0];
  const address = tr(clinic.address, locale);
  const phone = clinic.phones[0]?.display ?? "";
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
