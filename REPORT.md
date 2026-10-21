# Sales demo report: dental clinics in Baku

Prepared 2026-10-21 · Branch `claude/ecstatic-meitner-l1jorw`

## TL;DR

- **3 real clinics found** that are popular but weak online, with each one's gap documented and sourced:
  - **Dent Star** (Yasamal): 24/7 clinic, large Instagram, no real website.
  - **White Estetic Dental** (Xətai): active Instagram, no website.
  - **Dental Club** (Nərimanov): since 2003, Google 4.7, but its website's online booking is reportedly switched off.
- **One Next.js template, three demo sites** (`/dent-star`, `/white-estetic-dental`, `/dental-club`):
  - Each runs in AZ, RU and EN.
  - Each has booking, an admin dashboard, Telegram alerts and WhatsApp reminders.
  - Everything runs on a phone in demo mode with **zero API keys**.
- **Every fact on the sites is either sourced or visibly marked `[TO CONFIRM]`.**
- **Important caveat:** the research environment could **not open web pages directly**. Only a web
  *search* tool worked, so every fact is "verified via search results" and **must be re-checked
  (ideally by phone) before you contact a clinic**. Website speed and mobile-friendliness could not be measured.

---

## 1. Method and limits of the research

- **Tools:**
  - Web search only, about 50 queries in Azerbaijani, Russian and English.
  - Direct page loads were blocked by the sandbox's network policy (google.com, yandex.com,
    2gis.az, instagram.com and the clinics' domains all returned 403 / DNS failure).
- **What "VERIFIED" means here:** a search result attributed the fact to the cited URL. It is a
  secondhand, snapshot-dated observation, not a page I opened.
- **Website checks:**
  - Done via `site:` index queries, search snippets and one third-party audit.
  - **Not measured:** load speed, mobile layout, broken pages.
  - **Before pitching:** open each site on your own phone.
- **Popularity:** no Google Maps rating could be read directly. Popularity evidence is Instagram
  size, Facebook recommendation scores, a third-party Google rating (Dental Club) and listing frequency.
- **No facts were invented.** Conflicting sources are flagged as conflicts. Unknowns are `[TO CONFIRM]`.
- Raw notes with every source: [`research/RESEARCH-NOTES.md`](research/RESEARCH-NOTES.md).

---

## 2. The three clinics

### 2.1 Dent Star Stomatoloji Klinika (Yasamal): strongest lead

**Why chosen (popular):**
- Instagram [@dentstar.az](https://www.instagram.com/dentstar.az/) showed about **55K followers and 1,308 posts** in one search snapshot. A re-check did not reproduce the number, so treat it as approximate.
- It is open **24/7** ([2GIS](https://2gis.az/baku/firm/70000001038903125), [Facebook page "…24 saat"](https://www.facebook.com/p/Stomatoloq-Dent-Star-Stomatoloji-klinika-24-saat-Tel-994124338217-100063614921919/)).
- It has operated since 2013 by its own account ([blog](https://dentstaraz.wordpress.com/haqqimizda/)).
- Facebook shows **96% recommend (21 reviews)**.
- It is listed on 2GIS, [GoMap](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/9ec80bc1f2ca40fa93f2444f0c85c003), [Navigator.az](https://navigator.az/az/firm/23576) and [FED.az](https://fed.az/az/saglamliq/bakinin-stomatoloji-klinikalarinda-xidmetler-qiymetler-30001).

**What's wrong with its online presence:**
- **No website of its own.** `site:dentstar.az` returns no indexed pages. The only site is a free
  WordPress.com blog ([dentstaraz.wordpress.com](https://dentstaraz.wordpress.com/haqqimizda/))
  with 2020-era posts.
- **No online booking.** Booking is by phone or WhatsApp only.
- **Conflicting address online.** Zaur Kərimov **424** (2GIS, GoMap) vs **218** (own blog, Navigator.az).
- **Thin map reviews.** [2GIS](https://2gis.az/ru/baku/firm/70000001038903125) shows 3/5 from 2 reviews. No Google rating found.

### 2.2 White Estetic Dental (Xətai)

**Why chosen (popular):**
- It has a very active Instagram, [@white_estetic_dental](https://www.instagram.com/white_estetic_dental/) (**about 6.9K followers, 2,475 posts**).
- Facebook shows [90% recommend (12 reviews)](https://www.facebook.com/WHITE-Estetic-Dental-1140928469278792/).
- It is listed on [Navigator.az](https://navigator.az/az/firm/24499/white-estetic-dental), [2GIS](https://2gis.az/baku/firm/70000001037035192) and YouTube.
- It appears on the [Ministry of Labour and Social Protection partner list](https://sosial.gov.az/nazirlik/sosial-terefdas/klinikalar).
- *Popularity is moderate, the weakest of the three on that criterion.*

**What's wrong with its online presence:**
- **No website at all**, and no online booking.
- **Two addresses in circulation:**
  - Afiyəddin Cəlilov **82A**: Navigator.az, 2GIS, Ministry list.
  - Afiyəddin Cəlilov **20**: [Waze](https://www.waze.com/live-map/directions/white-esthetic-dental-afiyeddin-celilov-20-baki?to=place.w.32702868.326832070.9110111), [YouTube](https://www.youtube.com/watch?v=qPTLnAiR4D4).
- **Almost no map reviews.** 2GIS shows 1 to 4 ratings.

### 2.3 Dental Club (Nərimanov): a different gap type, "has a site, but it doesn't convert"

**Why chosen (popular):**
- It has operated **since 2003** ([own site](https://dentalclub.az/en/about)).
- **Google 4.7 from 29 reviews** (as of 2026-09-29), per a third-party audit, [azerbaijandentalrating.com](https://azerbaijandentalrating.com/clinics/dental-club-baku/).
- It is listed on [2GIS](https://2gis.az/baku/firm/70000001041082928), GoMap, two Yandex Maps cards, Metbuat and FED.az.

**What's wrong with its online presence:**
- **Online booking reportedly disabled.** Per the same audit, the booking button on dentalclub.az
  is switched off and only a static contact form remains. No WhatsApp link was found on the site.
  *Not re-tested by me, so check it on your phone before the pitch.*
- **Conflicting addresses:** 116b (2GIS) vs 24 / 114 (directories) vs "Bakıxanov 758/759" (site contact page snippet).
- **Conflicting hours:** 10:00–18:00 on the site vs until 20:00 on 2GIS.

### Alternates (if a pick doesn't pan out)

- **Dental Klinik** ([@dental__klinika](https://www.instagram.com/dental__klinika/), near Nəriman Nərimanov metro):
  - About 28K followers, no website, no map listing found.
  - Its identity and street address are not confirmed, and the follower-to-post ratio is unusual. Qualify it by phone first.
- **EN Dent** (Xaqani 76c):
  - No site or Instagram found.
  - [Facebook](https://www.facebook.com/EnDentClinic/) shows 92% recommend from 26 reviews.
- **Avoid Baku Dent:**
  - A "BakuDent" clinic was reported fined 6,000 AZN for unlicensed surgical dentistry ([redaktor.az](https://redaktor.az/news/actual/277614-bakudent-klinikasi)).

---

## 3. Every field per clinic: VERIFIED vs PLACEHOLDER

Generated from the clinic files with `npm run report:fields`, so this table and the sites can't
drift apart. Numbers in the last column link to sources.

#### Dent Star (`/dent-star`)

| Field | Value on the demo site | Status | Source(s) / note |
|---|---|---|---|
| Name | Dent Star | **VERIFIED** | [1](https://2gis.az/baku/firm/70000001038903125) [2](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/9ec80bc1f2ca40fa93f2444f0c85c003) |
| Address | 424 Zaur Karimov St, 4th floor, Yasamal, Baku AZ1012 | **VERIFIED, sources conflict → confirm** | [1](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/9ec80bc1f2ca40fa93f2444f0c85c003) [2](https://2gis.az/ru/baku/firm/70000001038903125) [3](https://dentstaraz.wordpress.com/haqqimizda/) — GoMap and 2GIS say Zaur Kərimov 424 (2GIS RU adds 4th floor); the clinic's 2020-era blog and Navigator.az say 218. Confirm. |
| District | Yasamal district | **VERIFIED** | [1](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/9ec80bc1f2ca40fa93f2444f0c85c003) |
| Phones | (+994 12) 433-82-17, (+994 51) 302-82-37 | **VERIFIED** | [1](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/9ec80bc1f2ca40fa93f2444f0c85c003) [2](https://www.facebook.com/p/Stomatoloq-Dent-Star-Stomatoloji-klinika-24-saat-Tel-994124338217-100063614921919/) |
| WhatsApp | 994513028237 | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/dentstar.az/) — Instagram bio lists 051-302-82-37 for WhatsApp (one search snapshot; same number as the GoMap mobile). |
| Instagram | @dentstar.az | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/dentstar.az/) — About 55K followers, 1,308 posts in one search snapshot; a re-check did not reproduce the count. |
| Website | none found | **VERIFIED** | [1](https://dentstaraz.wordpress.com/haqqimizda/) — No own website indexed (site:dentstar.az returned nothing). Only a free WordPress.com blog with 2020-era posts. |
| Opening hours | mon–sun 00:00–24:00 | **VERIFIED** | [1](https://2gis.az/baku/firm/70000001038903125) [2](https://dentstaraz.wordpress.com/haqqimizda/) — 24/7 per 2GIS, the Facebook page name and the clinic's blog. Online form offers 09:00–21:00 slots (our design choice). |
| Services | Consultation; 3D dental CT scan; Panoramic X-ray (OPG); Dental implants; Orthodontics; Prosthodontics; Oral surgery; Periodontics (gums); Pediatric dentistry | **VERIFIED** | [1](https://2gis.az/baku/firm/70000001038903125) |
| Prices | Consultation: Free; 3D dental CT scan: [TO CONFIRM]; Panoramic X-ray (OPG): [TO CONFIRM]; Dental implants: [TO CONFIRM]; Orthodontics: [TO CONFIRM]; Prosthodontics: [TO CONFIRM]; Oral surgery: [TO CONFIRM]; Periodontics (gums): [TO CONFIRM]; Pediatric dentistry: [TO CONFIRM] | **PLACEHOLDER** | [1](https://dentstaraz.wordpress.com/2020/03/09/dent-star-rentgen-m%C9%99rk%C9%99zind%C9%99-asagidaki-radioji-xidm%C9%99tl%C9%99r-gost%C9%99rilir/) — Only free consultation is verified. A 2020 blog post lists X-ray prices (3D 60 AZN, 3D one jaw 40, panoramic 20, cephalometric 25); not shown because they are 6 years old. |
| Doctors | [TO CONFIRM], [TO CONFIRM], [TO CONFIRM] | **PLACEHOLDER** | No doctor names found. |
| Rating | 96% recommend on Facebook (21), as of 2026-10 (search snapshot) | **VERIFIED** | [1](https://www.facebook.com/p/Stomatoloq-Dent-Star-Stomatoloji-klinika-24-saat-Tel-994124338217-100063614921919/) [2](https://2gis.az/ru/baku/firm/70000001038903125) — Facebook 96% recommend (21 reviews). 2GIS shows 3/5 from 2 reviews (not displayed). Google and Yandex not found. |
| Founded | (see note) | **VERIFIED (clinic's own claim)** | [1](https://dentstaraz.wordpress.com/haqqimizda/) — Since 2013, per the clinic's own blog. |
| Map link | Google Maps search: "Dent Star stomatoloji klinika, Zaur Kərimov küçəsi 424, Bakı" | **DERIVED from verified data** | Google Maps search query built from the address; no verified Google Maps place link found. |
| Brand colour | #1f5fbf | **OUR DESIGN CHOICE** | Neutral colour chosen by us; the clinic logo was not used. |
| Photos / logo | neutral placeholder illustrations | **PLACEHOLDER** | Neutral illustrations only; no clinic photos or logos copied. |
| Reviews | labelled sample placeholders | **PLACEHOLDER** | Clearly labelled sample reviews; no real names. |


#### White Estetic Dental (`/white-estetic-dental`)

| Field | Value on the demo site | Status | Source(s) / note |
|---|---|---|---|
| Name | White Estetic Dental | **VERIFIED** | [1](https://navigator.az/az/firm/24499/white-estetic-dental) [2](https://2gis.az/baku/firm/70000001037035192) [3](https://sosial.gov.az/nazirlik/sosial-terefdas/klinikalar) |
| Address | 82A Afiyaddin Jalilov St, 1st floor, Khatai, Baku | **VERIFIED, sources conflict → confirm** | [1](https://navigator.az/az/firm/24499/white-estetic-dental) [2](https://2gis.az/baku/firm/70000001037035192) [3](https://www.waze.com/live-map/directions/white-esthetic-dental-afiyeddin-celilov-20-baki?to=place.w.32702868.326832070.9110111) — Navigator.az, 2GIS and the Ministry list say Afiyəddin Cəlilov 82A; Waze, a YouTube video and a dentist's site say number 20 (next to Megafun). Confirm. |
| District | Khatai district | **VERIFIED** | [1](https://navigator.az/az/firm/24499/white-estetic-dental) |
| Phones | (+994 12) 496-77-71, (+994 12) 496-77-72, (+994 51) 290-66-11 | **VERIFIED** | [1](https://navigator.az/az/firm/24499/white-estetic-dental) [2](https://sosial.gov.az/nazirlik/sosial-terefdas/klinikalar) — Landlines from Navigator.az; mobile +994 51 290 66 11 from the Ministry list (+994 51 290 66 17 also listed there). |
| WhatsApp | [TO CONFIRM] | **PLACEHOLDER** | No WhatsApp number found. |
| Instagram | @white_estetic_dental | **VERIFIED** | [1](https://www.instagram.com/white_estetic_dental/) — About 6.9K followers, 2,475 posts; bio hours 09:00–21:00. The link between the handle and the clinic is inferred from matching name and hours. |
| Website | none found | **VERIFIED** | No website found in any search. |
| Opening hours | mon–sat 09:00–21:00, sun [TO CONFIRM] | **VERIFIED** | [1](https://navigator.az/az/firm/24499/white-estetic-dental) [2](https://www.instagram.com/white_estetic_dental/) — Monday to Saturday 09:00–21:00. Sunday not stated → shown as [TO CONFIRM] and not bookable online. |
| Services | Check-up & consultation (placeholder); Teeth whitening; Dental implants; Pediatric dentistry | **VERIFIED** | [1](https://navigator.az/az/firm/24499/white-estetic-dental) [2](https://2gis.az/baku/firm/70000001037035192) — Whitening (Navigator.az category); implantology and pediatric dentistry (2GIS). 'Check-up & consultation' is a placeholder. |
| Prices | Check-up & consultation: [TO CONFIRM]; Teeth whitening: [TO CONFIRM]; Dental implants: [TO CONFIRM]; Pediatric dentistry: [TO CONFIRM] | **PLACEHOLDER** | No prices found. |
| Doctors | [TO CONFIRM], [TO CONFIRM], [TO CONFIRM] | **PLACEHOLDER** | No doctor names found. |
| Rating | 90% recommend on Facebook (12), as of 2026-10 (search snapshot) | **VERIFIED** | [1](https://www.facebook.com/WHITE-Estetic-Dental-1140928469278792/) [2](https://2gis.az/baku/firm/70000001037035192) — Facebook 90% recommend (12 reviews). 2GIS shows 1 review on the main card, 5/5 from 4 ratings in another view (not displayed). |
| Social programme | (see note) | **VERIFIED but dated → confirm** | [1](https://sosial.gov.az/nazirlik/sosial-terefdas/klinikalar) — 9% discount listed; date of the list unknown. |
| Map link | Google Maps search: "White Estetic Dental, Afiyəddin Cəlilov küçəsi 82A, Bakı" | **DERIVED from verified data** | Google Maps search query built from the address; no verified Google Maps place link found. |
| Brand colour | #0d7d77 | **OUR DESIGN CHOICE** | Neutral colour chosen by us; the clinic logo was not used. |
| Photos / logo | neutral placeholder illustrations | **PLACEHOLDER** | Neutral illustrations only; no clinic photos or logos copied. |
| Reviews | labelled sample placeholders | **PLACEHOLDER** | Clearly labelled sample reviews; no real names. |

#### Dental Club (`/dental-club`)

| Field | Value on the demo site | Status | Source(s) / note |
|---|---|---|---|
| Name | Dental Club | **VERIFIED** | [1](https://dentalclub.az/en/about) [2](https://2gis.az/baku/firm/70000001041082928) |
| Address | 116b Jeyhun Hajibeyli St, 1st floor, Narimanov, Baku | **VERIFIED, sources conflict → confirm** | [1](https://2gis.az/baku/firm/70000001041082928) [2](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/ee9f1fce8f1c470a8a638a5e35a618d1) [3](https://dentalclub.az/az/contact) — 2GIS: Ceyhunbəy Hacıbəyli 116b, 1st floor. Other listings give 24 or 114; the site's contact page reportedly shows 'Bakıxanov küç. 758/759'. Confirm. |
| District | Narimanov district | **VERIFIED** | [1](https://2gis.az/baku/firm/70000001041082928) |
| Phones | (+994 12) 541-04-46, (+994 50) 379-28-40 | **VERIFIED** | [1](https://dentalclub.az/az/contact) [2](https://azerbaijandentalrating.com/clinics/dental-club-baku/) — Landline appears on the site and in directories. Directories also list +994 70 379-28-40 and +994 50 344-88-74 (not shown). |
| WhatsApp | [TO CONFIRM] | **PLACEHOLDER** | [1](https://azerbaijandentalrating.com/clinics/dental-club-baku/) — The third-party audit found no WhatsApp link on the site; 2GIS shows a WhatsApp button but no number was visible. |
| Instagram | [TO CONFIRM] | **PLACEHOLDER** | The site links to Instagram but the handle was not found. |
| Website | https://dentalclub.az | **VERIFIED** | [1](https://dentalclub.az/az) [2](https://azerbaijandentalrating.com/clinics/dental-club-baku/) — Site exists; per the third-party audit the online-booking button is disabled and only a static contact form remains. Not re-tested (direct page loads blocked). |
| Opening hours | mon–sat 10:00–18:00, sun [TO CONFIRM] | **VERIFIED, sources conflict → confirm** | [1](https://dentalclub.az/az/contact) [2](https://2gis.az/baku/firm/70000001041082928) — Site: Monday to Saturday 10:00–18:00 (shown). 2GIS: until 20:00 on at least one day. Sunday not stated. |
| Services | Check-up & consultation (placeholder); Digital implants (self-reported); Clear aligners (brace-free orthodontics) (self-reported); Braces (outdated) | **VERIFIED (clinic's own claim)** | [1](https://dentalclub.az/en/about) [2](https://fed.az/az/saglamliq/bakinin-stomatoloji-klinikalarinda-xidmetler-qiymetler-30001) — Digital implants, surgical guides and aligners from the clinic's own site; braces from an old FED.az article. |
| Prices | Check-up & consultation: [TO CONFIRM]; Digital implants: [TO CONFIRM]; Clear aligners (brace-free orthodontics): [TO CONFIRM]; Braces: [TO CONFIRM] | **PLACEHOLDER** | [1](https://fed.az/az/saglamliq/bakinin-stomatoloji-klinikalarinda-xidmetler-qiymetler-30001) — An old FED.az article lists braces at 1800–4000 AZN; not shown because it is outdated. |
| Doctors | [TO CONFIRM], [TO CONFIRM], [TO CONFIRM] | **PLACEHOLDER** | [1](https://dentalclub.az/az/doctors) — The site has a doctors page, but names were not visible in the search results. |
| Rating | 4.7 ★ on Google (29), as of 2026-09-29 (via azerbaijandentalrating.com) | **VERIFIED** | [1](https://azerbaijandentalrating.com/clinics/dental-club-baku/) — Google 4.7 from 29 reviews as of 2026-09-29, reported by a third-party rating site (not read from Google directly). |
| Founded | (see note) | **VERIFIED (clinic's own claim)** | [1](https://dentalclub.az/en/about) — Since 2003, per the clinic's own website. |
| Map link | Google Maps search: "Dental Club stomatoloji klinika, Ceyhun Hacıbəyli küçəsi 116b, Bakı" | **DERIVED from verified data** | Google Maps search query built from the address; no verified Google Maps place link found. |
| Brand colour | #5b4fc4 | **OUR DESIGN CHOICE** | Neutral colour chosen by us; the clinic logo was not used. |
| Photos / logo | neutral placeholder illustrations | **PLACEHOLDER** | Neutral illustrations only; no clinic photos or logos copied. |
| Reviews | labelled sample placeholders | **PLACEHOLDER** | Clearly labelled sample reviews; no real names. |


**Summary of what is still placeholder for all three:**
- Prices, except Dent Star's free consultation.
- Doctor names.
- Photos and logos (neutral art used on purpose).
- Reviews (labelled samples).
- WhatsApp numbers for White Estetic and Dental Club.
- Sunday hours for White Estetic and Dental Club.

---

## 4. What was built

### Template (Phase 2)

- **Stack:** Next.js 16 (App Router), Tailwind CSS 4, TypeScript. Self-hosted Inter font. Clinic pages are statically prerendered.
- **One JSON file per clinic** (`clinics/<slug>.json`, validated with zod).
  - Adding a clinic means adding one file; `clinics/_template.json` is the starter.
  - Each file carries **per-field provenance** (status, sources, note).
- **Routes:**
  - `/<slug>` (AZ, default), `/<slug>/ru`, `/<slug>/en`, with a language switcher.
  - `/<slug>/az` redirects to `/<slug>`.
- **Sections:**
  - Hero with a "Book appointment" call to action.
  - Services and prices.
  - Why choose us, built only from verified facts or features of the site itself.
  - Doctors.
  - Reviews: a clearly labelled **sample-reviews placeholder**; no names, no stars.
  - Booking form.
  - Google Maps embed and directions.
  - Opening hours, with today highlighted.
  - Footer.
- **Mobile-first:**
  - Floating WhatsApp button.
  - Sticky Call and Book bar on mobile, with `tel:` click-to-call.
  - Swipeable sample reviews.
- **Demo hygiene:**
  - `noindex` in three layers: meta tag, `X-Robots-Tag` header and `robots.txt` disallowing everything.
  - A small "Demo prepared for <Clinic>" banner (localized).
  - Footer note that it is not the official site.
  - Neutral self-made illustrations; no copied photos or logos.
- **Placeholders are visible:** anything unverified renders as an amber dashed `[TO CONFIRM]` chip.

### Automation (Phase 3)

- **Booking form:**
  - Fields: name, phone, service, preferred date and time, consent checkbox.
  - **No health fields.** The API strips any unknown keys.
  - Phone numbers are normalised to E.164, and Azerbaijani formats are understood.
  - Slots are offered only within opening hours, and past times today are refused.
  - A honeypot field catches bots, and requests are rate limited.
- **Storage adapter** (`BookingStore`):
  - **Supabase** for production; SQL schema with RLS in `supabase/schema.sql`.
  - **SQLite** for local use, via Node's built-in `node:sqlite`.
  - **In-memory** for zero-setup demos.
- **Telegram notifications:** instant "new booking" message to the clinic's chat.
  - Per-clinic chat ID via `TELEGRAM_CHAT_ID_<SLUG>`.
  - Never loses a booking if Telegram fails.
  - Every message, sent or simulated, appears in the dashboard's notification log.
- **Admin dashboard** at `/<slug>/admin`:
  - Login with a password from an env var. The session is a signed, per-clinic, httpOnly cookie; login is rate limited.
  - Stats: bookings this week, upcoming, awaiting confirmation, no-show rate over 30 days.
  - Status actions: confirm, cancel, mark no-show, reset.
  - Tomorrow's reminders, each with a one-tap WhatsApp button.
  - Manual "Run reminder job now" button.
  - Available in AZ, RU and EN.
- **Reminders:**
  - Vercel Cron runs daily at 18:00 Baku time.
  - It picks tomorrow's `new` and `confirmed` appointments, using the Baku date.
  - It sends staff a Telegram digest with **wa.me links pre-filled in AZ, RU or EN** (the patient's booking language).
  - It marks those bookings as reminded, so re-runs are idempotent.
- **Messaging adapter** (`MessagingProvider`):
  - `wa-link` is the default.
  - `whatsapp-cloud` (Meta WhatsApp Business Platform) is ready to plug in.
- **Tests:** 40 Vitest tests covering:
  - booking validation and creation;
  - "no health data stored";
  - the SQLite adapter;
  - Baku-timezone reminder selection, including midnight and year rollover;
  - idempotent reminder runs;
  - the WhatsApp API adapter;
  - stats;
  - validation of every clinic file.

### What works in demo mode (no keys at all)

Everything a clinic owner sees works on a phone:
- all three sites in three languages;
- booking, which shows up in the dashboard;
- seeded fictional patients, marked "(demo)";
- stats;
- status changes;
- tomorrow's reminder list with working wa.me links;
- the reminder job (button or cron URL);
- the notification log showing exactly what Telegram would receive.

Optional demo extras:
- **`DEMO_WHATSAPP_NUMBER`** routes all WhatsApp links to *your* phone.
- **A Telegram bot token** shows real notifications live.

### What needs real API keys or accounts

| Capability | Needs |
|---|---|
| Real Telegram delivery | `TELEGRAM_BOT_TOKEN` + chat ID per clinic |
| Persistent bookings on Vercel | Supabase project (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) |
| Fully automatic WhatsApp reminders | Meta Business verification, WhatsApp Business Platform number, approved template, `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` |
| Production security | `DEMO_MODE=false`, `ADMIN_PASSWORD_<SLUG>`, `CRON_SECRET` |

### How it was verified

- `next build` succeeds: 3 clinics × 3 languages are prerendered.
- `tsc` is clean, and 40 out of 40 tests pass.
- curl checks:
  - The booking API answers 201, 422, 404 and 400 for valid, invalid, unknown-clinic and bad-JSON requests.
  - The cron route works and is idempotent.
  - noindex headers and `robots.txt` are served.
  - `/<slug>/az` redirects.
- **Headless Chromium at iPhone size, end to end:**
  1. Picked a service from a card, which pre-selects it in the form.
  2. Submitted without consent, and the error showed.
  3. Booked successfully.
  4. Picked a closed or unknown Sunday, and the notice showed.
  5. Logged into admin with a wrong password (error shown), then with `demo`.
  6. Confirmed the booking, then ran reminders. wa.me links and the notification log appeared.
  7. Confirmed that sessions are per clinic.
- No page errors.
- The SQLite store was also exercised inside the running Next server.

**Not verified:**
- The Supabase adapter and the WhatsApp Cloud adapter against live accounts (no credentials, no network).
- The Google Maps embed (google.com was blocked in the sandbox, so only the URL is generated).
- Real-device performance (Lighthouse not run).

---

## 5. Sales talking points (3 per clinic)

> Lead with what you found and offer to fix it; don't lecture. Re-check each point the day
> before; these are search-based observations.

### Dent Star
1. **"You're open 24/7, but the internet doesn't know it."**
   - Someone searching *"stomatoloq 24 saat"* at 2am has no Dent Star website to land on: dentstar.az isn't indexed.
   - The only web result is a 2020 blog with an older address (218 vs 424).
   - The demo gives you one fast, correct page with click-to-call and directions.
2. **"Your Instagram brings the demand; booking is the bottleneck."**
   - Right now every appointment is a call or a WhatsApp chat.
   - The demo takes requests around the clock, alerts your admins in Telegram instantly, and
     prepares next-day WhatsApp reminders in one tap. Day-before reminders are the standard way clinics reduce no-shows.
3. **"Turn followers into reviews."**
   - In the snapshot I saw, roughly 55K people follow you, yet 2GIS shows only 2 reviews and I found no Google rating.
   - The same booking system can send a review link after each visit (next step), so your reputation shows up where new patients search.

### White Estetic Dental
1. **"Patients who find you on Instagram have nowhere to go."**
   - You post constantly (2,475 posts), but there's no website for prices, hours or booking.
   - Two different addresses (82A and 20 Afiyəddin Cəlilov) are online, so some patients may go to the wrong door.
   - One official page with a map fixes both.
2. **"You're open till 21:00. Let people book after work, not just call."**
   - Late hours are your edge with working patients.
   - Online booking lets them request a slot at any hour, and your admin gets it instantly in Telegram.
3. **"Show the trust signals you already have."**
   - You're on the Ministry's social-partner list (9% discount) and Facebook shows 90% recommend.
   - Today nobody sees that. The site puts it up front in Azerbaijani, Russian and English, once you confirm it's current.

### Dental Club
1. **"Your website has a booking button that doesn't book."**
   - With over 20 years in practice and a 4.7 Google rating, visitors already trust you.
   - But the online booking on dentalclub.az is reportedly switched off, and there's no WhatsApp link.
   - The demo turns that traffic into appointments, with instant staff alerts.
2. **"Four addresses, two sets of hours."**
   - Your site, 2GIS and directories disagree (116b / 24 / 114 / Bakıxanov; 18:00 vs 20:00).
   - Patients lose trust, or time.
   - A single source of truth with an embedded map, kept in one file, fixes it in an afternoon.
3. **"High-value treatments deserve a high-conversion page."**
   - Digital implants and aligners are researched on phones, often in Russian or English too.
   - The demo is trilingual and mobile-first, with WhatsApp one tap away, and reminders protect expensive chair time from no-shows.

---

## 6. Known limitations and suggested next steps

### Limitations

- **Research depth:**
  - Search-snippet verification only; no page was opened directly.
  - Website speed and mobile-friendliness were not measured.
  - Dent Star's follower count is from a single snapshot.
  - Dental Club's "booking disabled" comes from a third-party audit.
- **Memory storage on Vercel is per instance.** In a long demo a booking can be missing from the
  dashboard if requests hit different instances. Connect Supabase (free tier) for a reliable demo.
- **Per-instance state:**
  - The notification log and rate limits live in memory, per server instance.
  - Use a shared store (e.g. Upstash) if a clinic gets real traffic.
- **Admin access:**
  - One password per clinic; no individual staff accounts or audit log.
  - Booking requests are *requests*: staff confirm the time by phone. There is no live
    availability calendar or double-booking prevention yet.
- **WhatsApp:**
  - The Cloud API adapter is written to Meta's documented request format but is untested against a live account.
  - Meta also requires business verification and approved templates.
- **Prices, doctors, photos and reviews** must come from each clinic. The demo intentionally shows placeholders.
- **Legal:**
  - The consent checkbox is in place, but there is no privacy-policy page yet.
  - Have the consent text and a privacy notice reviewed against Azerbaijan's personal-data rules before going live.

### Next steps

1. **Before contacting:**
   - Call or visit to confirm address, hours, WhatsApp number and services.
   - Open each clinic's current site and Instagram on your phone to re-confirm the gaps.
   - Update the JSON files; the `[TO CONFIRM]` chips disappear as you fill them in.
2. **Deploy the demo:**
   - Vercel with `DEMO_MODE=true`, `NEXT_PUBLIC_AGENCY_NAME`, `DEMO_WHATSAPP_NUMBER` (yours), a Telegram bot and `HIDE_DEMO_INDEX=true`.
   - Optionally Supabase, for reliable data.
3. **Pitch:** send each clinic only its own link. On a call, book live from your phone so the owner sees the Telegram alert and the reminder flow.
4. **When a clinic signs:**
   - Their real photos, prices and doctors.
   - Remove the noindex layers and demo banner (see README).
   - A custom domain.
   - `DEMO_MODE=false` with real secrets.
   - Supabase.
   - A privacy page.
   - A Google Business Profile clean-up (one address, correct hours).
5. **Upsells:**
   - Review-request messages after visits.
   - WhatsApp Business API automation.
   - A simple availability calendar.
   - Monthly no-show and booking reports.
