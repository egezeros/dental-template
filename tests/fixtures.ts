import { clinicSchema, COUNTRIES, type Clinic } from "@/lib/clinics/schema";

/** A minimal synthetic clinic (not one of the real demo clinics) for deterministic tests. */
export function testClinic(overrides: Partial<Record<string, unknown>> = {}): Clinic {
  const parsed = clinicSchema.parse({
    slug: "test-clinic",
    niche: "dental",
    name: "Test Clinic",
    brandColor: "#123456",
    tagline: "Tagline",
    intro: "Intro",
    address: { az: "Test küç. 1, Bakı", ru: "ул. Тест, 1, Баку", en: "1 Test St, Baku" },
    district: "Test",
    phones: [{ display: "(+994 12) 000-00-00", tel: "+994120000000" }],
    whatsapp: "[TO CONFIRM]",
    map: { query: "Test" },
    hours: {
      mon: ["09:00", "18:00"],
      tue: ["09:00", "18:00"],
      wed: ["09:00", "18:00"],
      thu: ["09:00", "18:00"],
      fri: ["09:00", "18:00"],
      sat: ["10:00", "14:00"],
      sun: null,
    },
    services: [
      { id: "consultation", name: { az: "Konsultasiya", ru: "Консультация", en: "Consultation" }, price: "[TO CONFIRM]" },
      { id: "whitening", name: { az: "Ağartma", ru: "Отбеливание", en: "Whitening" }, price: "100 AZN" },
    ],
    doctors: [],
    whyUs: [{ icon: "clock", title: "t", text: "t" }],
    provenance: {},
    ...overrides,
  });
  return {
    ...parsed,
    brandColor: parsed.brandColor ?? "#123456",
    timeZone: parsed.timeZone ?? COUNTRIES[parsed.country].timeZone,
  };
}

/** 2026-10-21 10:00 in Baku (UTC+4) — a Wednesday. */
export const WED_10AM_BAKU = new Date("2026-10-21T06:00:00Z");

/** Synthetic vet clinic: services in the vet niche's categories. */
export function testVetClinic(overrides: Partial<Record<string, unknown>> = {}): Clinic {
  return testClinic({
    slug: "test-vet",
    niche: "vet",
    services: [
      { id: "checkup", category: "checkup", name: { az: "Müayinə", ru: "Осмотр", en: "Check-up" }, price: "[TO CONFIRM]" },
      { id: "vaccine", category: "vaccination", name: { az: "Peyvənd", ru: "Прививка", en: "Vaccination" }, price: "[TO CONFIRM]" },
      { id: "surgery", category: "surgery", name: { az: "Cərrahiyyə", ru: "Хирургия", en: "Surgery" }, price: "[TO CONFIRM]" },
    ],
    ...overrides,
  });
}

/** Synthetic aesthetic clinic: one course treatment (3 sessions, 28 days apart) and one single treatment. */
export function testAestheticClinic(overrides: Partial<Record<string, unknown>> = {}): Clinic {
  return testClinic({
    slug: "test-aesthetic",
    niche: "aesthetic",
    services: [
      {
        id: "laser",
        category: "laser",
        name: { az: "Lazer epilyasiya", ru: "Лазерная эпиляция", en: "Laser hair removal" },
        price: "[TO CONFIRM]",
        course: { sessions: 3, intervalDays: 28 },
      },
      { id: "consultation", category: "other", name: { az: "Konsultasiya", ru: "Консультация", en: "Consultation" }, price: "[TO CONFIRM]" },
    ],
    doctors: [
      { name: "Test Specialist", role: "Cosmetologist", status: "verified" },
      { name: "[TO CONFIRM]", role: "Cosmetologist", status: "placeholder" },
    ],
    ...overrides,
  });
}
