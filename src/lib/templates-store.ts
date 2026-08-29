import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SEED_TEMPLATES, SEED_VOTES } from "@/data/seed";
import type {
  BotTemplate,
  ListedTemplate,
  Vote,
  VoteValue,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "templates.json");

type StoreFile = {
  templates: BotTemplate[];
  votes: Vote[];
};

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function voteKey(vote: Vote) {
  return `${vote.voterId}:${vote.templateId}`;
}

function mergeSeed(store: StoreFile): StoreFile {
  const byId = new Map(store.templates.map((template) => [template.id, template]));

  for (const seed of SEED_TEMPLATES) {
    const existing = byId.get(seed.id);
    if (!existing) {
      store.templates.push(seed);
      byId.set(seed.id, seed);
      continue;
    }
    if (existing.origin === "curated") {
      const index = store.templates.findIndex((template) => template.id === seed.id);
      store.templates[index] = {
        ...seed,
        adds: existing.adds,
        createdAt: existing.createdAt,
      };
    }
  }

  const votes = new Map(store.votes.map((vote) => [voteKey(vote), vote]));
  for (const seed of SEED_VOTES) {
    if (!votes.has(voteKey(seed))) {
      store.votes.push(seed);
      votes.set(voteKey(seed), seed);
    }
  }

  return store;
}

function scoreMap(votes: Vote[]) {
  const scores = new Map<string, number>();
  for (const vote of votes) {
    scores.set(vote.templateId, (scores.get(vote.templateId) ?? 0) + vote.value);
  }
  return scores;
}

function toListed(
  templates: BotTemplate[],
  votes: Vote[],
  voterId?: string
): ListedTemplate[] {
  const scores = scoreMap(votes);
  const mine = new Map<string, VoteValue>();
  if (voterId) {
    for (const vote of votes) {
      if (vote.voterId === voterId) mine.set(vote.templateId, vote.value);
    }
  }
  return templates.map((template) => ({
    ...template,
    score: scores.get(template.id) ?? 0,
    userVote: mine.get(template.id) ?? 0,
  }));
}

function emptyStore(): StoreFile {
  return {
    templates: [...SEED_TEMPLATES],
    votes: [...SEED_VOTES],
  };
}

async function readStore(): Promise<StoreFile> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreFile | BotTemplate[];
    if (Array.isArray(parsed)) {
      return mergeSeed({ templates: parsed, votes: [] });
    }
    if (!parsed || !Array.isArray(parsed.templates)) return emptyStore();
    return mergeSeed({
      templates: parsed.templates,
      votes: Array.isArray(parsed.votes) ? parsed.votes : [],
    });
  } catch {
    const store = emptyStore();
    await writeFile(DATA_FILE, JSON.stringify(store, null, 2));
    return store;
  }
}

async function writeStore(store: StoreFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2));
}

export async function listTemplates(voterId?: string) {
  return withLock(async () => {
    const store = await readStore();
    await writeStore(store);
    return toListed(store.templates, store.votes, voterId);
  });
}

export async function getTemplate(slug: string, voterId?: string) {
  const templates = await listTemplates(voterId);
  return templates.find((template) => template.slug === slug) ?? null;
}

export async function findByBotId(botId: string, voterId?: string) {
  const templates = await listTemplates(voterId);
  return templates.find((template) => template.botId === botId) ?? null;
}

export async function addTemplate(
  template: BotTemplate
): Promise<
  | { ok: true; template: ListedTemplate }
  | { ok: false; error: string; slug?: string }
> {
  return withLock(async () => {
    const store = await readStore();
    const duplicate = store.templates.find((item) => item.botId === template.botId);
    if (duplicate) {
      return {
        ok: false as const,
        error: "That Grok Bot is already in the gallery.",
        slug: duplicate.slug,
      };
    }
    let slug = template.slug;
    let n = 2;
    while (store.templates.some((item) => item.slug === slug)) {
      slug = `${template.slug}-${n}`;
      n += 1;
    }
    const saved = { ...template, slug };
    store.templates.push(saved);
    await writeStore(store);
    return {
      ok: true as const,
      template: { ...saved, score: 0, userVote: 0 as const },
    };
  });
}

export async function incrementAdds(slug: string) {
  return withLock(async () => {
    const store = await readStore();
    const index = store.templates.findIndex((template) => template.slug === slug);
    if (index === -1) return;
    store.templates[index] = {
      ...store.templates[index],
      adds: store.templates[index].adds + 1,
    };
    await writeStore(store);
  });
}

export async function setVote(
  voterId: string,
  templateId: string,
  value: VoteValue
) {
  return withLock(async () => {
    const store = await readStore();
    if (!store.templates.some((template) => template.id === templateId)) {
      return null;
    }
    const index = store.votes.findIndex(
      (vote) => vote.voterId === voterId && vote.templateId === templateId
    );
    if (index >= 0 && store.votes[index].value === value) {
      store.votes.splice(index, 1);
    } else if (index >= 0) {
      store.votes[index] = { voterId, templateId, value };
    } else {
      store.votes.push({ voterId, templateId, value });
    }
    await writeStore(store);
    const listed = toListed(store.templates, store.votes, voterId);
    return listed.find((template) => template.id === templateId) ?? null;
  });
}
