import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SEED_TEMPLATES, SEED_VOTES } from "@/data/seed";
import { getDatabaseUrl, sql } from "./db";
import type {
  BotTemplate,
  Category,
  ListedTemplate,
  TemplateOrigin,
  Vote,
  VoteValue,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "templates.json");

type StoreFile = {
  templates: BotTemplate[];
  votes: Vote[];
};

type TemplateRow = {
  id: string;
  slug: string;
  bot_id: string;
  bot_url: string;
  title: string;
  author_name: string;
  summary: string;
  description: string;
  og_image: string | null;
  category: string;
  tags: string[];
  note: string | null;
  submitted_by: string;
  origin: string;
  featured: boolean;
  created_at: string | Date;
  adds: number;
};

let queue: Promise<unknown> = Promise.resolve();
let schemaReady: Promise<void> | null = null;

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

function mergeSeed(store: StoreFile): StoreFile {
  const byId = new Map(store.templates.map((template) => [template.id, template]));

  for (const seed of SEED_TEMPLATES) {
    if (byId.has(seed.id)) continue;
    store.templates.push(seed);
    byId.set(seed.id, seed);
  }

  store.templates = store.templates.filter(
    (template) => template.id !== "seed-jarvis"
  );
  for (const template of store.templates) {
    if (template.origin === "curated") {
      template.origin = "community";
      template.featured = false;
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

function emptyStore(): StoreFile {
  return {
    templates: [...SEED_TEMPLATES],
    votes: [...SEED_VOTES],
  };
}

function rowToTemplate(row: TemplateRow): BotTemplate {
  return {
    id: row.id,
    slug: row.slug,
    botId: row.bot_id,
    botUrl: row.bot_url,
    title: row.title,
    authorName: row.author_name,
    summary: row.summary,
    description: row.description,
    ogImage: row.og_image ?? undefined,
    category: row.category as Category,
    tags: row.tags ?? [],
    note: row.note ?? undefined,
    submittedBy: row.submitted_by,
    origin: row.origin as TemplateOrigin,
    featured: row.featured,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
    adds: Number(row.adds) || 0,
  };
}

async function ensureNeon() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      await db`CREATE TABLE IF NOT EXISTS templates (
        id text PRIMARY KEY,
        slug text NOT NULL UNIQUE,
        bot_id text NOT NULL UNIQUE,
        bot_url text NOT NULL,
        title text NOT NULL,
        author_name text NOT NULL,
        summary text NOT NULL,
        description text NOT NULL,
        og_image text,
        category text NOT NULL,
        tags text[] NOT NULL DEFAULT '{}',
        note text,
        submitted_by text NOT NULL,
        origin text NOT NULL,
        featured boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL,
        adds integer NOT NULL DEFAULT 0
      )`;
      await db`CREATE TABLE IF NOT EXISTS votes (
        voter_id text NOT NULL,
        template_id text NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        value smallint NOT NULL CHECK (value IN (-1, 1)),
        PRIMARY KEY (voter_id, template_id)
      )`;

      for (const seed of SEED_TEMPLATES) {
        await db`
          INSERT INTO templates (
            id, slug, bot_id, bot_url, title, author_name, summary, description,
            og_image, category, tags, note, submitted_by, origin, featured, created_at, adds
          ) VALUES (
            ${seed.id}, ${seed.slug}, ${seed.botId}, ${seed.botUrl}, ${seed.title},
            ${seed.authorName}, ${seed.summary}, ${seed.description}, ${seed.ogImage ?? null},
            ${seed.category}, ${seed.tags}, ${seed.note ?? null}, ${seed.submittedBy},
            ${seed.origin}, ${seed.featured}, ${seed.createdAt}, ${seed.adds}
          )
          ON CONFLICT (id) DO UPDATE SET
            slug = EXCLUDED.slug,
            bot_id = EXCLUDED.bot_id,
            bot_url = EXCLUDED.bot_url,
            title = EXCLUDED.title,
            author_name = EXCLUDED.author_name,
            summary = EXCLUDED.summary,
            description = EXCLUDED.description,
            og_image = EXCLUDED.og_image,
            category = EXCLUDED.category,
            tags = EXCLUDED.tags,
            note = EXCLUDED.note,
            submitted_by = EXCLUDED.submitted_by,
            origin = EXCLUDED.origin,
            featured = EXCLUDED.featured
          WHERE templates.origin = 'curated'
        `;
      }

      for (const vote of SEED_VOTES) {
        await db`
          INSERT INTO votes (voter_id, template_id, value)
          VALUES (${vote.voterId}, ${vote.templateId}, ${vote.value})
          ON CONFLICT (voter_id, template_id) DO NOTHING
        `;
      }

      await db`DELETE FROM templates WHERE id = 'seed-jarvis'`;
      await db`
        UPDATE templates
        SET origin = 'community', featured = false
        WHERE origin = 'curated'
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

async function neonList(voterId?: string): Promise<ListedTemplate[]> {
  await ensureNeon();
  const db = sql();
  const templates = (await db`SELECT * FROM templates`) as TemplateRow[];
  const votes = (await db`SELECT voter_id, template_id, value FROM votes`) as {
    voter_id: string;
    template_id: string;
    value: number;
  }[];
  return toListed(
    templates.map(rowToTemplate),
    votes.map((vote) => ({
      voterId: vote.voter_id,
      templateId: vote.template_id,
      value: vote.value as VoteValue,
    })),
    voterId
  );
}

async function readStore(): Promise<StoreFile> {
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
    return emptyStore();
  }
}

async function writeStore(store: StoreFile): Promise<boolean> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(store, null, 2));
    return true;
  } catch {
    return false;
  }
}

async function fileList(voterId?: string) {
  return withLock(async () => {
    const store = await readStore();
    return toListed(store.templates, store.votes, voterId);
  });
}

export async function listTemplates(voterId?: string) {
  if (getDatabaseUrl()) return neonList(voterId);
  return fileList(voterId);
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
  if (getDatabaseUrl()) {
    await ensureNeon();
    const db = sql();
    const duplicate = (await db`
      SELECT slug FROM templates WHERE bot_id = ${template.botId} LIMIT 1
    `) as { slug: string }[];
    if (duplicate[0]) {
      return {
        ok: false as const,
        error: "That Grok Bot is already in the gallery.",
        slug: duplicate[0].slug,
      };
    }
    let slug = template.slug;
    let n = 2;
    while (
      ((await db`SELECT 1 FROM templates WHERE slug = ${slug} LIMIT 1`) as unknown[])
        .length > 0
    ) {
      slug = `${template.slug}-${n}`;
      n += 1;
    }
    const saved = { ...template, slug };
    await db`
      INSERT INTO templates (
        id, slug, bot_id, bot_url, title, author_name, summary, description,
        og_image, category, tags, note, submitted_by, origin, featured, created_at, adds
      ) VALUES (
        ${saved.id}, ${saved.slug}, ${saved.botId}, ${saved.botUrl}, ${saved.title},
        ${saved.authorName}, ${saved.summary}, ${saved.description}, ${saved.ogImage ?? null},
        ${saved.category}, ${saved.tags}, ${saved.note ?? null}, ${saved.submittedBy},
        ${saved.origin}, ${saved.featured}, ${saved.createdAt}, ${saved.adds}
      )
    `;
    return {
      ok: true as const,
      template: { ...saved, score: 0, userVote: 0 as const },
    };
  }

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
    const written = await writeStore(store);
    if (!written) {
      return {
        ok: false as const,
        error:
          "This host cannot save listings. Set DATABASE_URL to a Neon pooled connection string.",
      };
    }
    return {
      ok: true as const,
      template: { ...saved, score: 0, userVote: 0 as const },
    };
  });
}

export async function incrementAdds(slug: string) {
  if (getDatabaseUrl()) {
    await ensureNeon();
    const db = sql();
    await db`UPDATE templates SET adds = adds + 1 WHERE slug = ${slug}`;
    return;
  }
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
  if (getDatabaseUrl()) {
    await ensureNeon();
    const db = sql();
    const exists = (await db`
      SELECT slug FROM templates WHERE id = ${templateId} LIMIT 1
    `) as { slug: string }[];
    if (!exists[0]) return null;
    const current = (await db`
      SELECT value FROM votes
      WHERE voter_id = ${voterId} AND template_id = ${templateId}
      LIMIT 1
    `) as { value: number }[];
    if (current[0]?.value === value) {
      await db`
        DELETE FROM votes WHERE voter_id = ${voterId} AND template_id = ${templateId}
      `;
    } else {
      await db`
        INSERT INTO votes (voter_id, template_id, value)
        VALUES (${voterId}, ${templateId}, ${value})
        ON CONFLICT (voter_id, template_id) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    const listed = await neonList(voterId);
    return listed.find((template) => template.id === templateId) ?? null;
  }

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
