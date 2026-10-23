# Clinic website template (Baku): dental, aesthetic, vet

One reusable Next.js template that turns a JSON file into a complete, mobile-first clinic website
with online booking, a staff dashboard, Telegram notifications, WhatsApp reminders and rule-based
repeat-visit follow-ups. Each **niche** (dental, aesthetic, vet, …) is a config file; each
**business** is another. It currently holds nine **unsolicited sales demos** for Baku businesses:
three dental clinics ([REPORT.md](REPORT.md)), three aesthetic clinics and three vet clinics
([REPORT-niches.md](REPORT-niches.md)).

| Route | What it is |
|---|---|
| `/<slug>` | Clinic site in Azerbaijani (default) |
| `/<slug>/ru`, `/<slug>/en` | Russian and English versions (switcher in the header) |
| `/<slug>/admin` | Staff dashboard (password protected) |
| `/api/clinics/<slug>/bookings` | `POST` booking endpoint used by the form |
| `/api/cron/reminders` | Daily job (Vercel Cron): tomorrow's reminders + due follow-ups |
| `/` | List of demo sites (demo mode only; hide with `HIDE_DEMO_INDEX=true`) |

Demo sites:

- Dental: `/dent-star`, `/white-estetic-dental`, `/dental-club`, `/beyaz-dis`, `/one-dent`
- Aesthetic: `/ahu-estetik-klinika`, `/aspera`, `/miss-laser`
- Vet: `/bona-vet-clinic`, `/myvet`, `/tarvet`
- Ankara (TR/EN): barbers `/berber-omer-aykut`, `/efendi-erkek-kuaforu`, `/inter-jr-barbers-club`;
  beauty `/isil-isil`, `/emy-kuafor`, `/nazli-erzar-cebeci`, `/zest-guzellik`

---

## Run locally

Requires **Node.js 22.13+** (Node's built-in `node:sqlite` is used for the optional SQLite store).

```bash
npm install
npm run dev            # http://localhost:3000
```

That's it: with no `.env` the app runs in **demo mode**. It seeds fictional bookings, uses in-memory
storage, simulates Telegram and WhatsApp, and the admin password is `demo`.

Other scripts:

```bash
npm test                 # Vitest: booking, reminders, follow-up rules, niches, adapters, business files
npm run typecheck        # tsc --noEmit
npm run build && npm start
npm run validate:clinics # validate niches/*.json and clinics/*.json
npm run report:fields    # print the VERIFIED / PLACEHOLDER table for every clinic
```

### Showing the demo on your phone

1. Deploy to Vercel (below) with `DEMO_MODE=true`, or run `npm run dev -- -H 0.0.0.0` on the
   same Wi-Fi and open `http://<your-laptop-ip>:3000`.
2. Optional: set `DEMO_WHATSAPP_NUMBER=994XXXXXXXXX` (your own number). Every WhatsApp button,
   and the reminder links for demo patients, will then open a chat with **you**, so you can
   show the whole flow without messaging the clinic or a stranger.
3. Optional: set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` (see below) to get the
   "new booking" notification live on your phone during the pitch.
4. Walk through it: book on `/<slug>`, then open `/<slug>/admin` (password `demo`), confirm
   the booking, tap **Run reminder job now**, then tap a WhatsApp reminder link. Further down,
   **Upcoming follow-ups** shows who is due back (6-month check-up, next laser session, annual
   vaccination…). Tap **WhatsApp** for a ready message, or **Send due follow-ups now** for the
   staff Telegram digest.

---

## How niches work

A **niche** is one file, `niches/<id>.json`, validated by `src/lib/niches/schema.ts`. It picks from
fixed libraries, so a new niche needs no code:

| Key | What it controls |
|---|---|
| `theme` | `preset` (`clinical`, `luxe`, `warm`: colours and type in `globals.css`), default `brandColor`, header `icon`, hero illustration (`heroArt`: `dental`, `beauty`, `pet`), `emergencyInHeader`, Telegram `emoji` |
| `sections` | Page sections in order, from: `hero`, `emergency`, `services`, `packages`, `audience`, `doctors`, `gallery`, `why`, `reviews`, `faq`, `booking`, `location`. A section with no data in the business file is skipped. |
| `nav` | Sections linked in the header |
| `services.categories` | Optional groups (e.g. laser / injectables / facial / body). When set, every service must name one, and the page groups by them. |
| `audience.options` | Options for the `audience` section, e.g. pet types with icons |
| `booking.fields` | Form fields in order. Core fields appear once with fixed ids (`name`, `phone`, `serviceId`, `date`, `time`, `consent`). Extras: `text` (max 40 characters, e.g. pet name), `select` (fixed options, e.g. species), `specialist` (the business's confirmed specialists). There is no free-text notes field by design. |
| `copy`, `adminCopy` | Wording and tone: dotted keys into the dictionaries in `src/lib/i18n.ts`, e.g. `"booking.service": { "az": "Prosedur", … }`. Only existing plain-text keys can be overridden; a typo fails validation. |
| `faq` | Generic FAQ used when a business has none of its own |
| `reminders.appointment.message` | Optional day-before reminder template (`{firstName} {clinic} {date} {time} {service} {address} {phone} {petName}`) |
| `reminders.followUps` | Repeat-visit rules (below) |
| `demo.values` | Values for fictional demo data, e.g. pet names |

Follow-up rule types:

- `interval`: due `afterDays` after the last attended matching visit, e.g. the dental 6-month
  check-up (`afterDays: 182`) or the vet annual vaccination (`match.categories: ["vaccination"]`, `afterDays: 365`).
- `course`: the next session of a treatment course. The number of sessions and the days between
  them come from each service's `course` in the business file, so laser can be every 6 weeks
  and another treatment every 4.

Every rule has `match` (`services` and/or `categories`; empty = any visit), `leadDays` (how early
staff are prompted), `stopAfterDays` (when to stop listing an unanswered one), `per` (`patient` =
phone number, `pet` = phone + pet name) and a `message` in AZ/RU/EN with placeholders
`{firstName} {clinic} {service} {petName} {dueDate} {session} {sessions} {phone}`.

### Add a niche

1. Copy `niches/_template.json` to `niches/<id>.json` (kebab-case, e.g. `physio`), set `"id"` to the
   same value, and edit it. Start from `dental.json`, `aesthetic.json` or `vet.json` if one is close.
2. Run `npm run validate:clinics`. Errors name the exact key (an unknown category in a rule, a
   missing core field, a copy key that doesn't exist, …).
3. Add businesses for it (below). That's all. A new section type, icon, field type or theme preset
   would be a code change; the libraries are in `src/lib/niches/schema.ts`.

### Businesses outside Azerbaijan (Türkiye)

A business file can set:
- `"locales": ["tr", "en"]` — site languages; the first one is served at `/<slug>`, the others at `/<slug>/<lang>`;
- `"country": "TR"` — Turkish phone formats (`0532 123 45 67` → `+905321234567`) and the
  `Europe/Istanbul` time zone, so "today", tomorrow's reminders and follow-ups follow Ankara time
  (override with `"timeZone"`).

Every translated text in the file **and in its niche** must exist in each of the business's
languages; validation names any that are missing. The `barber` and `beauty` niches are written in
Turkish and English. Staff Telegram messages use `STAFF_LOCALE_<SLUG>`, else `STAFF_LOCALE` if the
business uses that language, else the business's first language. Before taking a Turkish **clinic**
live, read the notes on Türkiye's health-advertising rules in
[research/RESEARCH-NOTES-turkiye.md](research/RESEARCH-NOTES-turkiye.md) — patient reviews,
prices and campaigns can't be shown there.

## Add a business

1. Copy the starter for its niche to `clinics/<slug>.json`: `clinics/_template.json` (dental),
   `_template-aesthetic.json` or `_template-vet.json`. Files starting with `_` are ignored.
2. Set `"slug"` to the file name and `"niche"` to the niche id.
3. Fill in the content. Every text field is either one string (same in all languages) or
   `{ "az": "…", "ru": "…", "en": "…" }`. Anything unknown stays `"[TO CONFIRM]"`; the site
   highlights it in amber so nobody mistakes it for a fact.
4. Record where each fact came from in `"provenance"` (`status` + `sources` URLs + `note`).
   The status vocabulary is defined in `src/lib/clinics/schema.ts`: `verified`,
   `verified-single`, `self-reported`, `conflict`, `outdated`, `constructed`, `design`, `placeholder`.
5. Run `npm run validate:clinics`. It reports any missing or invalid field with its path, and checks
   the file against its niche (categories, pet types, package links).

Key fields:

| Field | Notes |
|---|---|
| `niche` | Which `niches/<id>.json` drives the site |
| `brandColor` | `#rrggbb`; optional (falls back to the niche colour); drives buttons, accents and placeholder art |
| `sections` | Optional: reorder or trim the niche's section list for this business |
| `phones[]` | `display` as printed, `tel` in E.164 (`+994124338217`) for click-to-call |
| `whatsapp` | Digits only (`994513028237`) or `"[TO CONFIRM]"`; the button then explains the number is pending |
| `hours` | `mon`…`sun`: `["09:00","21:00"]`, `null` (closed) or `"[TO CONFIRM]"` (not bookable online) |
| `bookingSlots` | Optional window for the online form (e.g. a 24/7 clinic taking online bookings 09:00–21:00, or hours known without days) |
| `services[]` | `id`, `name`, `price` (`"[TO CONFIRM]"` or a localized string), `status`; `category` when the niche has categories; `course: { sessions, intervalDays }` for course treatments (drives the next-session reminder, not shown on the site) |
| `packages[]` | Courses / packages: `name`, `sessions`, `price`, `serviceId` (pre-selects the form), `status` |
| `emergency` | `phones` (else the main phones) and a `note`, e.g. out-of-hours availability |
| `audience` | Ids from the niche's audience options, e.g. `["dog", "cat"]` |
| `doctors[]` | `name`, `role`, optional `specialties`. Only confirmed names are offered in a specialist field. |
| `faq`, `gallery.count` | Own FAQ (else the niche's); number of before/after placeholder pairs |
| `map.query` | Free text used for the Google Maps embed and the "Get directions" link |
| `rating` | Optional, only with a source URL and an `asOf` date |

**Photos and logos:** the template uses neutral illustrations on purpose. Never copy a clinic's
photos or logo into a demo. The before/after gallery shows placeholders only: add real photos only
with the client's written consent. When a clinic signs, replace the illustrations with their own images.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. Everything is optional in demo mode.

| Variable | Purpose |
|---|---|
| `DEMO_MODE` | `true` (default) = mock data, simulated messaging, password `demo`. Set `false` for a real client. |
| `NEXT_PUBLIC_SITE_URL` | Public URL used in Telegram links (falls back to `VERCEL_URL`). |
| `NEXT_PUBLIC_AGENCY_NAME` | Your agency name in the footer demo note. |
| `DEMO_WHATSAPP_NUMBER` | Demo only: route all WhatsApp buttons and demo patients to your number. |
| `HIDE_DEMO_INDEX` | `true` hides the demo list on `/`. |
| `ADMIN_PASSWORD`, `ADMIN_PASSWORD_<SLUG>` | Dashboard password (global or per clinic, e.g. `ADMIN_PASSWORD_DENT_STAR`). Required when `DEMO_MODE=false`. |
| `ADMIN_SESSION_SECRET` | Extra secret mixed into the session cookie signature. |
| `STORAGE_DRIVER` | `supabase` \| `sqlite` \| `memory`. Auto-detected when empty. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project (server-side only). |
| `SQLITE_PATH` | SQLite file for local persistent storage (default `data/bookings.db`). |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather. |
| `TELEGRAM_CHAT_ID`, `TELEGRAM_CHAT_ID_<SLUG>` | Staff chat (global default or per clinic). |
| `STAFF_LOCALE` | Language of Telegram messages: `az` (default), `ru`, `en`. |
| `CRON_SECRET` | Protects `/api/cron/reminders`; required when `DEMO_MODE=false`. |
| `GOOGLE_MAPS_API_KEY` | Shows each clinic's live Google rating and reviews (Places API). Without it, labelled sample reviews are shown. |
| `MESSAGING_PROVIDER` | `wa-link` (default) or `whatsapp-cloud`. |
| `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_API_VERSION` | WhatsApp Business Platform (Cloud API). |
| `WHATSAPP_FOLLOWUP_TEMPLATE` | Approved template for follow-ups (body: name, clinic, service, due date). Without it, follow-ups stay one-tap `wa.me` links. |

`<SLUG>` is the clinic slug in UPPER_SNAKE case: `dent-star` → `DENT_STAR`.

### Storage

> **On Vercel you need Supabase.** Vercel runs the booking endpoint and the admin page as
> separate serverless functions with separate memory, so without a database, bookings made on the
> site never reach the dashboard. The dashboard shows a red warning when that's the case.

- **memory**: zero setup, for `npm run dev` on one machine. Not for Vercel (see above).
- **sqlite**: persistent locally (`node:sqlite`, no native build). Not for Vercel (ephemeral disk).
- **supabase**: production, and any Vercel demo. Row Level Security is on with no public
  policies, so only the server can read bookings.

**Connect Supabase on Vercel (about 3 minutes):**

1. Vercel → your project → **Storage** → **Create Database** → **Supabase** → follow the steps
   (free plan is fine; pick a region near Baku, e.g. Frankfurt) → connect it to this project.
   This adds `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `POSTGRES_URL` automatically.
2. **Redeploy.** On first use the app creates the `bookings` table by itself using `POSTGRES_URL`.
   If the dashboard says the table is missing, open Supabase → **SQL Editor**, paste
   [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

Using your own Supabase project instead: set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
(or `SUPABASE_SECRET_KEY`) yourself and run `supabase/schema.sql` once.

**Upgrading a database created before the aesthetic/vet release:** the table gains two columns:
`details` (pet name, species, specialist) and `followups` (which follow-ups were sent). With
`POSTGRES_URL` set (Vercel's Supabase integration sets it), the app adds them automatically the
first time it needs them. Otherwise, run `supabase/schema.sql` again in the SQL Editor; it only adds
what's missing. Dental bookings keep working on the old table in the meantime. Local SQLite files
are upgraded automatically.

In demo mode the dashboard adds a fresh set of fictional patients (marked "(demo)") every day,
with fixed IDs so several server instances never duplicate them; real bookings are never
touched. It also adds fictional past visits so every niche's follow-up rules have someone
overdue, due and coming up. Set `DEMO_SEED=false` to turn that off.

### Telegram notifications

1. In Telegram, talk to **@BotFather** → `/newbot` → copy the token into `TELEGRAM_BOT_TOKEN`.
2. Add the bot to the clinic's staff group (or message it directly), send any message, then open
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `chat.id` (groups are negative numbers).
3. Set `TELEGRAM_CHAT_ID_<SLUG>` per clinic (or `TELEGRAM_CHAT_ID` for one shared chat).

Without a token, messages are logged and shown in the dashboard's **Notification log** as "simulated".

### Google reviews (live)

With `GOOGLE_MAPS_API_KEY` set, each clinic page shows the clinic's **real Google rating and up to
5 reviews**, pulled from the official **Google Places API (New)**. Reviews appear in Google's
"most relevant" order, in the reviewer's own words, with the reviewer's name, photo and link, and
a "Reviews from Google Maps" link, as Google's display policy requires. Pages refresh every
12 hours. If the key is missing, or the clinic has no Google reviews, the labelled sample block is shown instead.

Setup (about 5 minutes):

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project and attach a billing
   account. Google requires billing for the Places API, even within its free monthly usage.
2. **APIs & Services → Library →** enable **Places API (New)**.
3. **APIs & Services → Credentials → Create credentials → API key.** Restrict it to *Places API (New)*.
4. In Vercel, add `GOOGLE_MAPS_API_KEY=<key>` and **redeploy**.

Each clinic is found automatically by its `map.query`, searched only inside Baku. To pin the exact
Google listing, add `"google": { "placeId": "ChIJ…" }` to the clinic file (find the ID with Google's
[Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)).
`"google": { "enabled": false }` turns live reviews off for one clinic. Usage is tiny: 3 clinics ×
3 languages, refreshed twice a day. Check Google's current pricing before you scale up.

**Not showing up?** Open `/api/google-reviews` on your deployment. It tells you per clinic whether
the key is set, which Google listing was matched, how many reviews it has, and, if Google refused,
the exact reason with the fix. Outside demo mode, add `?secret=<CRON_SECRET>`.

Don't copy reviews into the clinic files by hand. Google's terms only allow showing them through the API, with attribution.

### Reminders and WhatsApp

`vercel.json` schedules `/api/cron/reminders` daily at **14:00 UTC (18:00 Baku)**. For each clinic it:

1. finds tomorrow's appointments (Baku date) that are `new` or `confirmed` and not reminded yet;
2. prepares a reminder per patient in their booking language (AZ / RU / EN);
3. sends staff one Telegram digest with a **one-tap `wa.me` link** per patient: staff tap it,
   WhatsApp opens with the text pre-filled, and they press send;
4. marks those bookings as reminded, so re-runs never duplicate.

The dashboard also lists tomorrow's reminders with the same buttons, plus a **Run reminder job now** button.

### Repeat-visit follow-ups

The same daily job then runs the niche's follow-up rules (`src/lib/followups.ts`). For each rule it finds each
patient's (or pet's) **last attended visit**: a `confirmed` booking on or before today. No-shows,
cancellations and unconfirmed requests don't count. It then works out the due date and skips anyone
who already has a new appointment. Then it:

1. prepares a message per person in their booking language (wa.me link, or a WhatsApp API send);
2. sends staff one Telegram digest of everyone due or overdue;
3. records the follow-up as sent on that visit, so re-runs never repeat it.

The dashboard shows a **Patients due back** stat and an **Upcoming follow-ups** list (overdue, due,
and the next 30 days). Each row has a WhatsApp button in the patient's language, a second one in the
other of AZ/RU, and **Mark sent** for messages staff send by hand.

Shipped rules: dental, a check-up and cleaning 182 days after any visit. Aesthetic, the next session
of a course treatment, using the service's `course`. Vet, annual vaccination and annual check-up,
365 days after the last visit in that category, tracked per pet.

**Plugging in the official WhatsApp Business API:** set `MESSAGING_PROVIDER=whatsapp-cloud` plus
`WHATSAPP_CLOUD_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`, and create an approved message template
(default name `appointment_reminder`, body with 4 variables: name, clinic, date, time; one
language per template: `az`, `ru`, `en`). Reminders are then sent directly, and the `wa.me` link
stays as a fallback in the digest. The adapter is in `src/lib/messaging/index.ts`. To add another
provider (e.g. a Twilio or 360dialog BSP), implement the `MessagingProvider` interface.

---

## Deploy to Vercel

1. Push this repository to GitHub and **Import** it in Vercel (framework preset: Next.js).
2. Add environment variables (Project → Settings → Environment Variables):
   - Demo deployment: `DEMO_MODE=true`, optionally `NEXT_PUBLIC_AGENCY_NAME`,
     `DEMO_WHATSAPP_NUMBER`, `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`, and `HIDE_DEMO_INDEX=true`
     before sending links to clinics.
   - Real client: `DEMO_MODE=false`, `ADMIN_PASSWORD_<SLUG>`, `CRON_SECRET`, `SUPABASE_URL`,
     `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID_<SLUG>`, `NEXT_PUBLIC_SITE_URL`.
3. Deploy. The cron job in `vercel.json` is registered automatically. The Hobby plan allows
   daily crons, which is all this needs.
4. Environment variable changes need a **redeploy**, because clinic pages are prerendered at build time.

All pages send `X-Robots-Tag: noindex`, `<meta name="robots" content="noindex">`, and
`robots.txt` disallows everything. **Remove these three when a clinic becomes a real client**
(`next.config.ts`, `src/app/layout.tsx` + `src/lib/clinics/metadata.ts`, `src/app/robots.ts`)
and remove the demo banner in `src/components/site/clinic-site.tsx`.

---

## Project structure

```
niches/                  one JSON file per niche: dental, aesthetic, vet (+ _template.json)
clinics/                 one JSON file per business (+ _template*.json starters)
research/                research notes with sources (dental; aesthetic + vet)
src/app/[slug]/          clinic site (AZ), [lang]/ (RU, EN), admin/ (dashboard + server actions)
src/app/api/             booking endpoint, reminder cron
src/components/site/     section library (sections.tsx), page shell, booking form, floating WhatsApp / call bar
src/lib/niches/          niche schema (section/field/icon/rule libraries), loader, copy overrides
src/lib/clinics/         business schema (zod) + provenance, loader (checks against the niche), booking slots
src/lib/booking/         validation incl. niche fields (no health data) and create-booking service
src/lib/storage/         BookingStore adapters: supabase, sqlite, memory, demo seed
src/lib/notify/          Telegram notifier + message templates
src/lib/messaging/       MessagingProvider: wa.me links, WhatsApp Cloud API
src/lib/reminders.ts     next-day selection + reminder job
src/lib/followups.ts     follow-up rule engine + follow-up job
supabase/schema.sql      table + RLS
tests/                   Vitest suite
```

## Privacy by design

The booking form collects **name, phone, service, preferred date/time and consent**, plus only
what the niche declares: a pet's name (max 30 characters) and species for vets, and an optional preferred
specialist for aesthetic clinics. There is no free-text notes field: niche text fields are capped
at 40 characters and reject digit runs, and the API drops any key the niche doesn't declare. So no
medical history, health details or contraindications can be stored. The consent timestamp is saved
with each booking.
