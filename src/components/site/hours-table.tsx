"use client";

import { useEffect, useState } from "react";
import type { Weekday } from "@/lib/i18n";
import { Fill } from "./fill";

const JS_DAY: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Opening hours; highlights today (business time) after hydration so static pages stay correct. */
export function HoursTable(props: {
  rows: { day: Weekday; label: string; value: string; closed: boolean }[];
  todayLabel: string;
  timeZone: string;
}) {
  const [today, setToday] = useState<Weekday | null>(null);
  useEffect(() => {
    const name = new Intl.DateTimeFormat("en-US", { timeZone: props.timeZone, weekday: "short" }).format(new Date());
    const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
    setToday(JS_DAY[idx] ?? null);
  }, [props.timeZone]);

  return (
    <dl className="mt-6 divide-y divide-line overflow-hidden rounded-2xl bg-canvas ring-1 ring-line">
      {props.rows.map((r) => {
        const isToday = r.day === today;
        return (
          <div
            key={r.day}
            className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${isToday ? "bg-brand/8" : ""}`}
          >
            <dt className={`flex items-center gap-2 ${isToday ? "font-semibold text-brand" : "text-muted"}`}>
              {r.label}
              {isToday && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                  {props.todayLabel}
                </span>
              )}
            </dt>
            <dd className={`font-medium tabular-nums ${r.closed ? "text-rose-600" : "text-ink"}`}>
              <Fill text={r.value} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
