import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SEED_TEMPLATES } from "@/data/seed";
import type { BotTemplate } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "templates.json");

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function mergeSeed(stored: BotTemplate[]): BotTemplate[] {
  const byId = new Map(stored.map((template) => [template.id, template]));

  for (const seed of SEED_TEMPLATES) {
    const existing = byId.get(seed.id);
    if (!existing) {
      stored.push(seed);
      byId.set(seed.id, seed);
      continue;
    }
    if (existing.origin === "curated") {
      const merged: BotTemplate = {
        ...seed,
        adds: existing.adds,
        createdAt: existing.createdAt,
      };
      const index = stored.findIndex((template) => template.id === seed.id);
      stored[index] = merged;
    }
  }

  return stored;
}

async function readAll(): Promise<BotTemplate[]> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as BotTemplate[];
    if (!Array.isArray(parsed)) return [...SEED_TEMPLATES];
    return mergeSeed(parsed);
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(SEED_TEMPLATES, null, 2));
    return [...SEED_TEMPLATES];
  }
}

async function writeAll(templates: BotTemplate[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(templates, null, 2));
}

export async function listTemplates() {
  return withLock(async () => {
    const templates = await readAll();
    await writeAll(templates);
    return templates;
  });
}

export async function getTemplate(slug: string) {
  const templates = await listTemplates();
  return templates.find((template) => template.slug === slug) ?? null;
}

export async function findByBotId(botId: string) {
  const templates = await listTemplates();
  return templates.find((template) => template.botId === botId) ?? null;
}

export async function addTemplate(
  template: BotTemplate
): Promise<
  { ok: true; template: BotTemplate } | { ok: false; error: string; slug?: string }
> {
  return withLock(async () => {
    const templates = await readAll();
    const duplicate = templates.find((item) => item.botId === template.botId);
    if (duplicate) {
      return {
        ok: false as const,
        error: "That Grok Bot is already in the gallery.",
        slug: duplicate.slug,
      };
    }
    let slug = template.slug;
    let n = 2;
    while (templates.some((item) => item.slug === slug)) {
      slug = `${template.slug}-${n}`;
      n += 1;
    }
    const saved = { ...template, slug };
    templates.push(saved);
    await writeAll(templates);
    return { ok: true as const, template: saved };
  });
}

export async function incrementAdds(slug: string) {
  return withLock(async () => {
    const templates = await readAll();
    const index = templates.findIndex((template) => template.slug === slug);
    if (index === -1) return;
    templates[index] = {
      ...templates[index],
      adds: templates[index].adds + 1,
    };
    await writeAll(templates);
  });
}
