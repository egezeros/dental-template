"use client";

import { useState } from "react";
import { CalendarIcon, CloseIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { SELECT_SERVICE_EVENT } from "./booking-form";

/**
 * Floating WhatsApp button (all screens) plus a sticky Call / Book bar on mobile.
 * If the clinic's WhatsApp number is unverified, the button explains that instead
 * of guessing a number.
 */
export function FloatingActions(props: {
  whatsappHref: string | null;
  whatsappAria: string;
  whatsappMissing: string;
  tel: string | null;
  callLabel: string;
  bookLabel: string;
}) {
  const [notice, setNotice] = useState(false);
  return (
    <>
      <div className="fixed right-4 bottom-20 z-40 flex flex-col items-end gap-2 md:right-6 md:bottom-6">
        {notice && (
          <div className="flex max-w-60 items-start gap-2 rounded-2xl bg-white p-3 text-xs text-muted shadow-lg ring-1 ring-line">
            <span>{props.whatsappMissing}</span>
            <button type="button" onClick={() => setNotice(false)} aria-label="Close" className="text-slate-400">
              <CloseIcon size={14} />
            </button>
          </div>
        )}
        {props.whatsappHref ? (
          <a
            href={props.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={props.whatsappAria}
            className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition hover:scale-105"
          >
            <WhatsAppIcon size={30} />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setNotice((v) => !v)}
            aria-label={props.whatsappAria}
            className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15"
          >
            <WhatsAppIcon size={30} />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 ring-2 ring-white" />
          </button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-line bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {props.tel ? (
          <a href={`tel:${props.tel}`} className="btn-secondary py-3">
            <PhoneIcon size={18} />
            {props.callLabel}
          </a>
        ) : (
          <span className="btn-secondary py-3 opacity-60">{props.callLabel}</span>
        )}
        <a href="#booking" className="btn-primary py-3">
          <CalendarIcon size={18} />
          {props.bookLabel}
        </a>
      </div>
    </>
  );
}

/** "Book" link on a service card: pre-selects the service in the form and scrolls to it. */
export function ServiceBookLink({ serviceId, label }: { serviceId: string; label: string }) {
  return (
    <a
      href="#booking"
      onClick={() => window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: serviceId }))}
      className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
    >
      {label} →
    </a>
  );
}
