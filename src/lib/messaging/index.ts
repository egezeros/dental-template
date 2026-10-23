import type { Booking } from "../booking/types";
import type { Clinic } from "../clinics/schema";
import { messagingProvider, whatsappCloudConfig } from "../config";
import { followUpText, type FollowUp } from "../followups";
import { INTL_LOCALE } from "../i18n";
import { formatDate } from "../time";
import { firstNameOf, reminderText, waMeLink } from "./templates";

export interface PreparedReminder {
  bookingId: string;
  provider: string;
  text: string;
  /** One-tap wa.me link for staff. Always present, also as a fallback for API providers. */
  link: string;
  /** True when the provider actually delivered the message (API providers only). */
  delivered: boolean;
  error?: string;
}

/**
 * Messaging adapter. The default provider only prepares wa.me links that staff
 * send with one tap. The WhatsApp Business (Cloud API) provider sends directly
 * once an approved template and credentials exist.
 */
export interface MessagingProvider {
  readonly name: string;
  sendReminder(booking: Booking, clinic: Clinic): Promise<PreparedReminder>;
  /** Repeat-visit message (check-up, next session, vaccination). bookingId is the source visit. */
  sendFollowUp(followUp: FollowUp, clinic: Clinic): Promise<PreparedReminder>;
}

export class WaLinkProvider implements MessagingProvider {
  readonly name = "wa-link";
  async sendReminder(booking: Booking, clinic: Clinic): Promise<PreparedReminder> {
    const text = reminderText(booking, clinic);
    return { bookingId: booking.id, provider: this.name, text, link: waMeLink(booking.phone, text), delivered: false };
  }
  async sendFollowUp(f: FollowUp, clinic: Clinic): Promise<PreparedReminder> {
    const text = followUpText(f, clinic);
    return { bookingId: f.visit.id, provider: this.name, text, link: waMeLink(f.phone, text), delivered: false };
  }
}

/**
 * WhatsApp Business Platform (Cloud API) provider.
 * Requires a Meta Business account, a registered phone number and an approved
 * message template whose body takes 4 parameters: {{1}} name, {{2}} clinic, {{3}} date, {{4}} time.
 * Follow-ups use a second template (WHATSAPP_FOLLOWUP_TEMPLATE) with {{1}} name, {{2}} clinic,
 * {{3}} service, {{4}} due date; without it they fall back to wa.me links for staff.
 * NOTE: written against Meta's documented API but not exercised against a live account.
 */
export class WhatsAppCloudProvider implements MessagingProvider {
  readonly name = "whatsapp-cloud";
  constructor(
    private cfg: {
      token: string;
      phoneNumberId: string;
      templateName: string;
      followUpTemplateName?: string;
      apiVersion: string;
    },
    private fetchImpl: typeof fetch = fetch,
  ) {}

  async sendReminder(booking: Booking, clinic: Clinic): Promise<PreparedReminder> {
    const text = reminderText(booking, clinic);
    const base = { bookingId: booking.id, provider: this.name, text, link: waMeLink(booking.phone, text) };
    return this.sendTemplate(base, booking.phone, booking.locale, this.cfg.templateName, [
      booking.name,
      clinic.name,
      booking.date,
      booking.time,
    ]);
  }

  async sendFollowUp(f: FollowUp, clinic: Clinic): Promise<PreparedReminder> {
    const text = followUpText(f, clinic);
    const base = { bookingId: f.visit.id, provider: this.name, text, link: waMeLink(f.phone, text) };
    if (!this.cfg.followUpTemplateName) return { ...base, delivered: false };
    return this.sendTemplate(base, f.phone, f.locale, this.cfg.followUpTemplateName, [
      firstNameOf(f.name),
      clinic.name,
      f.visit.serviceName,
      formatDate(f.dueDate, INTL_LOCALE[f.locale]),
    ]);
  }

  private async sendTemplate(
    base: Omit<PreparedReminder, "delivered" | "error">,
    phone: string,
    locale: Booking["locale"],
    templateName: string,
    params: string[],
  ): Promise<PreparedReminder> {
    const languageCode = locale;
    try {
      const res = await this.fetchImpl(
        `https://graph.facebook.com/${this.cfg.apiVersion}/${this.cfg.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: { authorization: `Bearer ${this.cfg.token}`, "content-type": "application/json" },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone.replace(/\D/g, ""),
            type: "template",
            template: {
              name: templateName,
              language: { code: languageCode },
              components: [{ type: "body", parameters: params.map((t) => ({ type: "text", text: t })) }],
            },
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return { ...base, delivered: true };
    } catch (err) {
      return { ...base, delivered: false, error: (err as Error).message };
    }
  }
}

export function getMessagingProvider(): MessagingProvider {
  if (messagingProvider() === "whatsapp-cloud") {
    const cfg = whatsappCloudConfig();
    if (cfg) return new WhatsAppCloudProvider(cfg);
    console.warn("[messaging] MESSAGING_PROVIDER=whatsapp-cloud but credentials are missing; using wa.me links");
  }
  return new WaLinkProvider();
}
