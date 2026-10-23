# Sales demo report: aesthetic and vet clinics in Baku

Prepared 2026-10-22 · Branch `claude/ecstatic-meitner-l1jorw` · Companion to [REPORT.md](REPORT.md) (dental)

## TL;DR

- **The template is now multi-niche.** Each niche is one config file (`niches/dental.json`,
  `aesthetic.json`, `vet.json`) that sets the theme, sections, service categories, booking fields,
  wording and reminder rules. Each business file declares its niche. A new niche is a config file
  plus business files, with no code.
- **The dental sites are unchanged.** Screenshots of all three dental sites (AZ/RU/EN, mobile and
  desktop: 18 pages) are pixel-identical to `main`. All 60 original tests pass; one assertion was
  narrowed so it checks the dental list instead of the total clinic count (see §3.5).
- **6 real Baku businesses found**, each with large Instagram reach and no website or online booking:
  - Aesthetic: **Ahu Estetik Klinika** (about 124K followers), **Aspera** (about 165K), **Miss Laser** (about 623K;
    borderline: it has a one-page site).
  - Vet: **Bona Vet Clinic** (about 21K), **Myvet Animal Clinic** (about 26K), **Tarvet** (about 17K).
- **Repeat-visit engine.** Dental 6-month check-up; aesthetic next course session (per treatment);
  vet annual vaccination and check-up, per pet. Staff get a Telegram digest and one-tap WhatsApp
  messages in AZ/RU, and the dashboard shows "patients due back". It works in demo mode with mock data.
- **117 tests pass**, the typecheck is clean and the production build succeeds.
- **Biggest caveat:** the popularity evidence is weaker than in the dental round. **No Google Maps
  rating could be retrieved for any of the six**, because only a search tool worked and Google Maps
  was unreachable. Popularity rests on Instagram size plus directory listings. **Check each Google
  listing by hand before you call.**

---

## 1. The six businesses: why chosen, current gaps, sources

Same rules as the dental round. Every fact below was seen in a search result attributed to the
cited URL. Pages could not be opened, so website quality was judged from search results only.
Full notes, including the rejected candidates: [research/RESEARCH-NOTES-niches.md](research/RESEARCH-NOTES-niches.md).

### Aesthetic

**1. Ahu Estetik Klinika (Xətai): strongest aesthetic lead** · demo `/ahu-estetik-klinika`

- **Why:**
  - About 124K Instagram followers and 5,660 posts ([instagram.com/ahuclinic](https://www.instagram.com/ahuclinic/)).
  - On the Labour Ministry's social-partner clinic list, with a 10% discount ([sosial.gov.az](https://www.sosial.gov.az/az/nazirlik/sosial-terefdas/klinikalar)).
  - Listed on gomap, Yandex, sosialterefdash and Facebook.
- **Gaps:**
  - **No website**: name and `ahuclinic.az` searches return only social media and directories.
  - **No online booking**: only a call-centre phone line.
  - **Messy listings**:
    - three street numbers (106 / 106A / 78);
    - three phone numbers;
    - conflicting hours (10–19 vs 09–18);
    - gomap files it under "furniture repair" ([gomap](https://kataloq.gomap.az/az/all-poi/service/repair-furniture/951ee94ed56611e0ad4900226424597d)).
  - Its only map rating is weak: Yandex 3.9 from 6 ([Yandex](https://yandex.com/maps/org/227164496627/)).

**2. Aspera (Aspera Tibb Mərkəzi / Aspera Estetik Klinika)** · demo `/aspera`

- **Why:** about 165K Instagram followers from only 430 posts ([instagram.com/asperaclinic](https://www.instagram.com/asperaclinic/)).
- **Gaps:**
  - **No website.** The contact email is a Gmail address ([Facebook](https://www.facebook.com/p/Aspera-Estetik-Klinika-100089033286864/)).
  - Booking is by phone or WhatsApp only.
  - **Name confusion.** Instagram says "Tibb Mərkəzi", Facebook and gomap say "Estetik Klinika", and an
    unrelated "Aspera Klinik" hospital exists nearby.
  - **Three addresses:** Rəfili 28 / Rəfili 27 / Sahib Zeynalov 72B ([gomap](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/f059ba6b9b0342aebc08a0f90172b620)).
  - Almost no public service information. The only treatment found is nose filler, from a 2023 post.
  - No reviews anywhere ("Not yet rated" on Facebook).

**3. Miss Laser (laser-epilation network; demo for the Elmlər branch): borderline** · demo `/miss-laser`

- **Why:**
  - About 623K followers on the Elmlər account alone, the largest of any Baku aesthetic business found
    ([instagram.com/miss_laser_elmler](https://www.instagram.com/miss_laser_elmler/)).
  - About six branches near metro stations ([misslaser.az](https://misslaser.az/)).
- **Gaps:**
  - The site appears to be **a single indexed page** (`site:misslaser.az` returns only the homepage).
  - **No online booking**: each branch takes bookings by phone or WhatsApp.
  - Branch addresses conflict across the site, Yandex and 2GIS.
  - The laser device is named differently on the site and on Instagram.
  - No reviews on Yandex.
- **Why borderline:** it has a website and is a laser-only chain, not a full clinic. It qualifies on
  "no online booking" only. I kept it because its reach is exceptional, the booking gap is real, and
  a branch-by-branch booking flow is an easy upsell.

### Vet

**4. Bona Vet Clinic (Yasamal)** · demo `/bona-vet-clinic`

- **Why:**
  - About 21K Instagram followers ([instagram.com/bonavetclinic](https://www.instagram.com/bonavetclinic/)).
  - Listed on 2GIS, Yellow Pages, Zooline (as both a clinic and a grooming salon) and Yelo.
- **Gaps:**
  - **No website, no online booking.** Contact is two landlines, a mobile and WhatsApp ([Facebook](https://www.facebook.com/BonaVetClinicBaku/)).
  - The Facebook page is barely used (14 likes).
  - Three house numbers across directories (14/17, 14, 31-33).
  - The Yelo partnership listing has expired.

**5. Myvet Animal Clinic (Dr. Suliddin)** · demo `/myvet`

- **Why:** the largest and most active vet Instagram found, about 26K followers and 3,454 posts
  ([instagram.com/baytarliq_klinikasi_](https://www.instagram.com/baytarliq_klinikasi_/)). Caveat:
  it follows about 7.7K accounts, so some growth may be follow-back.
- **Gaps:**
  - **No website, no booking, no published hours.**
  - The Instagram handle is the generic "baytarliq_klinikasi_" ("vet clinic"), not the brand name.
  - Two phone numbers and two house numbers across directories
    ([Cybo](https://telefon-kitab.cybo.com/AZ/m%C9%99rd%C9%99kan/baytarlar-v%C9%99-heyvan-klinikalar%C4%B1/?p=2), [2GIS](https://2gis.az/ru/baku/search/Veterinar)).
  - No ratings anywhere.

**6. Tarvet (Yasamal)** · demo `/tarvet`

- **Why:**
  - About 17K followers and 925 posts ([instagram.com/tarvet_clinic_](https://www.instagram.com/tarvet_clinic_/)).
  - Offers surgery, inpatient care, ultrasound, X-ray and blood tests, and is open daily 09:00–21:00
    ([2GIS](https://2gis.az/ru/baku/firm/70000001109504315)).
- **Gaps:**
  - **Only an Instagram account and one 2GIS card.** No website, no Facebook page, no other listings.
  - No booking; the 2GIS phone number is hidden behind a click.
  - An Azerbaijani-language search returns nothing.
  - Just 2 ratings on 2GIS.

**Why no "strong Google rating" evidence:** the dental round found Google ratings via third-party
sites; for these six, none surfaced. 2GIS and Yandex ratings in Baku are too sparse (0–13) to show
popularity. I did not swap in weaker businesses with a few more map ratings. Instead I picked by
Instagram reach and listings, and flagged it.

---

## 2. Every field per business: VERIFIED vs PLACEHOLDER

Generated from each file's `provenance` with `npm run report:fields`. Status legend:
**VERIFIED** (2+ sources agree) · **VERIFIED (single snapshot)** (one source) ·
**VERIFIED, sources conflict → confirm** (the value shown is the business's own channel, others in the note) ·
**VERIFIED but dated → confirm** · **DERIVED** · **OUR DESIGN CHOICE** · **PLACEHOLDER** (unknown;
shown on the site as an amber `[TO CONFIRM]` marker).

Template entries such as "Vaccination" at a vet whose services weren't published are **placeholders**:
each is badged `[TO CONFIRM]` on the page and listed here.

### Aesthetic

#### Ahu Estetik Klinika (`/ahu-estetik-klinika`)

| Field | Value on the demo site | Status | Source(s) / note |
|---|---|---|---|
| Name | Ahu Estetik Klinika | **VERIFIED** | [1](https://www.instagram.com/ahuclinic/) [2](https://sosialterefdash.az/en/ahu-estetik-klinika-1) [3](https://www.facebook.com/p/Ahu-Estetik-Klinika-100090745274641/) |
| Address | 106A Mahammad Hadi St, Khatai, Baku | **VERIFIED, sources conflict → confirm** | [1](https://www.instagram.com/ahuclinic/) [2](https://yandex.com/maps/org/227164496627/) [3](https://kataloq.gomap.az/az/all-poi/service/repair-furniture/951ee94ed56611e0ad4900226424597d) [4](https://www.sosial.gov.az/az/nazirlik/sosial-terefdas/klinikalar) — Shown: Məhəmməd Hadi 106A (Instagram bio and Yandex). gomap and sosial.gov.az say 106; another sosial.gov.az entry says 78; the Facebook page only says Baku-Baladshary. Confirm. |
| District | Khatai district | **VERIFIED** | [1](https://kataloq.gomap.az/az/all-poi/service/repair-furniture/951ee94ed56611e0ad4900226424597d) [2](https://www.sosial.gov.az/az/nazirlik/sosial-terefdas/klinikalar) |
| Phones | (+994 70) 530-50-81 | **VERIFIED** | [1](https://www.sosial.gov.az/az/nazirlik/sosial-terefdas/klinikalar) [2](https://www.instagram.com/ahuclinic/) — Call-centre line from the Instagram bio and the ministry list. Directories also show +994 50 680 70 07 (gomap) and +994 55 727 36 46 (Yandex) — single sources, not shown. |
| WhatsApp | [TO CONFIRM] | **PLACEHOLDER** | No WhatsApp number found. |
| Instagram | @ahuclinic | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/ahuclinic/) — About 124K followers, 5,660 posts (undated search snapshot). |
| Website | none found | **VERIFIED** | No website found: searches for the clinic name and ahuclinic.az return only Instagram, Facebook and directories. |
| Opening hours | mon–fri 10:00–19:00, sat–sun [TO CONFIRM] | **VERIFIED, sources conflict → confirm** | [1](https://www.instagram.com/ahuclinic/) [2](https://sosialterefdash.az/en/ahu-estetik-klinika-1) — Shown: weekdays 10:00–19:00 (Instagram). sosialterefdash says 09:00–18:00. Weekends not stated. |
| Services | Cosmetologist consultation [other] (placeholder); Laser hair removal [laser] (placeholder); Injectable treatments [injectables] (placeholder); Facial treatments [facial] (placeholder); Body treatments [body] (placeholder) | **PLACEHOLDER** | [1](https://kataloq.gomap.az/az/all-poi/service/repair-furniture/951ee94ed56611e0ad4900226424597d) [2](https://yandex.com/maps/org/227164496627/) [3](https://www.instagram.com/kosmetoloq.samira_musayeva/) — Only the category is known (cosmetology centre); a cosmetologist's own Instagram advertises 'all cosmetology procedures'. Treatment list is a template to confirm. |
| Prices | Cosmetologist consultation: [TO CONFIRM]; Laser hair removal: [TO CONFIRM]; Injectable treatments: [TO CONFIRM]; Facial treatments: [TO CONFIRM]; Body treatments: [TO CONFIRM] | **PLACEHOLDER** | [1](https://www.sosial.gov.az/az/nazirlik/sosial-terefdas/klinikalar) — No prices found; only a 10% social-partner discount. |
| Packages / courses | Course package: [TO CONFIRM] (placeholder) | **PLACEHOLDER** | No courses or packages found. |
| Course settings (reminders only) | Laser hair removal: 6 sessions, every 42 days | **OUR DESIGN CHOICE** | Course settings (sessions / days between sessions) are demo defaults that drive the next-session reminder; they are not shown on the site and must be set with the clinic. |
| Doctors | Samira Musayeva, [TO CONFIRM], [TO CONFIRM] | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/kosmetoloq.samira_musayeva/) — Samira Musayeva's own Instagram links her to Ahu. Other specialists unknown. |
| Rating | — | **VERIFIED (single snapshot)** | [1](https://yandex.com/maps/org/227164496627/) — Yandex 3.9 from 6 ratings — too few to show. No Google rating could be retrieved (Google Maps was unreachable from the research tools). |
| Map link | Google Maps search: "Ahu Estetik Klinika, Məhəmməd Hadi 106A, Bakı" | **DERIVED from verified data** | Search link built from the shown address. |
| Brand colour | #9a5b4f | **OUR DESIGN CHOICE** | Our choice; the clinic's logo and photos were not copied. |
| Photos / logo | neutral placeholder illustrations | **PLACEHOLDER** | Neutral illustrations; before/after pairs are placeholders until the clinic supplies consented photos. |
| Reviews | labelled sample placeholders | **PLACEHOLDER** | Labelled sample reviews; no reviews copied. |

#### Aspera Tibb Mərkəzi (`/aspera`)

| Field | Value on the demo site | Status | Source(s) / note |
|---|---|---|---|
| Name | Aspera Tibb Mərkəzi | **VERIFIED, sources conflict → confirm** | [1](https://www.instagram.com/asperaclinic/) [2](https://www.facebook.com/p/Aspera-Estetik-Klinika-100089033286864/) [3](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/f059ba6b9b0342aebc08a0f90172b620) — Shown: 'Aspera Tibb Mərkəzi' (current Instagram name, 'Sağlıq & Estetik'). Facebook and gomap use 'Aspera Estetik Klinika' — possibly a rebrand (our inference). Not the same as 'Aspera Klinik' hospital on Ceyhun Hacıbəyli 17A. Confirm. |
| Address | 28 Mikayil Rafili St, Baku | **VERIFIED, sources conflict → confirm** | [1](https://www.instagram.com/asperaclinic/) [2](https://www.facebook.com/p/Aspera-Estetik-Klinika-100089033286864/) [3](https://www.cybo.com/AZ/bak%C4%B1xanov/medical/?p=2) [4](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/f059ba6b9b0342aebc08a0f90172b620) — Shown: Mikayıl Rəfili 28 (Instagram). Facebook and Cybo say Rəfili 27; gomap says Sahib Zeynalov 72B, Nərimanov. Confirm. |
| District | [TO CONFIRM] | **PLACEHOLDER** | [1](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/f059ba6b9b0342aebc08a0f90172b620) — Nərimanov appears only with the gomap address (Sahib Zeynalov 72B); district for the Rəfili address not found. |
| Phones | (+994 70) 733-33-43 | **VERIFIED** | [1](https://www.instagram.com/asperaclinic/) [2](https://www.facebook.com/p/Aspera-Estetik-Klinika-100089033286864/) [3](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/f059ba6b9b0342aebc08a0f90172b620) [4](https://www.cybo.com/AZ/bak%C4%B1xanov/medical/?p=2) — gomap also lists +994 50 630 98 60 (single source, not shown). |
| WhatsApp | 994773898996 | **VERIFIED (single snapshot)** | [1](https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/f059ba6b9b0342aebc08a0f90172b620) |
| Instagram | @asperaclinic | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/asperaclinic/) — About 165K followers, 430 posts (undated search snapshot). |
| Website | none found | **VERIFIED** | No website found; the contact email is a Gmail address (asperaclinic@gmail.com, Facebook). |
| Opening hours | mon–sun [TO CONFIRM] | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/asperaclinic/) — Instagram gives 09:00–18:00 without days, so the table shows [TO CONFIRM] for each day; the booking form offers 09:00–18:00. |
| Services | Consultation [other] (placeholder); Nose filler (non-surgical rhinoplasty) [injectables] (outdated); Botox treatments [injectables] (verified-single); Laser treatments [laser] (placeholder); Facial treatments [facial] (placeholder); Body treatments [body] (placeholder) | **VERIFIED (single snapshot)** | [1](https://www.facebook.com/p/Aspera-Estetik-Klinika-100089033286864/) — Nose filler / non-surgical rhinoplasty: a 2023 Facebook post (marked dated). Botox: mentioned on the Facebook page. Laser, facial and body entries are template placeholders. |
| Prices | Consultation: [TO CONFIRM]; Nose filler (non-surgical rhinoplasty): [TO CONFIRM]; Botox treatments: [TO CONFIRM]; Laser treatments: [TO CONFIRM]; Facial treatments: [TO CONFIRM]; Body treatments: [TO CONFIRM] | **PLACEHOLDER** | [1](https://www.facebook.com/p/Aspera-Estetik-Klinika-100089033286864/) — The 2023 post mentions nose-filler pricing but no amount was visible. |
| Packages / courses | Course package: [TO CONFIRM] (placeholder) | **PLACEHOLDER** | No courses or packages found. |
| Course settings (reminders only) | Laser treatments: 6 sessions, every 42 days | **OUR DESIGN CHOICE** | Course settings (sessions / days between sessions) are demo defaults that drive the next-session reminder; they are not shown on the site and must be set with the clinic. |
| Doctors | [TO CONFIRM], [TO CONFIRM], [TO CONFIRM] | **PLACEHOLDER** | No specialists named in any source. |
| Rating | — | **VERIFIED (single snapshot)** | [1](https://www.facebook.com/p/Aspera-Estetik-Klinika-100089033286864/) — Facebook: 'Not yet rated (0 reviews)'. No Google, Yandex or 2GIS rating found for this business. |
| Map link | Google Maps search: "Aspera, Mikayıl Rəfili 28, Bakı" | **DERIVED from verified data** | Search link built from the shown address. |
| Brand colour | #6f5a86 | **OUR DESIGN CHOICE** | Our choice; the clinic's logo and photos were not copied. |
| Photos / logo | neutral placeholder illustrations | **PLACEHOLDER** | Neutral illustrations; before/after pairs are placeholders until the clinic supplies consented photos. |
| Reviews | labelled sample placeholders | **PLACEHOLDER** | Labelled sample reviews; no reviews copied. |

#### Miss Laser (`/miss-laser`)

| Field | Value on the demo site | Status | Source(s) / note |
|---|---|---|---|
| Name | Miss Laser | **VERIFIED** | [1](https://misslaser.az/) [2](https://www.instagram.com/miss_laser_elmler/) [3](https://yandex.com/maps/org/miss_lazer/231431490560/) [4](https://www.facebook.com/misslaserbaku/) |
| Address | Huseyn Javid Ave, block 556/571, entrance 2, flat 6 (opposite Elmlar Akademiyasi metro), Baku | **VERIFIED, sources conflict → confirm** | [1](https://misslaser.az/) [2](https://yandex.com/maps/org/miss_lazer/231431490560/) [3](https://2gis.az/baku/search/Laser) — Shown: the Elmlər address from misslaser.az. Yandex lists Hüseyn Cavid 149A; 2GIS also lists Həsən bəy Zərdabi 31-53 ('2 filial'). The site lists about six branches; this demo covers Elmlər only. Confirm. |
| District | Elmlar Akademiyasi metro | **VERIFIED (single snapshot)** | [1](https://misslaser.az/) |
| Phones | (+994 50) 975-02-09 | **VERIFIED** | [1](https://misslaser.az/) [2](https://www.instagram.com/miss_laser_elmler/) — Elmlər branch number. General lines on the site: +994 50 560 86 82, +994 12 598 51 95 (not shown). |
| WhatsApp | 994509750209 | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/miss_laser_elmler/) — WhatsApp contact given in an Instagram post. |
| Instagram | @miss_laser_elmler | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/miss_laser_elmler/) — About 623K followers, 3,389 posts (undated search snapshot). Other branches may have their own accounts. |
| Website | https://misslaser.az/ | **VERIFIED (single snapshot)** | [1](https://misslaser.az/) — misslaser.az exists; a site: search returned only the homepage (single-page site) and no online booking. Speed and mobile layout not tested. |
| Opening hours | mon–sun [TO CONFIRM] | **VERIFIED, sources conflict → confirm** | [1](https://www.instagram.com/miss_laser_elmler/) [2](https://yandex.com/maps/org/miss_lazer/231431490560/) — Instagram: 09:00–22:00 (days not stated); Yandex showed 'closed until 10:00'. Table shows [TO CONFIRM]; booking offers 10:00–22:00. |
| Services | Laser hair removal (alexandrite laser) [laser] (verified-single); Correction session [laser] (verified-single); Consultation [other] (placeholder) | **VERIFIED (single snapshot)** | [1](https://misslaser.az/) [2](https://www.instagram.com/miss_laser_elmler/) — Laser hair removal only. Device named 'CANDELA GentleLase Pro' on the site and 'Alexandrite Candela Pro U' on Instagram. Free correction session: Instagram. |
| Prices | Laser hair removal (alexandrite laser): [TO CONFIRM]; Correction session: Free; Consultation: [TO CONFIRM] | **PLACEHOLDER** | [1](https://www.instagram.com/miss_laser_elmler/) — An undated Instagram post mentions 'whole body + face 25 AZN' — unit and date unclear, so not shown. |
| Packages / courses | One-year package: 250 AZN (outdated) | **VERIFIED but dated → confirm** | [1](https://misslaser.az/) — One-year package for 250 AZN, limited availability — undated homepage offer; confirm it is current. |
| Course settings (reminders only) | Laser hair removal (alexandrite laser): 6 sessions, every 42 days | **OUR DESIGN CHOICE** | Course settings (sessions / days between sessions) are demo defaults that drive the next-session reminder; they are not shown on the site and must be set with the clinic. |
| Doctors | Dr. Məlahət, [TO CONFIRM], [TO CONFIRM] | **VERIFIED (single snapshot)** | [1](https://misslaser.az/) [2](https://www.instagram.com/miss_laser_elmler/) — Dr. Məlahət leads the laser-epilation seminars; whether she sees clients at the Elmlər branch is not confirmed. |
| Rating | — | **VERIFIED (single snapshot)** | [1](https://yandex.com/maps/org/miss_lazer/231431490560/) — Yandex: no reviews. No Google rating could be retrieved. |
| Map link | Google Maps search: "Miss Laser, Hüseyn Cavid prospekti, Elmlər Akademiyası, Bakı" | **DERIVED from verified data** | Search link built from the shown address. |
| Brand colour | #a34a6b | **OUR DESIGN CHOICE** | Our choice; the studio's logo and photos were not copied. |
| Photos / logo | neutral placeholder illustrations | **PLACEHOLDER** | Neutral illustrations; before/after pairs are placeholders until the studio supplies consented photos. |
| Reviews | labelled sample placeholders | **PLACEHOLDER** | Labelled sample reviews; no reviews copied. |

### Vet

#### Bona Vet Clinic (`/bona-vet-clinic`)

| Field | Value on the demo site | Status | Source(s) / note |
|---|---|---|---|
| Name | Bona Vet Clinic | **VERIFIED** | [1](https://www.facebook.com/BonaVetClinicBaku/) [2](https://www.yelo.az/en/individuals/cashback/baytarliq-klinikalari-ve-zoo-magazalari/bona-vet-clinic/) |
| Address | 14/17 Mikayil Mushfig St, Yasamal, Baku | **VERIFIED, sources conflict → confirm** | [1](https://yellowpages.az/Az/category/veterinary_service/) [2](https://zooline.az/az/baytarliq-klinikalari) [3](https://www.yelo.az/en/individuals/cashback/baytarliq-klinikalari-ve-zoo-magazalari/bona-vet-clinic/) [4](https://2gis.az/baku/search/Veet) — Shown: Mikayıl Müşfiq 14/17 (Yellow Pages, Zooline). Yelo says 14; 2GIS says 31-33. Confirm. |
| District | Yasamal district | **VERIFIED (single snapshot)** | [1](https://www.yelo.az/en/individuals/cashback/baytarliq-klinikalari-ve-zoo-magazalari/bona-vet-clinic/) |
| Phones | (+994 12) 510-11-85, (+994 12) 510-11-86, (+994 50) 225-92-29 | **VERIFIED** | [1](https://www.facebook.com/BonaVetClinicBaku/) [2](https://yellowpages.az/Az/category/veterinary_service/) |
| WhatsApp | 994772259229 | **VERIFIED (single snapshot)** | [1](https://www.facebook.com/BonaVetClinicBaku/) |
| Instagram | @bonavetclinic | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/bonavetclinic/) — About 21K followers, 326 posts (undated search snapshot). |
| Website | none found | **VERIFIED** | No website found; a bonavet.az search returned only unrelated clinics abroad. |
| Opening hours | mon–sun 10:00–19:00 | **VERIFIED (single snapshot)** | [1](https://www.facebook.com/BonaVetClinicBaku/) |
| Services | Examination & treatment [checkup] (placeholder); Vaccination [vaccination] (placeholder); Surgery [surgery] (placeholder); Grooming [grooming] (verified-single) | **VERIFIED (single snapshot)** | [1](https://zooline.az/az/grooming-salonlari) [2](https://www.instagram.com/groomingstudio__/) — Grooming: Zooline lists the clinic under grooming salons and a grooming studio tags it. Check-ups, vaccination and surgery are template entries to confirm. |
| Prices | Examination & treatment: [TO CONFIRM]; Vaccination: [TO CONFIRM]; Surgery: [TO CONFIRM]; Grooming: [TO CONFIRM] | **PLACEHOLDER** | — |
| Emergency contact | (+994 12) 510-11-85, (+994 12) 510-11-86, (+994 50) 225-92-29 — Emergency visits at night / out of hours: [TO CONFIRM] | **PLACEHOLDER** | No emergency or 24/7 line found; the main numbers are shown and out-of-hours availability is marked to confirm. |
| Pet types treated | dog, cat | **PLACEHOLDER** | Pet types treated were not found in any source; dogs and cats are shown as a template, marked to confirm. |
| Doctors | [TO CONFIRM], [TO CONFIRM], [TO CONFIRM] | **PLACEHOLDER** | No vets named in any source. |
| Rating | — | **PLACEHOLDER** | [1](https://2gis.az/ru/baku/firm/70000001055105013) — 2GIS listing exists but no rating was visible; no Google or Yandex rating found. |
| Map link | Google Maps search: "Bona Vet Clinic, Mikayıl Müşfiq 14/17, Bakı" | **DERIVED from verified data** | Search link built from the shown address. |
| Brand colour | #2f7d6d | **OUR DESIGN CHOICE** | Our choice; the clinic's logo and photos were not copied. |
| Photos / logo | neutral placeholder illustrations | **PLACEHOLDER** | Neutral illustrations. |
| Reviews | labelled sample placeholders | **PLACEHOLDER** | Labelled sample reviews; no reviews copied. |

#### Myvet Animal Clinic (`/myvet`)

| Field | Value on the demo site | Status | Source(s) / note |
|---|---|---|---|
| Name | Myvet Animal Clinic | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/baytarliq_klinikasi_/) — Instagram display name 'Veterinar \| Dr.Suliddin \| Baytar'; 2GIS: 'My vet'; Cybo: 'My Vet Baytarliq Klinikasi'. |
| Address | 159 Salatin Asgarova St (next to the 28 May skin and venereal diseases dispensary), Baku | **VERIFIED, sources conflict → confirm** | [1](https://www.instagram.com/baytarliq_klinikasi_/) [2](https://telefon-kitab.cybo.com/AZ/m%C9%99rd%C9%99kan/baytarlar-v%C9%99-heyvan-klinikalar%C4%B1/?p=2) [3](https://2gis.az/ru/baku/search/Veterinar) — Shown: Salatın Əsgərova 159 (Instagram, Cybo). 2GIS says 161. A Yandex 'My Vet' at Mirəli Qaşqay 63A is not linked to this clinic. Confirm. |
| District | [TO CONFIRM] | **PLACEHOLDER** | — |
| Phones | (+994 55) 825-99-32 | **VERIFIED, sources conflict → confirm** | [1](https://www.instagram.com/baytarliq_klinikasi_/) [2](https://telefon-kitab.cybo.com/AZ/m%C9%99rd%C9%99kan/baytarlar-v%C9%99-heyvan-klinikalar%C4%B1/?p=2) — Shown: 055 825 99 32 (Instagram). Cybo lists 055 462 41 23. Confirm. |
| WhatsApp | [TO CONFIRM] | **PLACEHOLDER** | No WhatsApp number found. |
| Instagram | @baytarliq_klinikasi_ | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/baytarliq_klinikasi_/) — About 26K followers, 3,454 posts (undated); follows ~7.7K accounts. |
| Website | none found | **VERIFIED** | No website found (weak check: the domain search was limited). |
| Opening hours | [TO CONFIRM] | **PLACEHOLDER** | No published hours anywhere; the booking form uses a default 09:00–19:00 window. |
| Services | Examination & treatment [checkup] (verified-single); Vaccination [vaccination] (placeholder); Ultrasound [diagnostics] (verified-single); X-ray [diagnostics] (verified-single); Lab tests [diagnostics] (verified-single); Surgery [surgery] (placeholder) | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/baytarliq_klinikasi_/) — Examination, treatment, ultrasound, X-ray and laboratory (Instagram). Vaccination and surgery are template entries to confirm. |
| Prices | Examination & treatment: [TO CONFIRM]; Vaccination: [TO CONFIRM]; Ultrasound: [TO CONFIRM]; X-ray: [TO CONFIRM]; Lab tests: [TO CONFIRM]; Surgery: [TO CONFIRM] | **PLACEHOLDER** | — |
| Emergency contact | (+994 55) 825-99-32 — Emergency visits at night / out of hours: [TO CONFIRM] | **PLACEHOLDER** | [1](https://2gis.az/baku/search/Veet) — No 24/7 claim found; a 2GIS snippet said 'closed until morning' but may refer to another listing. |
| Pet types treated | dog, cat | **PLACEHOLDER** | Pet types treated were not found in any source; dogs and cats are shown as a template, marked to confirm. |
| Doctors | Dr. Suliddin, [TO CONFIRM], [TO CONFIRM] | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/baytarliq_klinikasi_/) — Dr. Suliddin (first name only, Instagram). Media mention a vet 'Suliddin Ələkbərov/Ələkbərli', not tied to this clinic — not used. |
| Rating | — | **PLACEHOLDER** | No 2GIS, Yandex or Google rating found. |
| Map link | Google Maps search: "Myvet Animal Clinic, Salatın Əsgərova 159, Bakı" | **DERIVED from verified data** | Search link built from the shown address. |
| Brand colour | niche default | **OUR DESIGN CHOICE** | Niche default colour; the clinic's logo and photos were not copied. |
| Photos / logo | neutral placeholder illustrations | **PLACEHOLDER** | Neutral illustrations. |
| Reviews | labelled sample placeholders | **PLACEHOLDER** | Labelled sample reviews; no reviews copied. |

#### Tarvet (`/tarvet`)

| Field | Value on the demo site | Status | Source(s) / note |
|---|---|---|---|
| Name | Tarvet | **VERIFIED** | [1](https://www.instagram.com/tarvet_clinic_/) [2](https://2gis.az/ru/baku/firm/70000001109504315) — 'Tarvet Veterinary Clinic' (Instagram), 'Tarvet, ветеринарная клиника' (2GIS). |
| Address | 70 Hasan bey Zardabi Ave, Yasamal, Baku | **VERIFIED (single snapshot)** | [1](https://2gis.az/ru/baku/firm/70000001109504315) — Only 2GIS gives an address. |
| District | Yasamal district | **VERIFIED (single snapshot)** | [1](https://2gis.az/ru/baku/firm/70000001109504315) |
| Phones | (+994 50) 462-22-99 | **VERIFIED** | [1](https://www.instagram.com/tarvet_clinic_/) [2](https://2gis.az/ru/baku/firm/70000001109504315) — Instagram number; 2GIS shows a partly hidden number consistent with it. |
| WhatsApp | [TO CONFIRM] | **PLACEHOLDER** | No WhatsApp number found. |
| Instagram | @tarvet_clinic_ | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/tarvet_clinic_/) — About 17K followers, 925 posts (undated); follows ~7.4K accounts. |
| Website | none found | **VERIFIED** | No website, no Facebook page; only Instagram and a 2GIS card found (weak domain check). |
| Opening hours | mon–sun 09:00–21:00 | **VERIFIED (single snapshot)** | [1](https://2gis.az/ru/baku/firm/70000001109504315) |
| Services | Examination & treatment [checkup] (placeholder); Vaccination [vaccination] (placeholder); Ultrasound [diagnostics]; X-ray [diagnostics]; Blood tests [diagnostics] (verified-single); Surgery [surgery] (verified-single); Inpatient care [care] (verified-single) | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/tarvet_clinic_/) [2](https://2gis.az/ru/baku/firm/70000001109504315) — Ultrasound and X-ray in both sources; surgery, inpatient care and blood tests on Instagram. Check-ups and vaccination are template entries to confirm. |
| Prices | Examination & treatment: [TO CONFIRM]; Vaccination: [TO CONFIRM]; Ultrasound: [TO CONFIRM]; X-ray: [TO CONFIRM]; Blood tests: [TO CONFIRM]; Surgery: [TO CONFIRM]; Inpatient care: [TO CONFIRM] | **PLACEHOLDER** | — |
| Emergency contact | (+994 50) 462-22-99 — Emergency visits at night / out of hours: [TO CONFIRM] | **PLACEHOLDER** | Not 24/7 per the listed hours; no emergency line found. |
| Pet types treated | dog, cat | **PLACEHOLDER** | Pet types treated were not found in any source; dogs and cats are shown as a template, marked to confirm. |
| Doctors | Dr. Taryel, [TO CONFIRM], [TO CONFIRM] | **VERIFIED (single snapshot)** | [1](https://www.instagram.com/tarvet_clinic_/) — 'Dr.Taryel Veterinar' in the Instagram bio; full name not found. |
| Rating | — | **VERIFIED (single snapshot)** | [1](https://2gis.az/ru/baku/firm/70000001109504315) — 2GIS 4.5 from 2 ratings — too few to show. No Google or Yandex rating found. |
| Map link | Google Maps search: "Tarvet, Həsən bəy Zərdabi 70, Bakı" | **DERIVED from verified data** | Search link built from the shown address. |
| Brand colour | #3c6ea8 | **OUR DESIGN CHOICE** | Our choice; the clinic's logo and photos were not copied. |
| Photos / logo | neutral placeholder illustrations | **PLACEHOLDER** | Neutral illustrations. |
| Reviews | labelled sample placeholders | **PLACEHOLDER** | Labelled sample reviews; no reviews copied. |

---

## 3. What changed in the template

### 3.1 Multi-niche architecture (Phase 1)

- **`niches/<id>.json`** (validated by `src/lib/niches/schema.ts`) defines:
  - theme preset, brand colour, icon, hero art;
  - section list and order, header nav;
  - service categories, audience options (pet types);
  - booking fields, copy overrides for the site and admin;
  - FAQ, appointment-reminder text, follow-up rules, demo values.
- **Fixed libraries, so configs never need code:** 12 sections, 9 booking field types, 25 icons,
  3 theme presets, 2 rule types.
- **Validation catches config errors early:**
  - a missing or renamed core field, a duplicate or reserved id;
  - a text field longer than 40 characters;
  - a rule pointing at an unknown category;
  - a per-pet rule without a pet-name field;
  - a copy key that doesn't exist.
- **Business files** (`clinics/<slug>.json`) now declare `"niche"` and are checked against it
  (service categories, pet types, package → service links). New optional fields:
  - `category`, and `course` (sessions and interval) on services;
  - `packages`, `emergency`, `audience`, `faq`, `gallery`, `sections`;
  - doctor `specialties`.
- **Bookings** gained a `details` object for the niche's extra fields (pet name, species,
  specialist), validated server-side. Undeclared keys are still dropped.
- **Storage:** two new columns, `details` and `followups`.
  - SQLite upgrades itself.
  - Supabase upgrades through `schema.sql` (`add column if not exists`), automatically when `POSTGRES_URL` is set.
  - Dental inserts never send the new columns, so the existing live table keeps working before the upgrade.

### 3.2 Niche-specific sites (Phase 3)

**Aesthetic** (`luxe` preset):
- **Look:** ivory and champagne palette, Cormorant Garamond display serif, letter-spaced eyebrows.
- **Services:** a "treatment menu" grouped into laser / injectables / facial / body (+ other).
- **Courses and packages** section.
- **Specialists** (wording overrides "doctors").
- **Before/after gallery:** neutral placeholders only, labelled "photo placeholder", with a note that
  real photos need written consent.
- **FAQ.** Wording avoids medical claims and guarantees ("results differ from person to person",
  "results are not guaranteed").
- **Booking:** name, phone, treatment, optional preferred specialist (only confirmed names are
  offered; the field hides if none), date/time, consent. A note asks people **not** to enter
  health details or contraindications.

**Vet** (`warm` preset):
- **Look:** cream palette, Nunito rounded type, softer corners, a self-made dog-and-cat illustration.
- **Emergency:** a red block right after the hero, plus a red **emergency call button in the
  sticky header** on every screen size.
- **Sections:** services grouped by check-ups / vaccination / diagnostics / surgery / inpatient care /
  grooming (only the categories the business has); a pet-types section; vets; FAQ.
- **Booking:** owner name, phone, pet name (max 30 characters), species (select), reason for visit,
  date/time, consent.

**All niches:**
- AZ/RU/EN, mobile-first.
- Self-made illustrations only.
- No reviews attributed to real people: labelled samples unless live Google reviews are configured.
- `noindex` and `robots` disallow.
- Discreet "Demo prepared for …" banner.

### 3.3 Repeat-visit automation (Phase 4)

`src/lib/followups.ts`: a rule engine over booking history. A visit counts once a booking is
**confirmed and in the past**; no-shows, cancellations and unconfirmed requests don't count.

| Niche | Rule | Due | Notify from | Tracked per |
|---|---|---|---|---|
| Dental | `checkup-6m`, check-up and cleaning | 182 days after the last visit | 7 days before | patient (phone) |
| Aesthetic | `next-session`, next session of a course | last session + the service's `course.intervalDays`, until `course.sessions` are done | 3 days before | client + treatment |
| Vet | `vaccination-annual` | 365 days after the last vaccination-category visit | 14 days before | pet (phone + pet name) |
| Vet | `checkup-annual` | 365 days after the last check-up-category visit | 14 days before | pet |

- **Suppression:** a follow-up disappears once the person (or pet) has a new appointment for a
  matching service. An unanswered one stops being listed 30 days after it's due (`stopAfterDays`).
  A course restarts after a gap of more than 3× its interval.
- **Delivery:** the daily cron (`/api/cron/reminders`, 18:00 Baku) now also runs `runFollowUps`. It
  prepares a message per person through the **existing messaging adapter**: `wa.me` links by
  default, or the WhatsApp Cloud API with `WHATSAPP_FOLLOWUP_TEMPLATE`. Staff get one **Telegram
  digest**, and each item is marked sent on its source visit, so re-runs never repeat it.
- **Language:** each message goes in the patient's booking language. The dashboard also offers the
  other of **AZ/RU** with one tap.
- **Admin dashboard:**
  - a **"Patients due back"** stat (worded "Clients due back" or "Pets due back" by niche);
  - an **Upcoming follow-ups** list (overdue / due / coming up, next 30 days) with WhatsApp buttons;
  - **Mark sent** and **Send due follow-ups now** buttons;
  - pet and specialist details on each booking.
- **Tests:** 21 in `tests/followups.test.ts`, 12 scenarios plus one per demo business. They cover:
  - due dates and notify windows;
  - no-shows ignored, suppression by a new booking, overdue expiry, the 30-day horizon;
  - two pets of one owner kept apart, category matching;
  - course counting, completion and restarts;
  - AZ/RU messages with pet names and session numbers;
  - a full job run that is idempotent on re-run;
  - demo data for all 9 businesses producing overdue, due and upcoming items.

### 3.4 What works in demo mode (no keys at all)

- All 9 sites in 3 languages, booking with the niche's fields (validated), and the admin dashboard
  (password `demo`).
- Fictional demo data per niche, refreshed daily: recent bookings with pet names, species or
  specialists, plus **past visits that make each rule fire** (someone overdue, due now and coming up).
- Tomorrow's reminders and follow-ups as one-tap `wa.me` links (use `DEMO_WHATSAPP_NUMBER` to route
  them to your own phone).
- Telegram messages are "simulated" and visible in the dashboard's notification log.

### 3.5 What needs real keys or accounts

| Feature | Needs |
|---|---|
| Bookings reaching the dashboard on Vercel | Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; `POSTGRES_URL` for automatic table creation and upgrade). **Your existing deployment's table must gain the two new columns:** automatic with `POSTGRES_URL`, else re-run `supabase/schema.sql`. |
| Live staff alerts | `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID_<SLUG>` |
| Automatic WhatsApp sending (instead of one-tap links) | Meta WhatsApp Business account, `MESSAGING_PROVIDER=whatsapp-cloud`, approved templates (`WHATSAPP_TEMPLATE_NAME` for reminders, `WHATSAPP_FOLLOWUP_TEMPLATE` for follow-ups) |
| Live Google rating and reviews | `GOOGLE_MAPS_API_KEY` (Places API, needs billing) |
| Production | `DEMO_MODE=false`, `ADMIN_PASSWORD_<SLUG>`, `CRON_SECRET` |

### 3.6 Decisions I made (you asked me not to stop for questions)

1. **Branch.** This session's git setup only allows pushing to `claude/ecstatic-meitner-l1jorw`.
   Its previous PR (#6) was merged, so I restarted the branch from `main`. The PR is new; it is
   not a reuse of the merged one.
2. **Dental unchanged, proven by pixels.** I diffed screenshots before and after rather than eyeballing
   them. One existing test asserted the exact list of all clinics. It now asserts the exact
   **dental** list, and a new test asserts the aesthetic and vet lists.
3. **Unknown service lists become template placeholders.** Where a business publishes nothing
   (e.g. Bona Vet's vaccination, Ahu's treatments), the page shows a typical entry with a
   `[TO CONFIRM]` badge, so the layout and booking flow can be demonstrated. It is never presented
   as fact. Miss Laser is laser-only, so no injectables or facial placeholders were added for it.
4. **Pet types** were not found for any vet. Dogs and cats are shown dashed and badged `[TO CONFIRM]`.
5. **Emergency.** None of the vets has a verified emergency or 24/7 line. The block uses the main
   number and marks out-of-hours availability `[TO CONFIRM]`.
6. **Course settings** (6 sessions, every 42 days for laser) are demo defaults that drive the
   reminders. They are not shown publicly and must be set with each clinic.
7. **Hours without days** (Aspera 09–18, Miss Laser 09/10–22). The hours table shows
   `[TO CONFIRM]` per day, and the booking form offers the known time window.
8. **Weak or tiny ratings are not displayed** (Ahu Yandex 3.9/6, Tarvet 2GIS 4.5/2). They are recorded in
   provenance. A sales demo shouldn't lead with them, and they don't show popularity.
9. **Conflicting facts** show the business's own channel (Instagram or site), with the alternatives in
   provenance and an amber badge on the page.
10. **Specialist names** are offered in the booking form only when verified (Samira Musayeva at
    Ahu, Dr. Məlahət at Miss Laser). Dr. Məlahət's link to the Elmlər branch itself is unconfirmed.
11. **The emergency colour** is a fixed red (not the brand colour), so it reads as urgent on any brand.

---

## 4. Sales talking points (3 per business)

### Ahu Estetik Klinika
1. "124K people follow you on Instagram, but there's nowhere to send them. Search for your name and
   you only find directories with three different addresses and phone numbers. This gives you one
   correct page in three languages."
2. "Today every booking goes through the call centre. With this, clients pick a treatment and time
   at night from their phone, and your administrator just confirms."
3. "Course clients drift away between sessions. The system reminds them on WhatsApp before each
   next session, and your dashboard shows who is due back this week."

### Aspera
1. "You have 165K followers, but no website and a Gmail address. A real site with your own domain
   makes Aspera look like the established clinic it is."
2. "Your Instagram, Facebook and gomap show three different addresses, and there's a hospital called Aspera Klinik nearby. One
   page with the right address and a map pin stops lost clients."
3. "People can't see what you offer. Right now the only public treatment is a 2023 nose-filler post.
   A clear treatment menu with packages and online booking turns followers into appointments."

### Miss Laser
1. "623K followers on the Elmlər account alone, and they all have to call or write to book. This
   adds online booking per branch, on your existing domain."
2. "Laser is a course business. Clients forget session four or five. Automatic next-session
   reminders keep courses complete, which is revenue you've already sold."
3. "Your site is one page with a phone number per branch. There's no booking, and no page per
   branch, zone or price. This gives each branch its own page in AZ/RU/EN, with the one-year
   package and the free correction session up front."

### Bona Vet Clinic
1. "Pet owners search before they call. You have 21K Instagram followers but no website, and three
   different house numbers in directories. This gives you one correct, findable page."
2. "Annual vaccination reminders bring owners back every year without staff remembering. The
   dashboard lists which pets are due this month, with a one-tap WhatsApp message."
3. "Grooming and vet visits can both be booked online. Owners enter the pet's name and species, so
   your team knows who's coming."

### Myvet Animal Clinic
1. "Your Instagram is one of the most active vet accounts in Baku, but the handle doesn't say Myvet and
   there's no site or published hours. People can't find you or know when you're open."
2. "Ultrasound, X-ray and lab work are your strength. A site that shows them, plus online booking,
   turns that reach into appointments."
3. "Vaccination and yearly check-up reminders run automatically, per pet. Owners with two pets get two
   reminders, so repeat visits stop depending on memory."

### Tarvet
1. "Right now you exist on Instagram and one 2GIS card. An Azerbaijani search finds nothing. A
   trilingual site fixes that."
2. "You're open until 21:00 every day with surgery and inpatient care. An always-visible emergency
   call button and online booking make that obvious to a worried owner."
3. "Every surgery or vaccination patient is a future check-up. Automatic reminders and a 'pets due
   back' list fill your quieter days."

---

## 5. Known limitations and next steps

### Limitations

- **Popularity evidence is Instagram-based.** No Google ratings could be retrieved, and
  follower counts are undated snapshots. Myvet and Tarvet follow many accounts, so their audiences
  may be partly follow-back.
- **Everything is secondhand from search results.** Pages couldn't be opened, so website quality
  (Miss Laser) and the absence of websites (others) weren't tested directly.
- **Many fields are placeholders**, especially service lists, prices, specialists and pet types.
  The sites are demos of what the business could have, not finished sites.
- **Follow-up detection assumes staff mark visits `confirmed`.** There is no separate "attended"
  status, so a confirmed booking that didn't happen still counts as a visit unless it's marked no-show.
- **Course tracking** counts sessions of the same treatment per phone number. It can't tell two
  family members apart if they share a phone. Per-pet tracking relies on the pet name being typed
  consistently.
- **Rules are fixed per niche, not editable in the dashboard.** Changing an interval means editing
  `niches/<id>.json` (and a redeploy).
- **The WhatsApp Cloud API path** is written to Meta's documented API but not tested against a
  live account. Business-initiated follow-ups need an approved template.
- **Miss Laser** is shown as a single branch; a multi-branch selector is not built.

### Next steps

1. **Before calling:** open each business's Google Maps listing to confirm the rating, review count,
   address and phone, then fill in the file (or set `google.placeId` with the API key for live reviews).
2. **Upgrade the live database:** make sure `POSTGRES_URL` is set on Vercel, or re-run
   `supabase/schema.sql` once.
3. **Per client:** set real course settings, services and prices, and any emergency line. Replace the
   illustrations with their photos, and the before/after placeholders with consented photos only.
4. **Product:**
   - an "attended" status (or auto-attend after the visit time);
   - rule settings editable per business (e.g. `course` overrides, opt-outs);
   - a branch selector for chains like Miss Laser;
   - an approved WhatsApp template per niche for fully automatic sending.
5. **Pricing note** (from the dental round): the follow-up engine is the strongest recurring-fee
   argument, because it brings back revenue the clinic already earned once. Lead with it for aesthetic
   courses and vet vaccinations.
