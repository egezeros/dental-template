# Phase 1 research notes (raw)

Research date: 2026-10-21. Researcher: Claude Code (automated), for the agency's sales demo.

## Method and limits — read this first

- **Only the web-search tool worked.** This cloud session's network policy blocks direct page loads:
  every non-package-registry host (google.com, yandex.com, 2gis.az, instagram.com, the clinics'
  own domains, and others) returned `403` on CONNECT or `ENOTFOUND` from the fetch tool.
- So **every fact below is "verified via search"**: a search engine returned a result whose summary
  or snippet contained the fact, attributed to the cited URL. Nobody opened the page itself.
  Facts can be stale (snapshot dates are unknown) and should be re-checked before a sales call.
- **No website could be loaded, so speed, mobile-friendliness and a live booking widget were NOT
  directly tested.** Website "checks" mean whether the domain shows up in the search index
  (`site:` queries) and what snippets or third-party audits say about it.
- **No Google Maps rating or Google Maps link was found for any pick.** The one Google rating below
  (Dental Club 4.7 from 29) comes from a third-party rating site, not from Google directly.
- About 50 searches in Azerbaijani, Russian and English: about 41 by a research sub-agent, plus 8
  spot-checks of the key facts.

Legend: **V** = verified via search (source attributed) · **V1** = verified in one search snapshot
only; re-checking did not reproduce it · **C** = sources conflict · **OLD** = dated · **NF** = not found.

---

## 1. Dent Star Stomatoloji Klinika (Yasamal) — strongest lead

| Field | Value | Status | Source |
|---|---|---|---|
| Name | "Dent Star Stomatoloji Klinika"; 2GIS: "Dent Star, stomatoloji klinika", company "MMC Dent Star" | V | https://2gis.az/baku/firm/70000001038903125 · https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/9ec80bc1f2ca40fa93f2444f0c85c003 |
| Address | Zaur Kərimov küçəsi 424, Yasamal, AZ1012 (RU 2GIS card: "4 этаж") | V | https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/9ec80bc1f2ca40fa93f2444f0c85c003 · https://2gis.az/ru/baku/firm/70000001038903125 |
| Address conflict | Clinic's own WordPress blog and Navigator.az list Zaur Kərimov **218**. 218 may be an older address. | C | https://dentstaraz.wordpress.com/haqqimizda/ · https://navigator.az/az/firm/23576 |
| Phones | (+994 12) 433-82-17, (+994 51) 302-82-37 | V | https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/9ec80bc1f2ca40fa93f2444f0c85c003 |
| Phone in FB page title | +994124338217 | V | https://www.facebook.com/p/Stomatoloq-Dent-Star-Stomatoloji-klinika-24-saat-Tel-994124338217-100063614921919/ |
| WhatsApp | 051-302-82-37 (Instagram bio mentions WhatsApp). Same number as the GoMap mobile. | V1 | https://www.instagram.com/dentstar.az/ |
| Instagram | @dentstar.az: about 55K followers, 1,308 posts (snapshot date unknown) | V1 | https://www.instagram.com/dentstar.az/ |
| Website | `site:dentstar.az` returned **no indexed pages**. The only site found is a free WordPress.com blog, dentstaraz.wordpress.com, with 2020-era posts. | V (index check only) | https://dentstaraz.wordpress.com/haqqimizda/ |
| Online booking | None found. Booking by phone or WhatsApp. | V (absence of evidence) | — |
| Hours | 24/7: 2GIS "Gecə-gündüz"; FB page name "24 saat"; WordPress "every day, 24 hours" | V | https://2gis.az/baku/firm/70000001038903125 · https://dentstaraz.wordpress.com/haqqimizda/ |
| Services | Orthodontics, prosthodontics, oral surgery, implantology, periodontology, pediatric dentistry, dental CT, OPTG, intraoral imaging, free consultation | V | https://2gis.az/baku/firm/70000001038903125 |
| Prices | 2020 blog post: 3D full CT 60 AZN, 3D single jaw 40 AZN, panoramic 20 AZN, cephalometric 25 AZN | OLD (2020) | https://dentstaraz.wordpress.com/2020/03/09/dent-star-rentgen-m%C9%99rk%C9%99zind%C9%99-asagidaki-radioji-xidm%C9%99tl%C9%99r-gost%C9%99rilir/ |
| Ratings | 2GIS RU card: 3 from 2 reviews. Facebook: 96% recommend from 21 reviews. Google and Yandex: NF. | V | https://2gis.az/ru/baku/firm/70000001038903125 · https://www.facebook.com/p/Stomatoloq-Dent-Star-Stomatoloji-klinika-24-saat-Tel-994124338217-100063614921919/ |
| Founded | "Since 2013", per its own blog | V (self-claim) | https://dentstaraz.wordpress.com/haqqimizda/ |
| Self-claim | "The only clinic in the city with 24-hour dental service". Not checked; do NOT use on the site. | self-claim | https://dentstaraz.wordpress.com/haqqimizda/ |
| Doctors | — | NF | — |
| Google Maps link | — | NF | — |

**Why popular:** Instagram about 55K followers (single snapshot); listed on 2GIS, GoMap, Navigator.az, YDoc and
two Facebook pages; mentioned in a FED.az service and price round-up
(https://fed.az/az/saglamliq/bakinin-stomatoloji-klinikalarinda-xidmetler-qiymetler-30001); a rare
24/7 position.

**Gaps:** no website of its own indexed, only a 2020-era free blog; no online booking; very few map
reviews; two addresses circulating (424 vs 218).

---

## 2. White Estetic Dental (Xətai)

| Field | Value | Status | Source |
|---|---|---|---|
| Name | "WHITE ESTETIC DENTAL" (Navigator.az); "White, stomatoloji klinika" (2GIS); "White Estetic Dental Klinika" (Ministry of Labour and Social Protection partner list); Instagram display name "STOMATOLOJİ ~ KLİNİKA" | V | https://navigator.az/az/firm/24499/white-estetic-dental · https://2gis.az/baku/firm/70000001037035192 · https://sosial.gov.az/nazirlik/sosial-terefdas/klinikalar |
| Address | Afiyəddin Cəlilov 82A, 1st floor, Xətai | V | https://navigator.az/az/firm/24499/white-estetic-dental · https://2gis.az/baku/firm/70000001037035192 |
| Address conflict | Waze, a YouTube video and a dentist's own site give Afiyəddin Cəlilov **20** (next to Megafun) | C | https://www.waze.com/live-map/directions/white-esthetic-dental-afiyeddin-celilov-20-baki?to=place.w.32702868.326832070.9110111 · https://www.youtube.com/watch?v=qPTLnAiR4D4 · https://drnadiraliyev.az/ |
| Phones | (+994 12) 496-77-71, (+994 12) 496-77-72 | V | https://navigator.az/az/firm/24499/white-estetic-dental |
| Mobile phones | +994 51 290 66 11, +994 51 290 66 17 | V | https://sosial.gov.az/nazirlik/sosial-terefdas/klinikalar |
| WhatsApp | — | NF | — |
| Instagram | @white_estetic_dental: 6,906 followers, 2,475 posts; bio hours 09:00–21:00 | V | https://www.instagram.com/white_estetic_dental/ |
| Facebook | "WHITE Estetic Dental": 90% recommend from 12 reviews | V | https://www.facebook.com/WHITE-Estetic-Dental-1140928469278792/ |
| Website | None found | NF | — |
| Online booking | None found | V (absence of evidence) | — |
| Hours | Monday to Saturday, 09:00–21:00 (Sunday not stated → treated as closed and flagged) | V | https://navigator.az/az/firm/24499/white-estetic-dental |
| Services | Listed under stomatology and teeth whitening; 2GIS mentions implantology and pediatric dentistry | V | https://navigator.az/az/firm/24499/white-estetic-dental · https://2gis.az/baku/firm/70000001037035192 |
| Ratings | 2GIS: 1 review on the main card, 5 from 4 ratings in another view | V (small sample) | https://2gis.az/baku/firm/70000001037035192 |
| Discount | 9% discount under the Ministry's social-partner program (date unknown) | V | https://sosial.gov.az/nazirlik/sosial-terefdas/klinikalar |
| Prices | — | NF | — |
| Doctors | — | NF | — |

**Why popular:** a very active Instagram (2,475 posts, about 6.9K followers); present on Navigator.az, 2GIS,
a government partner list, Facebook and YouTube. Popularity is **moderate**, not strong; said
honestly in the report.

**Gaps:** no website, no online booking, almost no map reviews, two addresses in circulation.

---

## 3. Dental Club (Nərimanov)

| Field | Value | Status | Source |
|---|---|---|---|
| Name | Dental Club | V | https://dentalclub.az/en/about · https://2gis.az/baku/firm/70000001041082928 |
| Website | dentalclub.az exists and is indexed (about, contact and doctors pages) | V | https://dentalclub.az/az · https://dentalclub.az/az/contact · https://dentalclub.az/az/doctors |
| Online booking | A third-party audit says the site's online-booking button is **disabled**; only a static name/email/phone/message contact form remains. It also found no WhatsApp link in the page code. | V (third-party, not re-tested) | https://azerbaijandentalrating.com/clinics/dental-club-baku/ |
| Google rating | 4.7 from 29 reviews (as of 2026-09-29), per the third-party audit | V (third-party) | https://azerbaijandentalrating.com/clinics/dental-club-baku/ |
| Third-party score | 47.8/100 on the profile page vs 48.9 in the ranking table | V | https://azerbaijandentalrating.com/ |
| Address | Ceyhunbəy Hacıbəyli küç. 116b, 1st floor, Nərimanov (2GIS) | V | https://2gis.az/baku/firm/70000001041082928 |
| Address conflict | Other listings give Ceyhun Hacıbəyli 24 or 114; the site's contact page reportedly shows "Bakıxanov küç. 758/759" | C | https://kataloq.gomap.az/az/all-poi/medicine/polyclinic/ee9f1fce8f1c470a8a638a5e35a618d1 · https://dentalclub.az/az/contact |
| Phones | (+994 12) 541-04-46 (site contact page and map listings); +994 50 379 28 40 (site) | V | https://dentalclub.az/az/contact · https://azerbaijandentalrating.com/clinics/dental-club-baku/ |
| Other phones | +994 70 379-28-40 and +994 50 344-88-74 (a directory); garbled "+994 70 70 379 28 40" on the site snippet | C | https://dentalclub.az/az/contact |
| WhatsApp | 2GIS shows a WhatsApp button but no number in the snippet; the third-party audit found no WhatsApp link | NF / C | https://2gis.az/baku/firm/70000001041082928 · https://azerbaijandentalrating.com/clinics/dental-club-baku/ |
| Instagram | The site links to Instagram, but the handle wasn't found | NF | — |
| Facebook | facebook.com/dentalclubbaku (linked from the site) | V | https://dentalclub.az/az |
| Hours | Site: Monday to Saturday 10:00–18:00. 2GIS: until 20:00 on at least one day. | C | https://dentalclub.az/az/contact · https://2gis.az/baku/firm/70000001041082928 |
| Founded | Since 2003; staff are EDAD-Baku members (own site) | V (self-claim) | https://dentalclub.az/en/about |
| Services | Digital implants, digital surgical guides, wireless orthodontics (aligners) | V | https://dentalclub.az/en/about |
| Prices | An about 8-year-old FED.az article gives braces at 1800–4000 AZN (upper and lower jaw) | OLD | https://fed.az/az/saglamliq/bakinin-stomatoloji-klinikalarinda-xidmetler-qiymetler-30001 |
| Doctors | The site has a doctors page, but names were not visible in search results | NF | https://dentalclub.az/az/doctors |
| Yandex | Two Yandex Maps cards exist (no rating seen) | V | https://yandex.com/maps/org/dental_club/161214068910/ · https://yandex.com/maps/org/dental_club/106345520604/ |

**Why popular:** the strongest *review* signal of the three (Google 4.7 from 29, third-party); has operated since 2003;
listed on 2GIS (with branches), GoMap, Metbuat, two Yandex cards and FED.az.

**Gaps:** it has a website, but online booking is reportedly switched off; no WhatsApp link; addresses and
hours conflict across its own site and the directories. This is a different gap type ("has a site, but it
doesn't convert") from the other two ("no site at all").

---

## Candidates considered and rejected

| Clinic | Why rejected | Source |
|---|---|---|
| Dental Klinik (@dental__klinika), Nərimanov | About 28K IG followers, but only 175 posts (unusual ratio); no legal name, street number, map listing or rating found. **Alternate lead: qualify by phone first.** | https://www.instagram.com/dental__klinika/ |
| EN Dent (Xaqani 76c) | No site or IG; FB 905 likes, 92% from 26 reviews. Second-tier lead. | https://www.facebook.com/EnDentClinic/ |
| Baku Dent (Nərimanov) | Little evidence of popularity; a "BakuDent" clinic was fined 6,000 AZN for unlicensed surgical dentistry (reported 23.04.2025): **compliance risk, avoid** | https://redaktor.az/news/actual/277614-bakudent-klinikasi · https://e-saglam.az/article/bakudent-klinikasi |
| AzDent | Strong site with Google 5.0 from 114 reviews | https://azdent.az/en/home-page-en/reviews-en/ |
| 5A Dent, BeSmile, SWISSDENT, German Dental, InterDent, Bəyaz Diş | Modern websites already | https://5adent.az/ · https://besmile.az/az · https://swissdent.az/ |
| Sağlam Diş | 3-branch mini-chain with a site | https://saglamdish.az/ |
| MediClub, Liv Bona Dea | Large chains or hospitals | https://www.mediclub.az/az/clinics/mediclub-dental |
| Only Dent | Not popular (about 944 IG followers) | https://www.instagram.com/only_dent/ |
| Aristokrat, Baku Dental Clinic (Binəqədi) | General medical centre or no popularity evidence | https://2gis.az/baku/firm/70000001039199516 |
