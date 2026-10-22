import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { validateBookingRequest } from "@/lib/booking/validate";
import { siteDict } from "@/lib/i18n";
import { applyCopy, nicheSiteDict } from "@/lib/niches/copy";
import { getNiche, nicheIds, parseNiche } from "@/lib/niches/load";
import { testAestheticClinic, testVetClinic, WED_10AM_BAKU } from "./fixtures";

const dental = () => JSON.parse(fs.readFileSync("niches/dental.json", "utf8"));

describe("niche configs", () => {
  it("all niches/*.json files validate", () => {
    expect(nicheIds().sort()).toEqual(["aesthetic", "dental", "vet"]);
  });

  it("leaves the dental texts exactly as they were", () => {
    for (const locale of ["az", "ru", "en"] as const) {
      expect(JSON.stringify(nicheSiteDict(getNiche("dental"), locale))).toBe(JSON.stringify(siteDict(locale)));
    }
  });

  it.each([
    ["a missing core field", (n: ReturnType<typeof dental>) => n.booking.fields.splice(1, 1), /exactly one "phone"/],
    ["a renamed core field", (n: ReturnType<typeof dental>) => (n.booking.fields[0].id = "fullName"), /must have id "name"/],
    [
      "a reserved extra-field id",
      (n: ReturnType<typeof dental>) => n.booking.fields.push({ id: "locale", type: "text", label: { az: "a", ru: "b", en: "c" } }),
      /reserved/,
    ],
    [
      "a free-text field longer than 40 characters",
      (n: ReturnType<typeof dental>) =>
        n.booking.fields.push({ id: "notes", type: "text", maxLength: 500, label: { az: "a", ru: "b", en: "c" } }),
      /maxLength/,
    ],
    [
      "a rule on an unknown category",
      (n: ReturnType<typeof dental>) => (n.reminders.followUps[0].match = { categories: ["laser"] }),
      /unknown category "laser"/,
    ],
    [
      "a per-pet rule without a petName field",
      (n: ReturnType<typeof dental>) => (n.reminders.followUps[0].per = "pet"),
      /needs a booking field with id "petName"/,
    ],
    ["an audience section without options", (n: ReturnType<typeof dental>) => n.sections.push("audience"), /audience\.options/],
  ])("rejects %s", (_label, mutate, message) => {
    const n = dental();
    mutate(n);
    expect(() => parseNiche(n, "dental.json")).toThrow(message);
  });

  it("the starter file niches/_template.json is valid once copied to <id>.json", () => {
    const raw = JSON.parse(fs.readFileSync("niches/_template.json", "utf8"));
    expect(() => parseNiche(raw, "your-niche.json")).not.toThrow();
  });

  it("requires the id to match the file name", () => {
    expect(() => parseNiche(dental(), "beauty.json")).toThrow(/must match the file name/);
  });
});

describe("copy overrides", () => {
  it("replace plain texts by dotted key and keep the template functions", () => {
    const t = nicheSiteDict(getNiche("aesthetic"), "ru");
    expect(t.booking.service).toBe("Процедура");
    expect(t.demoBanner("X")).toBe("Демо, подготовленное для X");
  });

  it("refuse keys that don't exist or aren't plain text", () => {
    const value = { az: "a", ru: "b", en: "c" };
    expect(() => applyCopy(siteDict("az"), { "booking.nope": value }, "az")).toThrow(/does not exist|not a plain text/);
    expect(() => applyCopy(siteDict("az"), { demoBanner: value }, "az")).toThrow(/not a plain text/);
  });
});

describe("niche booking fields", () => {
  const base = { name: "Aysel", phone: "050 123 45 67", date: "2026-10-22", time: "11:30", consent: true };

  it("vet: stores pet name and species, nothing else", () => {
    const r = validateBookingRequest(
      testVetClinic(),
      { ...base, serviceId: "vaccine", petName: "  Bella ", species: "cat", symptoms: "coughing", notes: "x" },
      WED_10AM_BAKU,
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.booking.details).toEqual({ petName: "Bella", species: "cat" });
    expect(Object.keys(r.booking)).not.toContain("symptoms");
  });

  it("vet: requires a short pet name and a known species", () => {
    const vet = testVetClinic();
    const r = validateBookingRequest(vet, { ...base, serviceId: "vaccine", species: "dragon" }, WED_10AM_BAKU);
    expect(r).toEqual({ ok: false, errors: { petName: true, species: true } });
    const long = validateBookingRequest(vet, { ...base, serviceId: "vaccine", petName: "x".repeat(31), species: "dog" }, WED_10AM_BAKU);
    expect(long.ok).toBe(false);
  });

  it("aesthetic: the specialist is optional and must be a confirmed name", () => {
    const clinic = testAestheticClinic();
    const ok = validateBookingRequest(clinic, { ...base, serviceId: "laser", specialist: "Test Specialist" }, WED_10AM_BAKU);
    expect(ok.ok && ok.booking.details).toEqual({ specialist: "Test Specialist" });
    const none = validateBookingRequest(clinic, { ...base, serviceId: "laser" }, WED_10AM_BAKU);
    expect(none.ok && none.booking.details).toBeUndefined();
    const placeholder = validateBookingRequest(clinic, { ...base, serviceId: "laser", specialist: "[TO CONFIRM]" }, WED_10AM_BAKU);
    expect(placeholder).toEqual({ ok: false, errors: { specialist: true } });
  });

  it("aesthetic: without confirmed specialists the field is not offered or stored", () => {
    const clinic = testAestheticClinic({ doctors: [{ name: "[TO CONFIRM]", role: "Cosmetologist" }] });
    const r = validateBookingRequest(clinic, { ...base, serviceId: "laser", specialist: "Anyone" }, WED_10AM_BAKU);
    expect(r.ok && r.booking.details).toBeUndefined();
  });
});
