# Research notes: Ankara (Türkiye)

Research date: 2026-10-23. Method: as for Baku, only a search tool worked (no page loads, no
Google Maps), so facts come from search snippets with the cited source. Ratings for the seven
demo businesses were then checked by the agency's partner on Google Maps where noted.

## The seven demo businesses

| Business | Niche | Google rating | Gap | Key sources |
|---|---|---|---|---|
| Işıl Işıl Lazer Epilasyon ve Güzellik Salonu (Keçiören/Etlik) | beauty | 5.0 · ~647–666 (aggregators) | Brochure site, phone booking | [guzelliktakip](https://guzelliktakip.com/merkez/isil-isil-lazer-epilasyon-ve-guzellik-salonu-kecioren-etlik-bayan-subesi-kecioren), [site](https://www.isilisilguzellik.com/), [eniyi8](https://eniyi8.com/ankara/en-iyi-8-lazer-epilasyon-merkezi) |
| Berber Ömer Aykut (Kızılay) | barber | 4.8 · ~600 (eniyi8) | No website found | [eniyi8](https://eniyi8.com/ankara/en-iyi-8-erkek-kuaforu-berber) |
| Detay Erkek Kuaför (Kızılay) | barber | not captured yet (Yandex ≈ 4.5) | No website or booking found; Facebook page only | [Yandex](https://yandex.com.tr/maps/org/detay_erkek_kuaforu/13930511698/), [Facebook](https://www.facebook.com/DetayErkekKuafor/) |
| Efendi Erkek Kuaförü (Çankaya) | barber | 4.9 · ~593 (eniyi8) | No website or booking found | [eniyi8](https://eniyi8.com/ankara/en-iyi-8-erkek-kuaforu-berber), [salonlarim](https://www.salonlarim.com/isletme/efendi-erkek-kuaforu) |
| Bilkent Emy Kuaför (Ankuva AVM) | beauty | **4.9 · 572 (Google, seen 2026-10-23)** | ~2018 template site, phone booking | [contact page](http://emy.oxit.web.tr/iletisim/), [Yandex](https://yandex.com/maps/org/emy_kuafor/149449327617/) |
| İnter JR Barbers Club (Etimesgut) | barber | 4.7 · 525 vs 159 (conflict) | Site appears dead; appointment-only by phone | [top-rated.online](https://www.top-rated.online/cities/Etimesgut/place/p/13988543/%C4%B0nter+JR+Barbers+Club), [Yandex](https://yandex.com.tr/maps/org/inter_jr_barbers_club/20971871420/) |
| Nazlı Erzar – Cebeci (multi-branch) | beauty | **5.0 · 1,117 (Google, seen 2026-10-23)** | Phone booking, no shared system | [site](https://www.nazlierzar.com.tr/nazli-erzar-cebeci-subesi-epilasyon-ve-guzellik-merkezi/), [doktorgel](https://doktorgel.com/kurum/nazli-erzar-cebeci-subesi-epilasyon-ve-guzellik-merkezi-p-KR3762) |
| Zest Güzellik Salonu (Kızılay) | beauty | **5.0 · 203 (Google, seen 2026-10-23)** | No website | [kuaforler.net](https://kuaforler.net/isletme/guzellik-salonu/ankara/cankaya/zest-guzellik-salonu-ankara-lazer-epilasyon-ankara-buz-lazer-cilt-bakimi-kizilay-cankaya/), [Instagram](https://www.instagram.com/zestguzellik/) |

Per-field sources and statuses are in each `clinics/<slug>.json` (`npm run report:fields -- <slug>`).

## Other leads found (not built)

- **Özel Ankaralife Polikliniği** (Kızılay, doctor-run dermatology/laser): ~770–890 Google reviews,
  ~20K Instagram; site has only a request form. Dropped by the agency (it has a website).
- **Dental, outer districts:** Dt. Sibel Akbaş Gökay (Yenimahalle, 4.8 · 417 per
  [Klinikle](https://klinikle.com/klinik/dis-hekimi-sibel-akbas-gokay-UnonpQ), no own site);
  Özel Elvankent ADSP (Etimesgut, count unconfirmed, site not indexed); Mevadent (Eryaman, 4.8 · 230);
  Özel Şentepe ADSP (Yenimahalle, 4.4 · 254, site without booking).
- **Alternates:** Magic Touch Kuaför (~400–520, phone/WhatsApp), Beres Beauty (nails, 4.9 · 192, DM only),
  Dr. Özgür Koldaş Polikliniği (4.5 · ~349, form only). Usta Berber (4.9 · ~490) already books online via Addagio.

## Rules that affect the product in Türkiye (not legal advice — confirm with a Turkish lawyer)

- **Clinics (dental, medical aesthetic):** the health-advertising regulation published 12 Nov 2025
  ([Health Ministry](https://shgmdenetimdb.saglik.gov.tr/TR-111587/saglik-hizmetlerinde-tanitim-ve-bilgilendirme-faaliyetleri-hakkinda-yonetmelik-yayimlanmistir.html))
  bans patient reviews/thank-yous, prices and campaigns in domestic promotion and restricts before/after
  images. A Turkish clinic site needs the reviews section off.
- **Vets:** TVHB rules and the Ankara chamber restrict advertising and thank-you notices
  ([AVHO](https://www.avho.org.tr/mesleki-reklam-faaliyetlerine-iliskin-onemli-hatirlatma/)).
- **Beauty salons and barbers:** general consumer-advertising rules; genuine reviews allowed, fake
  ones banned (2026 amendment, [ROK](https://www.rok.org.tr/haberler/ticari-reklam-ve-haksiz-ticari-uygulamalar-yonetmeligi-degisikligi/)).
  Laser epilation in non-medical salons is a legal grey zone
  ([Danıştay](https://www.aydinlik.com.tr/haber/danistay-karari-lazer-epilasyon-guzellik-merkezlerinde-yasaklandi-260653)).
- **Messages:** appointment reminders are informational; recall ("you're due back") messages are a
  grey zone — a separate marketing-consent box and İYS registration are the safe design
  ([İYS](https://iys.org.tr/iys/yonetmelik)). Messaging businesses (the agency's own outreach) is allowed
  until they opt out ([İYS law](https://iys.org.tr/iys/kanun)).
- **KVKK:** a privacy notice on the booking form; hosting abroad (Vercel/Supabase), Telegram and access
  from Baku count as transfers abroad needing a standard contract notified to KVKK
  ([summary](https://www.guzeloglu.legal/tr/haber-makale/kisisel-verilerin-yurt-disina-aktarilmasi-7499-sayili-kanun-ile-degisen-kvkk-madde-9-ve-yeni-aktarim-rejimi-4485.html)).
  Skipped for the demos by the agency's decision; needed before a business goes live.
- **Competition:** salon/barber booking apps are cheap (RandevuNet free, Kuaför Asistan 419 TL/month);
  clinic website+booking from Doktorsitesi costs 6,299–7,599 TL/month
  ([pricing](https://uzman-ozel.doktorsitesi.com/fiyatlandirma)).
