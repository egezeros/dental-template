# Dental clinic website template (Baku)

One reusable Next.js template that turns a single JSON file into a complete, mobile-first clinic
website with online booking, a staff dashboard, Telegram notifications and WhatsApp reminders.
It currently holds three **unsolicited sales demos** for Baku clinics (see [REPORT.md](REPORT.md)).

| Route | What it is |
|---|---|
| `/<slug>` | Clinic site in Azerbaijani (default) |
| `/<slug>/ru`, `/<slug>/en` | Russian and English versions (switcher in the header) |
| `/<slug>/admin` | Staff dashboard (password protected) |
| `/api/clinics/<slug>/bookings` | `POST` booking endpoint used by the form |
| `/api/cron/reminders` | Daily reminder job (Vercel Cron) |
| `/` | List of demo sites (demo mode only; hide with `HIDE_DEMO_INDEX=true`) |

Demo clinics: `/dent-star`, `/white-estetic-dental`, `/dental-club`.

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
npm test                 # Vitest: booking creation, reminder selection, adapters, clinic files
npm run typecheck        # tsc --noEmit
npm run build && npm start
npm run validate:clinics # validate clinics/*.json only
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
   the booking, tap **Run reminder job now**, then tap a WhatsApp reminder link.

---

## Add a clinic

Adding a clinic means adding one JSON file. Nothing else changes.

1. Copy `clinics/_template.json` to `clinics/<slug>.json` (lowercase kebab-case, e.g. `smile-baku`).
   Files starting with `_` are ignored.
2. Set `"slug"` to the same value as the file name.
3. Fill in the content. Every text field is either one string (same in all languages) or
   `{ "az": "…", "ru": "…", "en": "…" }`. Anything unknown stays `"[TO CONFIRM]"`; the site
   highlights it in amber so nobody mistakes it for a fact.
4. Record where each fact came from in `"provenance"` (`status` + `sources` URLs + `note`).
   The status vocabulary is defined in `src/lib/clinics/schema.ts`: `verified`,
   `verified-single`, `self-reported`, `conflict`, `outdated`, `constructed`, `design`, `placeholder`.
5. Run `npm run validate:clinics`. It reports any missing or invalid field with its path.

Key fields:

| Field | Notes |
|---|---|
| `brandColor` | `#rrggbb`; drives buttons, accents and placeholder art |
| `phones[]` | `display` as printed, `tel` in E.164 (`+994124338217`) for click-to-call |
| `whatsapp` | Digits only (`994513028237`) or `"[TO CONFIRM]"`; the button then explains the number is pending |
| `hours` | `mon`…`sun`: `["09:00","21:00"]`, `null` (closed) or `"[TO CONFIRM]"` (not bookable online) |
| `bookingSlots` | Optional window for the online form (e.g. a 24/7 clinic taking online bookings 09:00–21:00) |
| `services[]` | `id`, `name`, `price` (`"[TO CONFIRM]"` or a localized string), `status` |
| `map.query` | Free text used for the Google Maps embed and the "Get directions" link |
| `rating` | Optional, only with a source URL and an `asOf` date |

**Photos and logos:** the template uses neutral illustrations on purpose. Never copy a clinic's
photos or logo into a demo. When a clinic signs, replace the illustrations with their own images.

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

`<SLUG>` is the clinic slug in UPPER_SNAKE case: `dent-star` → `DENT_STAR`.

### Storage

- **memory**: zero setup; data lives as long as the server process. On Vercel each serverless
  instance has its own memory, so a booking can occasionally be missing from the dashboard. Fine
  for a quick demo; use Supabase for anything you rely on.
- **sqlite**: persistent locally (`node:sqlite`, no native build). Not for Vercel (ephemeral disk).
- **supabase**: production. Run [`supabase/schema.sql`](supabase/schema.sql) once in the
  Supabase SQL editor, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Row Level
  Security is on with no public policies, so only the server can read bookings.

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
clinics/                 one JSON file per clinic (+ _template.json)
research/                Phase 1 research notes with sources
src/app/[slug]/          clinic site (AZ), [lang]/ (RU, EN), admin/ (dashboard + server actions)
src/app/api/             booking endpoint, reminder cron
src/components/site/     page sections, booking form, floating WhatsApp / call bar
src/lib/clinics/         schema (zod) + provenance, loader, booking slots
src/lib/booking/         validation (no health data) and create-booking service
src/lib/storage/         BookingStore adapters: supabase, sqlite, memory, demo seed
src/lib/notify/          Telegram notifier + message templates
src/lib/messaging/       MessagingProvider: wa.me links, WhatsApp Cloud API
src/lib/reminders.ts     next-day selection + reminder job
supabase/schema.sql      table + RLS
tests/                   Vitest suite
```

## Privacy by design

The booking form collects **name, phone, service, preferred date/time and consent only**. There is
no free-text field, and the API drops any extra keys, so no medical history or health details can
be stored. The consent timestamp is saved with each booking.
