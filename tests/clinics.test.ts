import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { getClinics, parseClinic } from "@/lib/clinics/load";
import { slotsForDate } from "@/lib/clinics/slots";
import { buildDemoBookings } from "@/lib/storage/demo-seed";
import { testClinic } from "./fixtures";

describe("clinic files", () => {
  const clinics = getClinics();

  it("all validate and include the dental demo clinics", () => {
    expect(clinics.filter((c) => c.niche === "dental").map((c) => c.slug).sort()).toEqual([
      "beyaz-dis",
      "dent-star",
      "dental-club",
      "one-dent",
      "white-estetic-dental",
    ]);
  });

  it("include three aesthetic and three vet businesses", () => {
    const by = (niche: string) => clinics.filter((c) => c.niche === niche).map((c) => c.slug).sort();
    expect(by("aesthetic")).toEqual(["ahu-estetik-klinika", "aspera", "miss-laser"]);
    expect(by("vet")).toEqual(["bona-vet-clinic", "myvet", "tarvet"]);
  });

  it.each(getClinics().map((c) => [c.slug, c] as const))("%s documents a source for every verified fact", (_slug, c) => {
    for (const [field, p] of Object.entries(c.provenance)) {
      if (["verified", "verified-single", "self-reported", "conflict", "outdated"].includes(p.status)) {
        // "No website found" is a verified absence and may legitimately have no URL.
        if (field === "website" && p.sources.length === 0) continue;
        expect(p.sources.length, `${c.slug}.${field}`).toBeGreaterThan(0);
      }
    }
  });

  it.each(getClinics().map((c) => [c.slug, c] as const))("%s demo seed only uses bookable slots", (_slug, c) => {
    const seed = buildDemoBookings(c, new Date("2026-10-21T06:00:00Z"));
    expect(seed.length).toBeGreaterThan(5);
    for (const b of seed) expect(slotsForDate(c, b.date)).toContain(b.time);
  });

  it.each(["_template.json", "_template-aesthetic.json", "_template-vet.json"])(
    "the starter file clinics/%s is valid once copied to <slug>.json",
    (file) => {
      const raw = JSON.parse(fs.readFileSync(`clinics/${file}`, "utf8"));
      expect(() => parseClinic(raw, "your-clinic-slug.json")).not.toThrow();
    },
  );

  it("accepts featured reviews and rejects invalid star ratings", () => {
    const items = [{ author: "Test Reviewer", rating: 5, text: "Test review text.", date: "1 month ago" }];
    expect(testClinic({ featuredReviews: { url: "https://example.com/listing", items } }).featuredReviews?.items).toHaveLength(1);
    expect(() => testClinic({ featuredReviews: { items: [{ ...items[0], rating: 6 }] } })).toThrow();
  });
});
