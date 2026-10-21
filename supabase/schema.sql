-- Bookings table for the dental template.
-- Run once in the Supabase SQL editor (Project → SQL → New query).

-- gen_random_uuid() is built into Postgres 13+ (Supabase runs 15+), no extension needed.
-- Safe to re-run. The app also creates this table automatically when POSTGRES_URL is set.

create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  clinic_slug      text        not null,
  name             text        not null check (char_length(name) between 2 and 80),
  phone            text        not null,
  service_id       text        not null,
  service_name     text        not null,
  date             date        not null,
  time             text        not null check (time ~ '^\d{2}:\d{2}$'),
  locale           text        not null default 'az' check (locale in ('az', 'ru', 'en')),
  status           text        not null default 'new' check (status in ('new', 'confirmed', 'cancelled', 'no_show')),
  consent_at       timestamptz not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  reminder_sent_at timestamptz,
  source           text        not null default 'web' check (source in ('web', 'demo'))
);

create index if not exists bookings_clinic_date on public.bookings (clinic_slug, date);

-- No medical / health data is stored by design: there is no free-text notes column.

-- Lock the table down: only the server (service-role key) may read or write.
alter table public.bookings enable row level security;
-- (Intentionally no policies: anon/authenticated roles get no access.)
