import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SEED_TEMPLATES, SEED_VOTES } from "@/data/seed";
import { ALREADY_LISTED, HANDLE_ALREADY_SET } from "./bot-url";
import { getDatabaseUrl, sql } from "./db";
import { extendBoostedUntil } from "./boost";
import {
  HOME_HTML_CACHE_URL,
  LIVE_TEMPLATES_CACHE_KEY,
  LIVE_TEMPLATES_KV_TTL,
  LIVE_TEMPLATES_MEMORY_MS,
} from "./edge-cache";
import { extendFeaturedUntil } from "./featured";
import { applyBallot } from "./vote";
import type { VoteResult } from "./vote";
import { markFromStored, sanitizeMark, serializeMark } from "./bot-mark";
import type {
  BotMark,
  BotTemplate,
  ListedTemplate,
  TemplateOrigin,
  Vote,
  VoteValue,
} from "./types";

export type { VoteResult };

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "templates.json");

type StripeSessionRecord = {
  sessionId: string;
  kind: "tip" | "featured" | "boost";
  templateId?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

type StoreFile = {
  templates: BotTemplate[];
  votes: Vote[];
  stripeSessions?: StripeSessionRecord[];
};

type TemplateRow = {
  id: string;
  slug: string;
  bot_id: string;
  bot_url: string;
  title: string;
  author_name: string;
  x_handle?: string | null;
  summary: string;
  description: string;
  og_image: string | null;
  mark?: string | BotMark | null;
  category: string;
  tags: string[];
  note: string | null;
  submitted_by: string;
  origin: string;
  featured: boolean;
  featured_until?: string | Date | null;
  boosted_until?: string | Date | null;
  created_at: string | Date;
  adds: number;
  live?: boolean | null;
  last_checked_at?: string | Date | null;
  skills?: string[] | null;
  routines?: string[] | null;
  score?: number | string | null;
};

export type ListingCheckUpdate = {
  id: string;
  live: boolean;
  lastCheckedAt: string;
  ogImage?: string;
  mark?: BotMark;
  skills?: string[];
  routines?: string[];
  title?: string;
  authorName?: string;
  description?: string;
  summary?: string;
};

let queue: Promise<unknown> = Promise.resolve();
let schemaReady: Promise<void> | null = null;
let liveMemory: { at: number; templates: ListedTemplate[] } | null = null;
let liveInflight: Promise<ListedTemplate[]> | null = null;
let liveGeneration = 0;

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
    ...normalizeTemplate(template),
    score: scores.get(template.id) ?? 0,
    userVote: mine.get(template.id) ?? 0,
  }));
}

function normalizeTemplate(
  template: BotTemplate & { category?: string }
): BotTemplate {
  const rest = { ...template };
  delete rest.category;
  return {
    ...rest,
    live: rest.live !== false,
    lastCheckedAt: rest.lastCheckedAt,
    skills: rest.skills ?? [],
    routines: rest.routines ?? [],
    featuredUntil: rest.featuredUntil,
    featured: rest.featured,
    boostedUntil: rest.boostedUntil,
    xHandle: rest.xHandle?.trim() || undefined,
    mark: sanitizeMark(rest.mark),
  };
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
    xHandle: row.x_handle?.trim() || undefined,
    summary: row.summary,
    description: row.description,
    ogImage: row.og_image ?? undefined,
    mark: markFromStored(row.mark),
    tags: row.tags ?? [],
    note: row.note ?? undefined,
    submittedBy: row.submitted_by,
    origin: row.origin as TemplateOrigin,
    featured: row.featured,
    featuredUntil:
      row.featured_until instanceof Date
        ? row.featured_until.toISOString()
        : row.featured_until
          ? new Date(row.featured_until).toISOString()
          : undefined,
    boostedUntil:
      row.boosted_until instanceof Date
        ? row.boosted_until.toISOString()
        : row.boosted_until
          ? new Date(row.boosted_until).toISOString()
          : undefined,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
    adds: Number(row.adds) || 0,
    live: row.live !== false,
    lastCheckedAt:
      row.last_checked_at instanceof Date
        ? row.last_checked_at.toISOString()
        : row.last_checked_at
          ? new Date(row.last_checked_at).toISOString()
          : undefined,
    skills: row.skills ?? [],
    routines: row.routines ?? [],
  };
}

export function isMissingRelation(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /42P01/i.test(message) || /relation ".+" does not exist/i.test(message);
}

export function applyUserVotes(
  listed: ListedTemplate[],
  votes: Iterable<{ templateId: string; value: VoteValue }>
): ListedTemplate[] {
  const mine = new Map<string, VoteValue>();
  for (const vote of votes) mine.set(vote.templateId, vote.value);
  if (mine.size === 0) {
    return listed.map((template) =>
      template.userVote === 0 ? template : { ...template, userVote: 0 }
    );
  }
  return listed.map((template) => ({
    ...template,
    userVote: mine.get(template.id) ?? 0,
  }));
}

function publicListed(listed: ListedTemplate[]): ListedTemplate[] {
  return listed.map((template) =>
    template.userVote === 0 ? template : { ...template, userVote: 0 }
  );
}

type TemplatesKv = {
  get: (key: string, type: "text") => Promise<string | null>;
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

let kvMemo: TemplatesKv | null | "skip" = null;

async function siteKv() {
  if (kvMemo === "skip") return undefined;
  if (kvMemo) return kvMemo;
  // OpenNext's Cloudflare context can hang in `next dev`. Memory cache is enough locally.
  if (process.env.NODE_ENV !== "production") {
    kvMemo = "skip";
    return undefined;
  }
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await Promise.race([
      getCloudflareContext({ async: true }),
      new Promise<undefined>((resolve) => setTimeout(resolve, 80)),
    ]);
    const kv = ctx?.env?.TEMPLATES as TemplatesKv | undefined;
    kvMemo = kv ?? "skip";
    return kv;
  } catch {
    kvMemo = "skip";
    return undefined;
  }
}

export async function invalidateTemplateListCache() {
  liveGeneration += 1;
  liveMemory = null;
  liveInflight = null;
  try {
    const kv = await siteKv();
    await kv?.delete(LIVE_TEMPLATES_CACHE_KEY);
  } catch {
    // Local or missing KV should not fail writes.
  }
  try {
    const edge =
      typeof caches === "undefined"
        ? undefined
        : (caches as unknown as { default?: { delete: (request: Request) => Promise<boolean> } })
            .default;
    await edge?.delete(new Request(HOME_HTML_CACHE_URL, { method: "GET" }));
  } catch {
    // Cache API is only available in the Worker runtime.
  }
}

async function readLiveKvList(): Promise<ListedTemplate[] | null> {
  try {
    const kv = await siteKv();
    const raw = await kv?.get(LIVE_TEMPLATES_CACHE_KEY, "text");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListedTemplate[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeLiveListCache(listed: ListedTemplate[]) {
  const templates = publicListed(listed);
  liveMemory = { at: Date.now(), templates };
  try {
    const kv = await siteKv();
    await kv?.put(LIVE_TEMPLATES_CACHE_KEY, JSON.stringify(templates), {
      expirationTtl: LIVE_TEMPLATES_KV_TTL,
    });
  } catch {
    // Local or missing KV should not fail reads.
  }
}

async function ensureNeon() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      const statements = [
        db`CREATE TABLE IF NOT EXISTS templates (
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
        )`,
        db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS live boolean NOT NULL DEFAULT true`,
        db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS last_checked_at timestamptz`,
        db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}'`,
        db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS routines text[] NOT NULL DEFAULT '{}'`,
        db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS featured_until timestamptz`,
        db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS boosted_until timestamptz`,
        db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS x_handle text`,
        db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS mark text`,
        db`CREATE TABLE IF NOT EXISTS stripe_sessions (
          session_id text PRIMARY KEY,
          kind text NOT NULL,
          template_id text,
          amount integer,
          currency text NOT NULL DEFAULT 'usd',
          status text NOT NULL,
          created_at timestamptz NOT NULL
        )`,
        db`CREATE TABLE IF NOT EXISTS votes (
          voter_id text NOT NULL,
          template_id text NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
          value smallint NOT NULL CHECK (value IN (-1, 1)),
          PRIMARY KEY (voter_id, template_id)
        )`,
        db`CREATE INDEX IF NOT EXISTS votes_template_id_idx ON votes (template_id)`,
      ];

      for (const seed of SEED_TEMPLATES) {
        statements.push(db`
          INSERT INTO templates (
            id, slug, bot_id, bot_url, title, author_name, summary, description,
            og_image, category, tags, note, submitted_by, origin, featured, created_at, adds
          ) VALUES (
            ${seed.id}, ${seed.slug}, ${seed.botId}, ${seed.botUrl}, ${seed.title},
            ${seed.authorName}, ${seed.summary}, ${seed.description},             ${seed.ogImage ?? null},
            ${""}, ${seed.tags}, ${seed.note ?? null}, ${seed.submittedBy},
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
        `);
      }

      for (const vote of SEED_VOTES) {
        statements.push(db`
          INSERT INTO votes (voter_id, template_id, value)
          VALUES (${vote.voterId}, ${vote.templateId}, ${vote.value})
          ON CONFLICT (voter_id, template_id) DO NOTHING
        `);
      }

      statements.push(db`DELETE FROM templates WHERE id = 'seed-jarvis'`);
      statements.push(db`
        UPDATE templates
        SET origin = 'community', featured = false
        WHERE origin = 'curated'
      `);
      await db.transaction(statements);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

async function neonSelectListed(includeDown: boolean) {
  const db = sql();
  if (includeDown) {
    return (await db`
      SELECT t.*, COALESCE(v.score, 0)::int AS score
      FROM templates t
      LEFT JOIN (
        SELECT template_id, SUM(value)::int AS score
        FROM votes
        GROUP BY template_id
      ) v ON v.template_id = t.id
    `) as TemplateRow[];
  }
  return (await db`
    SELECT t.*, COALESCE(v.score, 0)::int AS score
    FROM templates t
    LEFT JOIN (
      SELECT template_id, SUM(value)::int AS score
      FROM votes
      GROUP BY template_id
    ) v ON v.template_id = t.id
    WHERE t.live IS NOT FALSE
  `) as TemplateRow[];
}

async function neonVoterVotes(voterId: string) {
  const db = sql();
  return (await db`
    SELECT template_id, value FROM votes WHERE voter_id = ${voterId}
  `) as { template_id: string; value: number }[];
}

function rowsToListed(
  rows: TemplateRow[],
  voterVotes?: { template_id: string; value: number }[]
): ListedTemplate[] {
  const mine = new Map<string, VoteValue>();
  if (voterVotes) {
    for (const vote of voterVotes) {
      mine.set(vote.template_id, vote.value as VoteValue);
    }
  }
  return rows.map((row) => ({
    ...normalizeTemplate(rowToTemplate(row)),
    score: Number(row.score) || 0,
    userVote: mine.get(row.id) ?? 0,
  }));
}

async function neonList(
  voterId?: string,
  includeDown = false
): Promise<ListedTemplate[]> {
  try {
    const rows = await neonSelectListed(includeDown);
    const votes = voterId ? await neonVoterVotes(voterId) : undefined;
    return rowsToListed(rows, votes);
  } catch (error) {
    if (!isMissingRelation(error)) throw error;
    await ensureNeon();
    const rows = await neonSelectListed(includeDown);
    const votes = voterId ? await neonVoterVotes(voterId) : undefined;
    return rowsToListed(rows, votes);
  }
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
      stripeSessions: Array.isArray(parsed.stripeSessions)
        ? parsed.stripeSessions
        : [],
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

async function fileList(voterId?: string, includeDown = false) {
  return withLock(async () => {
    const store = await readStore();
    const templates = includeDown
      ? store.templates
      : store.templates.filter((template) => template.live !== false);
    return toListed(templates, store.votes, voterId);
  });
}

async function loadListed(voterId: string | undefined, includeDown: boolean) {
  if (getDatabaseUrl()) return neonList(voterId, includeDown);
  return fileList(voterId, includeDown);
}

async function loadLiveListed() {
  const now = Date.now();
  if (liveMemory && now - liveMemory.at < LIVE_TEMPLATES_MEMORY_MS) {
    return liveMemory.templates;
  }
  if (liveInflight) return liveInflight;
  const generation = liveGeneration;
  liveInflight = (async () => {
    try {
      const origin = loadListed(undefined, false);
      const fromKv = await readLiveKvList();
      if (fromKv) {
        if (generation === liveGeneration) {
          liveMemory = { at: Date.now(), templates: fromKv };
        }
        void origin.then(
          (listed) => {
            if (generation === liveGeneration) {
              void writeLiveListCache(publicListed(listed));
            }
          },
          () => undefined
        );
        return fromKv;
      }
      const listed = publicListed(await origin);
      if (generation === liveGeneration) await writeLiveListCache(listed);
      return listed;
    } finally {
      if (generation === liveGeneration) liveInflight = null;
    }
  })();
  return liveInflight;
}

export async function listTemplates(
  voterId?: string,
  options: { includeDown?: boolean } = {}
) {
  const includeDown = options.includeDown === true;
  if (includeDown || voterId) return loadListed(voterId, includeDown);
  return loadLiveListed();
}

export async function getTemplate(slug: string, voterId?: string) {
  const templates = await listTemplates(voterId, { includeDown: true });
  return templates.find((template) => template.slug === slug) ?? null;
}

export async function findByBotId(botId: string, voterId?: string) {
  const templates = await listTemplates(voterId, { includeDown: true });
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
      SELECT slug, x_handle FROM templates WHERE bot_id = ${template.botId} LIMIT 1
    `) as { slug: string; x_handle?: string | null }[];
    if (duplicate[0]) {
      return {
        ok: false as const,
        error: ALREADY_LISTED,
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
    const saved = normalizeTemplate({ ...template, slug });
    await db`
      INSERT INTO templates (
        id, slug, bot_id, bot_url, title, author_name, x_handle, summary, description,
        og_image, category, tags, note, submitted_by, origin, featured, featured_until, boosted_until, created_at, adds,
        live, last_checked_at, skills, routines, mark
      ) VALUES (
        ${saved.id}, ${saved.slug}, ${saved.botId}, ${saved.botUrl}, ${saved.title},
        ${saved.authorName}, ${saved.xHandle ?? null}, ${saved.summary}, ${saved.description},         ${saved.ogImage ?? null},
        ${""}, ${saved.tags}, ${saved.note ?? null}, ${saved.submittedBy},
        ${saved.origin}, ${saved.featured}, ${saved.featuredUntil ?? null}, ${saved.boostedUntil ?? null}, ${saved.createdAt}, ${saved.adds},
        ${saved.live}, ${saved.lastCheckedAt ?? null}, ${saved.skills}, ${saved.routines}, ${serializeMark(saved.mark)}
      )
    `;
    await invalidateTemplateListCache();
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
        error: ALREADY_LISTED,
        slug: duplicate.slug,
      };
    }
    let slug = template.slug;
    let n = 2;
    while (store.templates.some((item) => item.slug === slug)) {
      slug = `${template.slug}-${n}`;
      n += 1;
    }
    const saved = normalizeTemplate({ ...template, slug });
    store.templates.push(saved);
    const written = await writeStore(store);
    if (!written) {
      return {
        ok: false as const,
        error:
          "This host cannot save listings. Set DATABASE_URL to a Neon pooled connection string.",
      };
    }
    await invalidateTemplateListCache();
    return {
      ok: true as const,
      template: { ...saved, score: 0, userVote: 0 as const },
    };
  });
}

export type LinkXHandleResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; slug?: string };

function sameHandle(left?: string | null, right?: string | null) {
  return (left ?? "").trim().toLowerCase() === (right ?? "").trim().toLowerCase();
}

export async function linkXHandleIfEmpty(
  botId: string,
  handle: string
): Promise<LinkXHandleResult> {
  if (getDatabaseUrl()) {
    await ensureNeon();
    const db = sql();
    const written = (await db`
      UPDATE templates
      SET x_handle = ${handle}
      WHERE bot_id = ${botId}
        AND (x_handle IS NULL OR x_handle = '')
      RETURNING slug
    `) as { slug: string }[];
    if (written[0]) {
      await invalidateTemplateListCache();
      return { ok: true, slug: written[0].slug };
    }
    const current = (await db`
      SELECT slug, x_handle FROM templates WHERE bot_id = ${botId} LIMIT 1
    `) as { slug: string; x_handle?: string | null }[];
    if (!current[0]) {
      return { ok: false, error: "That Grok Bot is not listed yet." };
    }
    if (sameHandle(current[0].x_handle, handle)) {
      return { ok: true, slug: current[0].slug };
    }
    return {
      ok: false,
      error: HANDLE_ALREADY_SET,
      slug: current[0].slug,
    };
  }

  return withLock(async () => {
    const store = await readStore();
    const index = store.templates.findIndex((item) => item.botId === botId);
    if (index < 0) {
      return { ok: false, error: "That Grok Bot is not listed yet." };
    }
    const current = store.templates[index];
    if (current.xHandle) {
      if (sameHandle(current.xHandle, handle)) {
        return { ok: true, slug: current.slug };
      }
      return {
        ok: false,
        error: HANDLE_ALREADY_SET,
        slug: current.slug,
      };
    }
    store.templates[index] = normalizeTemplate({
      ...current,
      xHandle: handle,
    });
    const written = await writeStore(store);
    if (!written) {
      return {
        ok: false,
        error:
          "This host cannot save listings. Set DATABASE_URL to a Neon pooled connection string.",
      };
    }
    await invalidateTemplateListCache();
    return { ok: true, slug: current.slug };
  });
}

export type ListingPatch = {
  title?: string;
  authorName?: string;
  description?: string;
  summary?: string;
  ogImage?: string;
  mark?: BotMark;
  skills?: string[];
  routines?: string[];
  live?: boolean;
  lastCheckedAt?: string;
  tags?: string[];
  note?: string | null;
  submittedBy?: string;
};

export type UpdateListingResult =
  | { ok: true; template: ListedTemplate }
  | { ok: false; error: string; slug?: string };

function applyListingPatch(
  current: BotTemplate,
  patch: ListingPatch
): BotTemplate {
  const note =
    patch.note === null
      ? undefined
      : patch.note !== undefined
        ? patch.note
        : current.note;
  return normalizeTemplate({
    ...current,
    title: patch.title ?? current.title,
    authorName: patch.authorName ?? current.authorName,
    description: patch.description ?? current.description,
    summary: patch.summary ?? current.summary,
    ogImage: patch.ogImage ?? current.ogImage,
    mark: patch.mark ?? current.mark,
    skills: patch.skills ?? current.skills,
    routines: patch.routines ?? current.routines,
    live: patch.live ?? current.live,
    lastCheckedAt: patch.lastCheckedAt ?? current.lastCheckedAt,
    tags: patch.tags ?? current.tags,
    note,
    submittedBy: patch.submittedBy ?? current.submittedBy,
  });
}

async function neonListedByBotId(botId: string) {
  const db = sql();
  const rows = (await db`
    SELECT t.*, COALESCE(v.score, 0)::int AS score
    FROM templates t
    LEFT JOIN (
      SELECT template_id, SUM(value)::int AS score
      FROM votes
      GROUP BY template_id
    ) v ON v.template_id = t.id
    WHERE t.bot_id = ${botId}
    LIMIT 1
  `) as TemplateRow[];
  return rowsToListed(rows)[0] ?? null;
}

export async function updateListingFromShare(
  botId: string,
  patch: ListingPatch
): Promise<UpdateListingResult> {
  if (getDatabaseUrl()) {
    await ensureNeon();
    const current = await neonListedByBotId(botId);
    if (!current) {
      return { ok: false, error: "That Grok Bot is not listed yet." };
    }
    const next = applyListingPatch(current, patch);
    const db = sql();
    await db`
      UPDATE templates
      SET
        title = ${next.title},
        author_name = ${next.authorName},
        summary = ${next.summary},
        description = ${next.description},
        og_image = ${next.ogImage ?? null},
        mark = COALESCE(${serializeMark(next.mark)}, mark),
        tags = ${next.tags},
        note = ${next.note ?? null},
        submitted_by = ${next.submittedBy},
        live = ${next.live},
        last_checked_at = ${next.lastCheckedAt ?? null},
        skills = ${next.skills},
        routines = ${next.routines}
      WHERE bot_id = ${botId}
    `;
    await invalidateTemplateListCache();
    const listed = await neonListedByBotId(botId);
    if (!listed) {
      return { ok: false, error: "That Grok Bot is not listed yet." };
    }
    return { ok: true, template: listed };
  }

  return withLock(async () => {
    const store = await readStore();
    const index = store.templates.findIndex((item) => item.botId === botId);
    if (index < 0) {
      return { ok: false, error: "That Grok Bot is not listed yet." };
    }
    const current = normalizeTemplate(store.templates[index]);
    store.templates[index] = applyListingPatch(current, patch);
    const written = await writeStore(store);
    if (!written) {
      return {
        ok: false,
        error:
          "This host cannot save listings. Set DATABASE_URL to a Neon pooled connection string.",
        slug: current.slug,
      };
    }
    await invalidateTemplateListCache();
    const listed = toListed(store.templates, store.votes).find(
      (item) => item.botId === botId
    );
    if (!listed) {
      return { ok: false, error: "That Grok Bot is not listed yet." };
    }
    return { ok: true, template: listed };
  });
}

export async function incrementAdds(slug: string) {
  if (getDatabaseUrl()) {
    await ensureNeon();
    const db = sql();
    await db`UPDATE templates SET adds = adds + 1 WHERE slug = ${slug}`;
    await invalidateTemplateListCache();
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
    await invalidateTemplateListCache();
  });
}

type VoteRow = {
  slug: string;
  score: number | string | null;
  user_vote: number | string | null;
};

function voteResult(row: VoteRow | undefined): VoteResult | null {
  if (!row) return null;
  const userVote = Number(row.user_vote) || 0;
  return {
    slug: row.slug,
    score: Number(row.score) || 0,
    userVote: userVote === 1 || userVote === -1 ? userVote : 0,
  };
}

async function neonSetVote(
  voterId: string,
  templateId: string,
  value: VoteValue
): Promise<VoteResult | null> {
  const db = sql();
  const results = (await db.transaction([
    db`
      WITH deleted AS (
        DELETE FROM votes
        WHERE voter_id = ${voterId}
          AND template_id = ${templateId}
          AND value = ${value}
        RETURNING 1
      )
      INSERT INTO votes (voter_id, template_id, value)
      SELECT ${voterId}, ${templateId}, ${value}
      WHERE NOT EXISTS (SELECT 1 FROM deleted)
        AND EXISTS (SELECT 1 FROM templates WHERE id = ${templateId})
      ON CONFLICT (voter_id, template_id) DO UPDATE SET value = EXCLUDED.value
    `,
    db`
      SELECT
        t.slug,
        COALESCE(v.score, 0)::int AS score,
        COALESCE(mine.value, 0)::int AS user_vote
      FROM templates t
      LEFT JOIN (
        SELECT SUM(value)::int AS score
        FROM votes
        WHERE template_id = ${templateId}
      ) v ON true
      LEFT JOIN votes mine
        ON mine.template_id = t.id AND mine.voter_id = ${voterId}
      WHERE t.id = ${templateId}
      LIMIT 1
    `,
  ])) as [unknown, VoteRow[]];
  return voteResult(results[1]?.[0]);
}

export async function setVote(
  voterId: string,
  templateId: string,
  value: VoteValue
): Promise<VoteResult | null> {
  if (getDatabaseUrl()) {
    try {
      await ensureNeon();
      const updated = await neonSetVote(voterId, templateId, value);
      if (updated) await invalidateTemplateListCache();
      return updated;
    } catch (error) {
      if (!isMissingRelation(error)) throw error;
      await ensureNeon();
      const updated = await neonSetVote(voterId, templateId, value);
      if (updated) await invalidateTemplateListCache();
      return updated;
    }
  }

  return withLock(async () => {
    const store = await readStore();
    const template = store.templates.find((item) => item.id === templateId);
    if (!template) return null;
    store.votes = applyBallot(store.votes, voterId, templateId, value);
    await writeStore(store);
    await invalidateTemplateListCache();
    const listed = toListed(store.templates, store.votes, voterId);
    const item = listed.find((row) => row.id === templateId);
    if (!item) return null;
    return {
      slug: item.slug,
      score: item.score,
      userVote: item.userVote,
    };
  });
}

const STALE_MS = 12 * 60 * 60 * 1000;

function isDue(template: BotTemplate) {
  if (!template.mark) return true;
  if (!template.lastCheckedAt) return true;
  const then = Date.parse(template.lastCheckedAt);
  if (!Number.isFinite(then)) return true;
  return Date.now() - then >= STALE_MS;
}

export async function listDueForCheck(limit = 15): Promise<BotTemplate[]> {
  const listed = await listTemplates(undefined, { includeDown: true });
  return listed
    .filter(isDue)
    .sort((a, b) => {
      const aTime = a.lastCheckedAt ? Date.parse(a.lastCheckedAt) : 0;
      const bTime = b.lastCheckedAt ? Date.parse(b.lastCheckedAt) : 0;
      return aTime - bTime;
    })
    .slice(0, limit);
}

export function checkedIdentity(update: {
  title?: string;
  authorName?: string;
  description?: string;
  summary?: string;
}) {
  const title = update.title?.trim();
  const authorName = update.authorName?.trim();
  const description = update.description?.trim();
  const summary = update.summary?.trim();
  return {
    title: title && title !== "Untitled bot" ? title : undefined,
    authorName:
      authorName && authorName !== "Unknown" ? authorName : undefined,
    description: description || undefined,
    summary: summary || undefined,
  };
}

export async function applyListingCheck(update: ListingCheckUpdate) {
  const identity = checkedIdentity(update);
  if (getDatabaseUrl()) {
    await ensureNeon();
    const db = sql();
    const ogImage = update.ogImage ?? null;
    const mark = serializeMark(update.mark);
    const title = identity.title ?? null;
    const authorName = identity.authorName ?? null;
    const description = identity.description ?? null;
    const summary = identity.summary ?? null;
    if (update.skills && update.routines) {
      await db`
        UPDATE templates
        SET
          live = ${update.live},
          last_checked_at = ${update.lastCheckedAt},
          og_image = COALESCE(${ogImage}, og_image),
          mark = COALESCE(${mark}, mark),
          skills = ${update.skills},
          routines = ${update.routines},
          title = COALESCE(${title}, title),
          author_name = COALESCE(${authorName}, author_name),
          description = COALESCE(${description}, description),
          summary = COALESCE(${summary}, summary)
        WHERE id = ${update.id}
      `;
      await invalidateTemplateListCache();
      return;
    }
    await db`
      UPDATE templates
      SET
        live = ${update.live},
        last_checked_at = ${update.lastCheckedAt},
        title = COALESCE(${title}, title),
        author_name = COALESCE(${authorName}, author_name),
        description = COALESCE(${description}, description),
        summary = COALESCE(${summary}, summary)
      WHERE id = ${update.id}
    `;
    await invalidateTemplateListCache();
    return;
  }

  return withLock(async () => {
    const store = await readStore();
    const index = store.templates.findIndex(
      (template) => template.id === update.id
    );
    if (index === -1) return;
    const current = normalizeTemplate(store.templates[index]);
    store.templates[index] = {
      ...current,
      live: update.live,
      lastCheckedAt: update.lastCheckedAt,
      ogImage: update.ogImage ?? current.ogImage,
      mark: update.mark ?? current.mark,
      skills: update.skills ?? current.skills,
      routines: update.routines ?? current.routines,
      title: identity.title ?? current.title,
      authorName: identity.authorName ?? current.authorName,
      description: identity.description ?? current.description,
      summary: identity.summary ?? current.summary,
    };
    await writeStore(store);
    await invalidateTemplateListCache();
  });
}

export async function expireFeatured(now = new Date()) {
  const iso = now.toISOString();
  if (getDatabaseUrl()) {
    await ensureNeon();
    const db = sql();
    await db`
      UPDATE templates
      SET featured = false
      WHERE featured = true
        AND featured_until IS NOT NULL
        AND featured_until < ${iso}
    `;
    await invalidateTemplateListCache();
    return;
  }

  return withLock(async () => {
    const store = await readStore();
    let changed = false;
    store.templates = store.templates.map((template) => {
      if (
        template.featured &&
        template.featuredUntil &&
        Date.parse(template.featuredUntil) < now.getTime()
      ) {
        changed = true;
        return { ...template, featured: false };
      }
      return template;
    });
    if (changed) {
      await writeStore(store);
      await invalidateTemplateListCache();
    }
  });
}

export type AppliedCheckout =
  | { applied: false; reason: string }
  | { applied: true; kind: "tip" | "featured" | "boost"; templateId?: string };

export async function applyPaidCheckout(input: {
  sessionId: string;
  kind: "tip" | "featured" | "boost";
  templateId?: string;
  durationDays?: number;
  amount: number;
  now?: Date;
}): Promise<AppliedCheckout> {
  const now = input.now ?? new Date();
  const record: StripeSessionRecord = {
    sessionId: input.sessionId,
    kind: input.kind,
    templateId: input.templateId,
    amount: input.amount,
    currency: "usd",
    status: "paid",
    createdAt: now.toISOString(),
  };

  if (getDatabaseUrl()) {
    await ensureNeon();
    const db = sql();
    const existing = (await db`
      SELECT session_id FROM stripe_sessions
      WHERE session_id = ${input.sessionId}
      LIMIT 1
    `) as { session_id: string }[];
    if (existing[0]) {
      return { applied: false, reason: "already" };
    }

    if (input.kind === "featured") {
      if (!input.templateId || !input.durationDays) {
        return { applied: false, reason: "missing-featured-fields" };
      }
      const rows = (await db`
        SELECT featured_until FROM templates WHERE id = ${input.templateId} LIMIT 1
      `) as { featured_until: string | Date | null }[];
      if (!rows[0]) {
        return { applied: false, reason: "missing-listing" };
      }
      const currentUntil =
        rows[0].featured_until instanceof Date
          ? rows[0].featured_until.toISOString()
          : rows[0].featured_until
            ? new Date(rows[0].featured_until).toISOString()
            : undefined;
      const nextUntil = extendFeaturedUntil(
        currentUntil,
        input.durationDays,
        now
      );
      await db`
        UPDATE templates
        SET featured = true, featured_until = ${nextUntil}
        WHERE id = ${input.templateId}
      `;
    }

    if (input.kind === "boost") {
      if (!input.templateId || !input.durationDays) {
        return { applied: false, reason: "missing-boost-fields" };
      }
      const rows = (await db`
        SELECT boosted_until FROM templates WHERE id = ${input.templateId} LIMIT 1
      `) as { boosted_until: string | Date | null }[];
      if (!rows[0]) {
        return { applied: false, reason: "missing-listing" };
      }
      const currentUntil =
        rows[0].boosted_until instanceof Date
          ? rows[0].boosted_until.toISOString()
          : rows[0].boosted_until
            ? new Date(rows[0].boosted_until).toISOString()
            : undefined;
      const nextUntil = extendBoostedUntil(
        currentUntil,
        input.durationDays,
        now
      );
      await db`
        UPDATE templates
        SET boosted_until = ${nextUntil}
        WHERE id = ${input.templateId}
      `;
    }

    await db`
      INSERT INTO stripe_sessions (
        session_id, kind, template_id, amount, currency, status, created_at
      ) VALUES (
        ${record.sessionId}, ${record.kind}, ${record.templateId ?? null},
        ${record.amount}, ${record.currency}, ${record.status}, ${record.createdAt}
      )
    `;
    await invalidateTemplateListCache();
    return {
      applied: true,
      kind: input.kind,
      templateId: input.templateId,
    };
  }

  return withLock(async () => {
    const store = await readStore();
    store.stripeSessions ??= [];
    if (
      store.stripeSessions.some(
        (session) => session.sessionId === input.sessionId
      )
    ) {
      return { applied: false, reason: "already" };
    }
    if (input.kind === "featured") {
      if (!input.templateId || !input.durationDays) {
        return { applied: false, reason: "missing-featured-fields" };
      }
      const index = store.templates.findIndex(
        (template) => template.id === input.templateId
      );
      if (index === -1) {
        return { applied: false, reason: "missing-listing" };
      }
      const current = normalizeTemplate(store.templates[index]);
      const nextUntil = extendFeaturedUntil(
        current.featuredUntil,
        input.durationDays,
        now
      );
      store.templates[index] = {
        ...current,
        featured: true,
        featuredUntil: nextUntil,
      };
    }
    if (input.kind === "boost") {
      if (!input.templateId || !input.durationDays) {
        return { applied: false, reason: "missing-boost-fields" };
      }
      const index = store.templates.findIndex(
        (template) => template.id === input.templateId
      );
      if (index === -1) {
        return { applied: false, reason: "missing-listing" };
      }
      const current = normalizeTemplate(store.templates[index]);
      const nextUntil = extendBoostedUntil(
        current.boostedUntil,
        input.durationDays,
        now
      );
      store.templates[index] = {
        ...current,
        boostedUntil: nextUntil,
      };
    }
    store.stripeSessions.push(record);
    await writeStore(store);
    await invalidateTemplateListCache();
    return {
      applied: true,
      kind: input.kind,
      templateId: input.templateId,
    };
  });
}
