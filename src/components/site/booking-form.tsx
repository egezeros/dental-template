"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
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
  selectOption: string;
  optional: string;
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
  errors: Record<CoreError | "field", string>;
}

/**
 * One form field, resolved on the server from the niche config (labels in the page language).
 * Core fields keep fixed ids (name, phone, serviceId, date, time, consent); extra fields
 * (text, select, specialist) are posted under their own id.
 */
export interface FormField {
  id: string;
  type: "name" | "phone" | "service" | "date" | "time" | "consent" | "text" | "select" | "specialist";
  label: string;
  placeholder?: string;
  required: boolean;
  maxLength?: number;
  options?: { value: string; label: string }[];
}

type CoreError = "name" | "phone" | "service" | "date" | "time" | "consent";
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

const isExtra = (f: FormField) => f.type === "text" || f.type === "select" || f.type === "specialist";
/** Server error key for a field: core fields use their type ("service"), extras their id. */
const errorKey = (f: FormField) => (isExtra(f) ? f.id : f.type);

export function BookingForm(props: {
  slug: string;
  locale: string;
  fields: FormField[];
  services: { id: string; name: string }[];
  slotsByWeekday: Record<Weekday, string[]>;
  text: BookingFormText;
  demo: boolean;
}) {
  const { text, fields } = props;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [consent, setConsent] = useState(false);
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
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

  function clientErrors(): Record<string, boolean> {
    const e: Record<string, boolean> = {};
    if (name.trim().length < 2) e.name = true;
    if (phone.replace(/\D/g, "").length < 9) e.phone = true;
    if (!serviceId) e.service = true;
    if (!date || (now && date < now.date)) e.date = true;
    if (!time) e.time = true;
    if (!consent) e.consent = true;
    for (const f of fields) if (isExtra(f) && f.required && !(extra[f.id] ?? "").trim()) e[f.id] = true;
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
        body: JSON.stringify({ ...extra, name, phone, serviceId, date, time, consent, company, locale: props.locale }),
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
    setExtra({});
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

  const err = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `err-${k}` } : {});
  const closed = date !== "" && slots.length === 0;
  const errorText = (f: FormField) => (isExtra(f) ? text.errors.field : text.errors[f.type as CoreError]);
  const errorLine = (f: FormField) =>
    errors[errorKey(f)] && (
      <p id={`err-${errorKey(f)}`} className="field-error">
        {errorText(f)}
      </p>
    );
  const label = (f: FormField, htmlFor: string) => (
    <label htmlFor={htmlFor} className="field-label">
      {f.label}
      {isExtra(f) && !f.required && <span className="font-normal text-muted"> ({text.optional})</span>}
    </label>
  );

  function renderDate(f: FormField) {
    return (
      <div>
        {label(f, "bk-date")}
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
        {errorLine(f)}
      </div>
    );
  }

  function renderTime(f: FormField) {
    return (
      <div>
        {label(f, "bk-time")}
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
        {errorLine(f)}
      </div>
    );
  }

  function renderField(f: FormField, i: number) {
    switch (f.type) {
      case "name":
        return (
          <div>
            {label(f, "bk-name")}
            <input
              id="bk-name"
              className="field"
              autoComplete="name"
              placeholder={f.placeholder ?? text.namePlaceholder}
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              {...err("name")}
            />
            {errorLine(f)}
          </div>
        );
      case "phone":
        return (
          <div>
            {label(f, "bk-phone")}
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
            {errorLine(f)}
          </div>
        );
      case "service":
        return (
          <div>
            {label(f, "bk-service")}
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
            {errorLine(f)}
          </div>
        );
      case "date": {
        // A date followed by a time renders as one row: [date | time].
        const next = fields[i + 1];
        if (next?.type !== "time") return renderDate(f);
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              {renderDate(f)}
              {renderTime(next)}
            </div>
            {closed && <p className="-mt-2 text-xs font-medium text-amber-700">{text.closedDay}</p>}
          </>
        );
      }
      case "time":
        return fields[i - 1]?.type === "date" ? null : renderTime(f);
      case "consent":
        return (
          <>
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
              {errorLine(f)}
            </div>
          </>
        );
      case "text":
        return (
          <div>
            {label(f, `bk-${f.id}`)}
            <input
              id={`bk-${f.id}`}
              className="field"
              autoComplete="off"
              placeholder={f.placeholder}
              value={extra[f.id] ?? ""}
              maxLength={f.maxLength}
              onChange={(e) => setExtra((x) => ({ ...x, [f.id]: e.target.value }))}
              {...err(f.id)}
            />
            {errorLine(f)}
          </div>
        );
      case "select":
      case "specialist":
        return (
          <div>
            {label(f, `bk-${f.id}`)}
            <select
              id={`bk-${f.id}`}
              className="field"
              value={extra[f.id] ?? ""}
              onChange={(e) => setExtra((x) => ({ ...x, [f.id]: e.target.value }))}
              {...err(f.id)}
            >
              {(f.type === "select" || f.required) && <option value="">{text.selectOption}</option>}
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errorLine(f)}
          </div>
        );
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      {fields.map((f, i) => (
        <Fragment key={f.id}>{renderField(f, i)}</Fragment>
      ))}

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
