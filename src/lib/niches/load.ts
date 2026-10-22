import fs from "node:fs";
import path from "node:path";
import { nicheSchema, type Niche } from "./schema";

const NICHES_DIR = path.join(process.cwd(), "niches");

export function parseNiche(raw: unknown, fileName: string): Niche {
  const result = nicheSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
    throw new Error(`Invalid niche file ${fileName}:\n${issues}`);
  }
  const niche = result.data;
  const expectedId = path.basename(fileName, ".json");
  if (niche.id !== expectedId) {
    throw new Error(`Invalid niche file ${fileName}: id "${niche.id}" must match the file name "${expectedId}"`);
  }
  return niche;
}

let cache: Map<string, Niche> | undefined;

function loadAll(): Map<string, Niche> {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const map = new Map<string, Niche>();
  for (const file of fs.readdirSync(NICHES_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_")).sort()) {
    const niche = parseNiche(JSON.parse(fs.readFileSync(path.join(NICHES_DIR, file), "utf8")), file);
    map.set(niche.id, niche);
  }
  cache = map;
  return map;
}

export function getNiches(): Niche[] {
  return [...loadAll().values()];
}

export function getNiche(id: string): Niche {
  const niche = loadAll().get(id);
  if (!niche) throw new Error(`Unknown niche "${id}" (expected one of: ${[...loadAll().keys()].join(", ")})`);
  return niche;
}

export function nicheIds(): string[] {
  return [...loadAll().keys()];
}
