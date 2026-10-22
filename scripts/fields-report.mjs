#!/usr/bin/env node
/**
 * Prints a Markdown table per clinic: every field, the value shown on the site,
 * VERIFIED vs PLACEHOLDER, and the sources — straight from clinics/<slug>.json.
 * Usage: node scripts/fields-report.mjs [slug ...]
 */
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "clinics");
const only = process.argv.slice(2);
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  .filter((f) => only.length === 0 || only.includes(path.basename(f, ".json")))
  .sort();

const LABEL = {
  verified: "VERIFIED",
  "verified-single": "VERIFIED (single snapshot)",
  "self-reported": "VERIFIED (clinic's own claim)",
  conflict: "VERIFIED, sources conflict → confirm",
  outdated: "VERIFIED but dated → confirm",
  constructed: "DERIVED from verified data",
  design: "OUR DESIGN CHOICE",
  placeholder: "PLACEHOLDER",
};

const en = (v) => (v === undefined ? "—" : typeof v === "string" ? v : v.en ?? v.az);
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");

function hoursSummary(h) {
  if (typeof h === "string") return h;
  const fmt = (v) => (v === null ? "closed" : Array.isArray(v) ? v.join("–") : v);
  // Group consecutive days with the same hours: "mon–sat 09:00–21:00, sun [TO CONFIRM]".
  const groups = [];
  for (const [d, v] of Object.entries(h)) {
    const last = groups.at(-1);
    if (last && last.value === fmt(v)) last.to = d;
    else groups.push({ from: d, to: d, value: fmt(v) });
  }
  return groups.map((g) => `${g.from === g.to ? g.from : `${g.from}–${g.to}`} ${g.value}`).join(", ");
}

for (const file of files) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  const p = c.provenance;
  const rows = [
    ["Name", c.name, "name"],
    ["Address", en(c.address), "address"],
    ["District", en(c.district), "district"],
    ["Phones", c.phones.map((x) => x.display).join(", "), "phones"],
    ["WhatsApp", c.whatsapp, "whatsapp"],
    ["Instagram", c.instagram ? `@${c.instagram}` : "[TO CONFIRM]", "instagram"],
    ["Website", c.website ?? "none found", "website"],
    ["Opening hours", hoursSummary(c.hours), "hours"],
    [
      "Services",
      c.services
        .map((s) => `${en(s.name)}${s.category ? ` [${s.category}]` : ""}${s.status !== "verified" ? ` (${s.status})` : ""}`)
        .join("; "),
      "services",
    ],
    ["Prices", c.services.map((s) => `${en(s.name)}: ${en(s.price)}`).join("; "), "prices"],
    [
      "Packages / courses",
      (c.packages ?? []).map((k) => `${en(k.name)}: ${en(k.price)}${k.sessions ? `, ${k.sessions} sessions` : ""} (${k.status})`).join("; "),
      "packages",
    ],
    [
      "Course settings (reminders only)",
      c.services.filter((s) => s.course).map((s) => `${en(s.name)}: ${s.course.sessions} sessions, every ${s.course.intervalDays} days`).join("; "),
      "courses",
    ],
    [
      "Emergency contact",
      `${(c.emergency?.phones ?? c.phones).map((x) => x.display).join(", ")}${c.emergency?.note ? ` — ${en(c.emergency.note)}` : ""}`,
      "emergency",
    ],
    ["Pet types treated", (c.audience ?? []).join(", "), "audience"],
    ["Doctors", c.doctors.map((d) => d.name).join(", ") || "—", "doctors"],
    ["Rating", c.rating ? `${c.rating.value} ${c.rating.kind === "recommend" ? "recommend" : "★"} on ${c.rating.platform} (${c.rating.count}), as of ${c.rating.asOf}` : "—", "rating"],
    ["Founded", "", "founded"],
    ["Social programme", "", "socialProgram"],
    ["Map link", `Google Maps search: "${c.map.query}"`, "map"],
    ["Brand colour", c.brandColor ?? "niche default", "brandColor"],
    ["Photos / logo", "neutral placeholder illustrations", "photos"],
    ["Reviews", "labelled sample placeholders", "reviews"],
  ].filter(([, , key]) => p[key]);

  console.log(`\n#### ${c.name} (\`/${c.slug}\`)\n`);
  console.log("| Field | Value on the demo site | Status | Source(s) / note |");
  console.log("|---|---|---|---|");
  for (const [label, value, key] of rows) {
    const prov = p[key];
    const sources = prov.sources.length ? prov.sources.map((u, i) => `[${i + 1}](${u})`).join(" ") : "";
    const note = prov.note ? `${sources ? " — " : ""}${prov.note}` : "";
    console.log(`| ${label} | ${cell(value || "(see note)")} | **${LABEL[prov.status]}** | ${cell(sources + note) || "—"} |`);
  }
}
