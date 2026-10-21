"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon } from "@/components/icons";
import type { Weekday } from "@/lib/i18n";

export const SELECT_SERVICE_EVENT = "clinic:select-service";

export interface BookingFormText {
  name: string;
  namePlaceholder: string;
  phone: string;
  service: string;
  selectService: string;
  date: string;
  time: string;
  selectTime: string;
  consent: string;
  noHealthInfo: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successText: string;
  another: string;
  error: string;
  demoNote: string;
  closedDay: string;
  errors: Record<Field, string>;
}

type Field = "name" | "phone" | "service" | "date" | "time" | "consent";
type Status = "idle" | "submitting" | "success" | "error";

const WEEKDAY_BY_JS_DAY: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MAX_DAYS_AHEAD = 120;

function bakuNow(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baku",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function BookingForm(props: {
  slug: string;
  locale: string;
  services: { id: string; name: string }[];
  slotsByWeekday: Record<Weekday, string[]>;
  text: BookingFormText;
  demo: boolean;
}) {
  const { text } = props;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [now, setNow] = useState<{ date: string; time: string } | null>(null);

  // "Today" must come from the visitor's clock at runtime, not from build time.
  useEffect(() => setNow(bakuNow()), []);

  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (props.services.some((s) => s.id === id)) setServiceId(id);
    };
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, [props.services]);

  const slots = useMemo(() => {
    if (!date) return [];
    const day = WEEKDAY_BY_JS_DAY[new Date(`${date}T12:00:00Z`).getUTCDay()];
    const all = props.slotsByWeekday[day] ?? [];
    return now && date === now.date ? all.filter((t) => t > now.time) : all;
  }, [date, now, props.slotsByWeekday]);

  useEffect(() => {
    if (time && !slots.includes(time)) setTime("");
  }, [slots, time]);

  function clientErrors(): Partial<Record<Field, boolean>> {
    const e: Partial<Record<Field, boolean>> = {};
    if (name.trim().length < 2) e.name = true;
    if (phone.replace(/\D/g, "").length < 9) e.phone = true;
    if (!serviceId) e.service = true;
    if (!date || (now && date < now.date)) e.date = true;
    if (!time) e.time = true;
    if (!consent) e.consent = true;
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = clientErrors();
    setErrors(e);
    if (Object.keys(e).length) return;
    setStatus("submitting");
    try {
      const res = await fetch(`/api/clinics/${props.slug}/bookings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, serviceId, date, time, consent, company, locale: props.locale }),
      });
      if (res.status === 201) {
        setStatus("success");
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (res.status === 422 && body.errors) {
        setErrors(body.errors);
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setName("");
    setPhone("");
    setServiceId("");
    setDate("");
    setTime("");
    setConsent(false);
    setErrors({});
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center px-2 py-10 text-center" role="status" aria-live="polite">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
          <CheckIcon size={28} />
        </span>
        <h3 className="mt-4 text-xl font-semibold">{text.successTitle}</h3>
        <p className="mt-2 max-w-sm text-muted">{text.successText}</p>
        {props.demo && <p className="mt-3 text-xs text-amber-700">{text.demoNote}</p>}
        <button type="button" onClick={reset} className="btn-secondary mt-6">
          {text.another}
        </button>
      </div>
    );
  }

  const err = (f: Field) => (errors[f] ? { "aria-invalid": true, "aria-describedby": `err-${f}` } : {});
  const closed = date !== "" && slots.length === 0;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div>
        <label htmlFor="bk-name" className="field-label">
          {text.name}
        </label>
        <input
          id="bk-name"
          className="field"
          autoComplete="name"
          placeholder={text.namePlaceholder}
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          {...err("name")}
        />
        {errors.name && <p id="err-name" className="field-error">{text.errors.name}</p>}
      </div>

      <div>
        <label htmlFor="bk-phone" className="field-label">
          {text.phone}
        </label>
        <input
          id="bk-phone"
          className="field"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+994 50 123 45 67"
          value={phone}
          maxLength={24}
          onChange={(e) => setPhone(e.target.value)}
          {...err("phone")}
        />
        {errors.phone && <p id="err-phone" className="field-error">{text.errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="bk-service" className="field-label">
          {text.service}
        </label>
        <select
          id="bk-service"
          className="field"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          {...err("service")}
        >
          <option value="">{text.selectService}</option>
          {props.services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.service && <p id="err-service" className="field-error">{text.errors.service}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bk-date" className="field-label">
            {text.date}
          </label>
          <input
            id="bk-date"
            className="field"
            type="date"
            min={now?.date}
            max={now ? addDays(now.date, MAX_DAYS_AHEAD) : undefined}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            {...err("date")}
          />
          {errors.date && <p id="err-date" className="field-error">{text.errors.date}</p>}
        </div>
        <div>
          <label htmlFor="bk-time" className="field-label">
            {text.time}
          </label>
          <select
            id="bk-time"
            className="field"
            value={time}
            disabled={!date || closed}
            onChange={(e) => setTime(e.target.value)}
            {...err("time")}
          >
            <option value="">{text.selectTime}</option>
            {slots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.time && <p id="err-time" className="field-error">{text.errors.time}</p>}
        </div>
      </div>
      {closed && <p className="-mt-2 text-xs font-medium text-amber-700">{text.closedDay}</p>}

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-[var(--brand)]"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            {...err("consent")}
          />
          <span>{text.consent}</span>
        </label>
        {errors.consent && <p id="err-consent" className="field-error">{text.errors.consent}</p>}
      </div>

      <p className="rounded-xl bg-canvas px-3 py-2 text-xs text-muted ring-1 ring-line">{text.noHealthInfo}</p>

      <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={status === "submitting"}>
        {status === "submitting" ? text.submitting : text.submit}
      </button>
      {status === "error" && (
        <p className="text-center text-sm font-medium text-rose-600" role="alert">
          {text.error}
        </p>
      )}
      {props.demo && <p className="text-center text-xs text-amber-700">{text.demoNote}</p>}
    </form>
  );
}
