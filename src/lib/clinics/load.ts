import fs from "node:fs";
import path from "node:path";
import { getNiche } from "../niches/load";
import type { Niche } from "../niches/schema";
import { clinicSchema, REQUIRED_PROVENANCE, type Clinic } from "./schema";

const CLINICS_DIR = path.join(process.cwd(), "clinics");

/** Parse and validate one clinic file. Throws with a readable message on any problem. */
export function parseClinic(raw: unknown, fileName: string): Clinic {
  const result = clinicSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
    throw new Error(`Invalid clinic file ${fileName}:\n${issues}`);
  }
  const clinic = result.data;
  const expectedSlug = path.basename(fileName, ".json");
  if (clinic.slug !== expectedSlug) {
    throw new Error(`Invalid clinic file ${fileName}: slug "${clinic.slug}" must match the file name "${expectedSlug}"`);
  }
  const missing = REQUIRED_PROVENANCE.filter((key) => !clinic.provenance[key]);
  if (missing.length) {
    throw new Error(`Invalid clinic file ${fileName}: provenance is missing for ${missing.join(", ")}`);
  }
  const serviceIds = new Set<string>();
  for (const s of clinic.services) {
    if (serviceIds.has(s.id)) throw new Error(`Invalid clinic file ${fileName}: duplicate service id "${s.id}"`);
    serviceIds.add(s.id);
  }
  let niche: Niche;
  try {
    niche = getNiche(clinic.niche);
  } catch (err) {
    throw new Error(`Invalid clinic file ${fileName}: ${(err as Error).message}`);
  }
  const problems = checkAgainstNiche(clinic, niche, serviceIds);
  if (problems.length) throw new Error(`Invalid clinic file ${fileName}:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  return { ...clinic, brandColor: clinic.brandColor ?? niche.theme.brandColor };
}

/** Business data must fit its niche: known categories, audience options and service references. */
function checkAgainstNiche(
  clinic: Omit<Clinic, "brandColor">,
  niche: Niche,
  serviceIds: Set<string>,
): string[] {
  const problems: string[] = [];
  const categories = new Set(niche.services.categories.map((c) => c.id));
  for (const s of clinic.services) {
    if (categories.size > 0 && !s.category) problems.push(`service "${s.id}" needs a category (${[...categories].join(", ")})`);
    if (s.category && !categories.has(s.category)) problems.push(`service "${s.id}": unknown category "${s.category}"`);
  }
  const audience = new Set(niche.audience?.options.map((o) => o.id) ?? []);
  for (const a of clinic.audience ?? []) {
    if (!audience.has(a)) problems.push(`audience: unknown option "${a}"`);
  }
  for (const p of clinic.packages ?? []) {
    if (p.serviceId && !serviceIds.has(p.serviceId)) problems.push(`package "${p.id}": unknown service "${p.serviceId}"`);
  }
  return problems;
}

let cache: Map<string, Clinic> | undefined;

function loadAll(): Map<string, Clinic> {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs
    .readdirSync(CLINICS_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .sort();
  const map = new Map<string, Clinic>();
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(CLINICS_DIR, file), "utf8"));
    const clinic = parseClinic(raw, file);
    map.set(clinic.slug, clinic);
  }
  cache = map;
  return map;
}

export function getClinics(): Clinic[] {
  return [...loadAll().values()];
}

export function getClinic(slug: string): Clinic | undefined {
  return loadAll().get(slug);
}

export function clinicSlugs(): string[] {
  return [...loadAll().keys()];
}
