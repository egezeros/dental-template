export const LOCALES = ["az", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "az";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

/** Value that is either the same in every language (names, numbers) or translated. */
export type Localized = string | Record<Locale, string>;

export function tr(value: Localized | undefined, locale: Locale): string {
  if (value === undefined) return "";
  return typeof value === "string" ? value : value[locale] ?? value.az;
}

export const LOCALE_LABELS: Record<Locale, string> = { az: "AZ", ru: "RU", en: "EN" };

/** BCP-47 tags used for Intl formatting. */
export const INTL_LOCALE: Record<Locale, string> = { az: "az-Latn-AZ", ru: "ru-RU", en: "en-GB" };

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

const site = {
  az: {
    demoBanner: (name: string) => `${name} üçün hazırlanmış demo`,
    nav: {
      services: "Xidmətlər",
      doctors: "Həkimlər",
      why: "Niyə biz",
      reviews: "Rəylər",
      location: "Ünvan",
      hours: "İş saatları",
    },
    hero: {
      cta: "Qəbula yazılın",
      call: "Zəng edin",
      note: "Onlayn qeydiyyat təxminən 1 dəqiqə çəkir",
    },
    services: {
      title: "Xidmətlər və qiymətlər",
      subtitle: "Qiymətlər təxminidir; dəqiq məbləğ müayinədən sonra müəyyən edilir.",
      book: "Yazıl",
    },
    doctors: { title: "Həkimlərimiz", subtitle: "Peşəkar komanda" },
    why: { title: "Niyə bizi seçirlər" },
    reviews: {
      title: "Pasiyent rəyləri",
      sampleLabel: "NÜMUNƏ RƏYLƏR — yer tutucu. Real rəylər pasiyentlərin razılığı ilə əlavə olunacaq.",
      sampleText:
        "Bu, nümunə rəy mətnidir. Burada pasiyentin razılığı ilə dərc olunan real rəy göstəriləcək.",
      sampleAuthor: "Nümunə pasiyent",
      ratingOn: (platform: string) => `${platform} reytinqi`,
      ratingsCount: (n: number) => `${n} qiymətləndirmə`,
      source: "Mənbə",
      recommend: "tövsiyə edir",
    },
    booking: {
      title: "Onlayn qəbula yazılma",
      subtitle: "Formu doldurun — administrator vaxtı təsdiqləmək üçün sizinlə əlaqə saxlayacaq.",
      name: "Adınız",
      namePlaceholder: "Məsələn, Aysel",
      phone: "Telefon nömrəniz",
      service: "Xidmət",
      selectService: "Xidməti seçin",
      date: "Arzu olunan tarix",
      time: "Arzu olunan saat",
      selectTime: "Saatı seçin",
      consent: (clinic: string) =>
        `Adımın və telefon nömrəmin ${clinic} tərəfindən yalnız bu qəbulla bağlı mənimlə əlaqə saxlamaq üçün saxlanmasına razıyam.`,
      noHealthInfo: "Zəhmət olmasa, sağlamlığınız barədə heç bir məlumat yazmayın — bunu həkimlə qəbulda müzakirə edəcəksiniz.",
      submit: "Müraciəti göndər",
      submitting: "Göndərilir…",
      successTitle: "Müraciətiniz qəbul edildi!",
      successText: "Administrator vaxtı təsdiqləmək üçün tezliklə sizə zəng edəcək və ya yazacaq.",
      another: "Yeni müraciət",
      error: "Göndərmək alınmadı. Zəhmət olmasa, yenidən cəhd edin və ya bizə zəng edin.",
      demoNote: "Demo rejimi: müraciət klinikaya göndərilmir, yalnız demo paneldə görünür.",
      closedDay: "Bu gün klinika bağlıdır — başqa tarix seçin.",
      errors: {
        name: "Adınızı daxil edin",
        phone: "Düzgün telefon nömrəsi daxil edin",
        service: "Xidməti seçin",
        date: "Bu gün və ya sonrakı tarixi seçin",
        time: "Saatı seçin",
        consent: "Davam etmək üçün razılıq vermək lazımdır",
      },
    },
    location: { title: "Ünvan və xəritə", directions: "Marşrut qur", phones: "Telefonlar", website: "Sayt" },
    hours: {
      title: "İş saatları",
      closed: "Bağlıdır",
      today: "Bu gün",
      open24: "24/7 açıq",
      allDay: "Gecə-gündüz",
      nightNote: (from: string, to: string) =>
        `Onlayn yazılış ${from}–${to} arası üçündür; gecə təcili qəbul üçün zəng edin.`,
    },
    footer: {
      demo: (agency: string) =>
        `Bu demo sayt ${agency} tərəfindən hazırlanıb və klinikanın rəsmi saytı deyil.`,
      privacy: "Formdan gələn məlumatlar yalnız qəbulun təşkili üçün istifadə olunur.",
    },
    placeholderImage: "Şəkil yer tutucusu — klinikanın fotosu ilə əvəz olunacaq",
    photoPlaceholder: "Foto yer tutucusu",
    whatsappAria: "WhatsApp ilə yazın",
    whatsappMessage: (clinic: string) => `Salam! ${clinic} klinikasında qəbula yazılmaq istəyirəm.`,
    whatsappMissing: "Klinikanın WhatsApp nömrəsi hələ təsdiqlənməyib [TO CONFIRM].",
    days: {
      mon: "Bazar ertəsi",
      tue: "Çərşənbə axşamı",
      wed: "Çərşənbə",
      thu: "Cümə axşamı",
      fri: "Cümə",
      sat: "Şənbə",
      sun: "Bazar",
    } satisfies Record<Weekday, string>,
  },
  ru: {
    demoBanner: (name: string) => `Демо, подготовленное для ${name}`,
    nav: {
      services: "Услуги",
      doctors: "Врачи",
      why: "Почему мы",
      reviews: "Отзывы",
      location: "Адрес",
      hours: "Часы работы",
    },
    hero: {
      cta: "Записаться на приём",
      call: "Позвонить",
      note: "Онлайн-запись занимает около минуты",
    },
    services: {
      title: "Услуги и цены",
      subtitle: "Цены ориентировочные; точная стоимость определяется после осмотра.",
      book: "Записаться",
    },
    doctors: { title: "Наши врачи", subtitle: "Команда специалистов" },
    why: { title: "Почему выбирают нас" },
    reviews: {
      title: "Отзывы пациентов",
      sampleLabel: "ПРИМЕРЫ ОТЗЫВОВ — заглушка. Настоящие отзывы будут добавлены с согласия пациентов.",
      sampleText: "Это пример текста отзыва. Здесь появится настоящий отзыв, опубликованный с согласия пациента.",
      sampleAuthor: "Пример пациента",
      ratingOn: (platform: string) => `Рейтинг на ${platform}`,
      ratingsCount: (n: number) => `оценок: ${n}`,
      source: "Источник",
      recommend: "рекомендуют",
    },
    booking: {
      title: "Онлайн-запись на приём",
      subtitle: "Заполните форму — администратор свяжется с вами, чтобы подтвердить время.",
      name: "Ваше имя",
      namePlaceholder: "Например, Анна",
      phone: "Номер телефона",
      service: "Услуга",
      selectService: "Выберите услугу",
      date: "Желаемая дата",
      time: "Желаемое время",
      selectTime: "Выберите время",
      consent: (clinic: string) =>
        `Я согласен(на), что ${clinic} сохранит моё имя и номер телефона только для связи по поводу этой записи.`,
      noHealthInfo: "Пожалуйста, не указывайте сведения о здоровье — их вы обсудите с врачом на приёме.",
      submit: "Отправить заявку",
      submitting: "Отправляем…",
      successTitle: "Заявка принята!",
      successText: "Администратор скоро позвонит или напишет вам, чтобы подтвердить время.",
      another: "Новая заявка",
      error: "Не удалось отправить. Попробуйте ещё раз или позвоните нам.",
      demoNote: "Демо-режим: заявка не отправляется в клинику и видна только в демо-панели.",
      closedDay: "В этот день клиника не работает — выберите другую дату.",
      errors: {
        name: "Введите имя",
        phone: "Введите корректный номер телефона",
        service: "Выберите услугу",
        date: "Выберите сегодняшнюю или более позднюю дату",
        time: "Выберите время",
        consent: "Для продолжения необходимо согласие",
      },
    },
    location: { title: "Адрес и карта", directions: "Построить маршрут", phones: "Телефоны", website: "Сайт" },
    hours: {
      title: "Часы работы",
      closed: "Выходной",
      today: "Сегодня",
      open24: "Круглосуточно",
      allDay: "Круглосуточно",
      nightNote: (from: string, to: string) => `Онлайн-запись — на ${from}–${to}; для срочного визита ночью позвоните.`,
    },
    footer: {
      demo: (agency: string) => `Этот демо-сайт подготовлен ${agency} и не является официальным сайтом клиники.`,
      privacy: "Данные из формы используются только для организации записи.",
    },
    placeholderImage: "Заглушка — будет заменена фотографией клиники",
    photoPlaceholder: "Заглушка для фото",
    whatsappAria: "Написать в WhatsApp",
    whatsappMessage: (clinic: string) => `Здравствуйте! Хочу записаться на приём в клинику ${clinic}.`,
    whatsappMissing: "Номер WhatsApp клиники ещё не подтверждён [TO CONFIRM].",
    days: {
      mon: "Понедельник",
      tue: "Вторник",
      wed: "Среда",
      thu: "Четверг",
      fri: "Пятница",
      sat: "Суббота",
      sun: "Воскресенье",
    } satisfies Record<Weekday, string>,
  },
  en: {
    demoBanner: (name: string) => `Demo prepared for ${name}`,
    nav: {
      services: "Services",
      doctors: "Doctors",
      why: "Why us",
      reviews: "Reviews",
      location: "Location",
      hours: "Hours",
    },
    hero: {
      cta: "Book appointment",
      call: "Call us",
      note: "Online booking takes about a minute",
    },
    services: {
      title: "Services & prices",
      subtitle: "Prices are indicative; the final cost is confirmed after an examination.",
      book: "Book",
    },
    doctors: { title: "Our doctors", subtitle: "The team" },
    why: { title: "Why patients choose us" },
    reviews: {
      title: "Patient reviews",
      sampleLabel: "SAMPLE REVIEWS — placeholder. Real reviews will be added with patients' consent.",
      sampleText: "This is sample review text. A real review, published with the patient's consent, will appear here.",
      sampleAuthor: "Sample patient",
      ratingOn: (platform: string) => `Rating on ${platform}`,
      ratingsCount: (n: number) => `${n} ratings`,
      source: "Source",
      recommend: "recommend",
    },
    booking: {
      title: "Book an appointment online",
      subtitle: "Fill in the form and our administrator will contact you to confirm the time.",
      name: "Your name",
      namePlaceholder: "e.g. Aysel",
      phone: "Phone number",
      service: "Service",
      selectService: "Choose a service",
      date: "Preferred date",
      time: "Preferred time",
      selectTime: "Choose a time",
      consent: (clinic: string) =>
        `I agree that ${clinic} may store my name and phone number only to contact me about this appointment.`,
      noHealthInfo: "Please don't include any health information — you'll discuss that with the doctor at your visit.",
      submit: "Request appointment",
      submitting: "Sending…",
      successTitle: "Request received!",
      successText: "Our administrator will call or message you shortly to confirm the time.",
      another: "New request",
      error: "Something went wrong. Please try again or call us.",
      demoNote: "Demo mode: this request is not sent to the clinic; it only appears in the demo dashboard.",
      closedDay: "The clinic is closed on this day — please choose another date.",
      errors: {
        name: "Please enter your name",
        phone: "Please enter a valid phone number",
        service: "Please choose a service",
        date: "Choose today or a later date",
        time: "Please choose a time",
        consent: "Consent is required to continue",
      },
    },
    location: { title: "Location", directions: "Get directions", phones: "Phones", website: "Website" },
    hours: {
      title: "Opening hours",
      closed: "Closed",
      today: "Today",
      open24: "Open 24/7",
      allDay: "24 hours",
      nightNote: (from: string, to: string) =>
        `Online booking covers ${from}–${to}; for an urgent visit at night, please call.`,
    },
    footer: {
      demo: (agency: string) => `This demo was prepared by ${agency} and is not the clinic's official website.`,
      privacy: "Form data is used only to arrange your appointment.",
    },
    placeholderImage: "Image placeholder — replace with a clinic photo",
    photoPlaceholder: "Photo placeholder",
    whatsappAria: "Message us on WhatsApp",
    whatsappMessage: (clinic: string) => `Hello! I'd like to book an appointment at ${clinic}.`,
    whatsappMissing: "The clinic's WhatsApp number is not confirmed yet [TO CONFIRM].",
    days: {
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday",
      sun: "Sunday",
    } satisfies Record<Weekday, string>,
  },
};

export type SiteDictionary = (typeof site)["en"];
export function siteDict(locale: Locale): SiteDictionary {
  return site[locale];
}

const admin = {
  az: {
    title: "Admin panel",
    login: "Daxil ol",
    password: "Şifrə",
    wrongPassword: "Şifrə yanlışdır",
    demoHint: (pw: string) => `Demo rejimi: şifrə — ${pw}`,
    disabled: "Admin panel söndürülüb: ADMIN_PASSWORD təyin edilməyib.",
    logout: "Çıxış",
    viewSite: "Sayta bax",
    stats: {
      week: "Bu həftə qəbullar",
      upcoming: "Gələcək qəbullar",
      noShowRate: "Gəlməmə faizi (30 gün)",
      pending: "Təsdiq gözləyir",
    },
    tabs: { upcoming: "Gələcək", past: "Keçmiş", all: "Hamısı" },
    table: { patient: "Pasiyent", service: "Xidmət", when: "Tarix / saat", status: "Status", actions: "Əməliyyatlar" },
    status: { new: "Yeni", confirmed: "Təsdiqlənib", cancelled: "Ləğv edilib", no_show: "Gəlmədi" },
    actions: { confirm: "Təsdiqlə", cancel: "Ləğv et", noShow: "Gəlmədi", reset: "Yeniyə qaytar" },
    empty: "Qəbul yoxdur",
    reminders: {
      title: "Sabahkı xatırlatmalar",
      subtitle: "Bir toxunuşla pasiyentə hazır WhatsApp mesajı göndərin.",
      send: "WhatsApp-da aç",
      run: "Xatırlatma işini indi işə sal",
      none: "Sabah üçün qəbul yoxdur",
      sent: "Göndərilib",
    },
    outbox: {
      title: "Bildiriş jurnalı",
      subtitle: "Telegram-a göndərilən (və ya demo rejimdə göndəriləcək) mesajlar.",
      empty: "Hələ bildiriş yoxdur",
      delivered: "Telegram-a göndərildi",
      simulated: "Simulyasiya (Telegram açarı yoxdur)",
      failed: "Xəta",
    },
    storage: "Yaddaş",
    demoData: "Demo məlumatlar — saxta pasiyentlər",
  },
  ru: {
    title: "Панель администратора",
    login: "Войти",
    password: "Пароль",
    wrongPassword: "Неверный пароль",
    demoHint: (pw: string) => `Демо-режим: пароль — ${pw}`,
    disabled: "Панель отключена: не задан ADMIN_PASSWORD.",
    logout: "Выйти",
    viewSite: "Открыть сайт",
    stats: {
      week: "Записи на этой неделе",
      upcoming: "Предстоящие записи",
      noShowRate: "Неявки (30 дней)",
      pending: "Ждут подтверждения",
    },
    tabs: { upcoming: "Предстоящие", past: "Прошедшие", all: "Все" },
    table: { patient: "Пациент", service: "Услуга", when: "Дата / время", status: "Статус", actions: "Действия" },
    status: { new: "Новая", confirmed: "Подтверждена", cancelled: "Отменена", no_show: "Неявка" },
    actions: { confirm: "Подтвердить", cancel: "Отменить", noShow: "Неявка", reset: "Вернуть в новые" },
    empty: "Записей нет",
    reminders: {
      title: "Напоминания на завтра",
      subtitle: "Одно касание — и пациенту уходит готовое сообщение в WhatsApp.",
      send: "Открыть в WhatsApp",
      run: "Запустить напоминания сейчас",
      none: "На завтра записей нет",
      sent: "Отправлено",
    },
    outbox: {
      title: "Журнал уведомлений",
      subtitle: "Сообщения, отправленные в Telegram (или которые были бы отправлены в демо-режиме).",
      empty: "Уведомлений пока нет",
      delivered: "Отправлено в Telegram",
      simulated: "Симуляция (нет ключа Telegram)",
      failed: "Ошибка",
    },
    storage: "Хранилище",
    demoData: "Демо-данные — вымышленные пациенты",
  },
  en: {
    title: "Admin dashboard",
    login: "Sign in",
    password: "Password",
    wrongPassword: "Wrong password",
    demoHint: (pw: string) => `Demo mode: the password is ${pw}`,
    disabled: "Admin is disabled: ADMIN_PASSWORD is not set.",
    logout: "Sign out",
    viewSite: "View site",
    stats: {
      week: "Bookings this week",
      upcoming: "Upcoming bookings",
      noShowRate: "No-show rate (30 days)",
      pending: "Awaiting confirmation",
    },
    tabs: { upcoming: "Upcoming", past: "Past", all: "All" },
    table: { patient: "Patient", service: "Service", when: "Date / time", status: "Status", actions: "Actions" },
    status: { new: "New", confirmed: "Confirmed", cancelled: "Cancelled", no_show: "No-show" },
    actions: { confirm: "Confirm", cancel: "Cancel", noShow: "No-show", reset: "Reset to new" },
    empty: "No bookings",
    reminders: {
      title: "Tomorrow's reminders",
      subtitle: "One tap opens WhatsApp with a ready-to-send reminder for the patient.",
      send: "Open in WhatsApp",
      run: "Run reminder job now",
      none: "No appointments tomorrow",
      sent: "Sent",
    },
    outbox: {
      title: "Notification log",
      subtitle: "Messages sent to Telegram (or that would be sent, in demo mode).",
      empty: "No notifications yet",
      delivered: "Delivered to Telegram",
      simulated: "Simulated (no Telegram key)",
      failed: "Failed",
    },
    storage: "Storage",
    demoData: "Demo data — fictional patients",
  },
};

export type AdminDictionary = (typeof admin)["en"];
export function adminDict(locale: Locale): AdminDictionary {
  return admin[locale];
}
