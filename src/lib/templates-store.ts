import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SEED_TEMPLATES, SEED_VOTES } from "@/data/seed";
import { ALREADY_LISTED } from "./bot-url";
import { getDatabaseUrl, sql } from "./db";
import { extendBoostedUntil } from "./boost";
import { extendFeaturedUntil } from "./featured";
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
  summary: string;
  description: string;
  og_image: string | null;
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
};

export type ListingCheckUpdate = {
  id: string;
  live: boolean;
  lastCheckedAt: string;
  ogImage?: string;
  skills?: string[];
  routines?: string[];
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
    ...normalizeTemplate(template),
    score: scores.get(template.id) ?? 0,
    userVote: mine.get(template.id) ?? 0,
  }));
}

function normalizeTemplate(template: BotTemplate): BotTemplate {
  return {
    ...template,
    live: template.live !== false,
    lastCheckedAt: template.lastCheckedAt,
    skills: template.skills ?? [],
    routines: template.routines ?? [],
    featuredUntil: template.featuredUntil,
    featured: template.featured,
    boostedUntil: template.boostedUntil,
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
    summary: row.summary,
    description: row.description,
    ogImage: row.og_image ?? undefined,
    category: row.category as Category,
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
      await db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS live boolean NOT NULL DEFAULT true`;
      await db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS last_checked_at timestamptz`;
      await db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}'`;
      await db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS routines text[] NOT NULL DEFAULT '{}'`;
      await db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS featured_until timestamptz`;
      await db`ALTER TABLE templates ADD COLUMN IF NOT EXISTS boosted_until timestamptz`;
      await db`CREATE TABLE IF NOT EXISTS stripe_sessions (
        session_id text PRIMARY KEY,
        kind text NOT NULL,
        template_id text,
        amount integer,
        currency text NOT NULL DEFAULT 'usd',
        status text NOT NULL,
        created_at timestamptz NOT NULL
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

async function neonList(
  voterId?: string,
  includeDown = false
): Promise<ListedTemplate[]> {
  await ensureNeon();
  const db = sql();
  const templates = (
    includeDown
      ? await db`SELECT * FROM templates`
      : await db`SELECT * FROM templates WHERE live IS NOT FALSE`
  ) as TemplateRow[];
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

export async function listTemplates(
  voterId?: string,
  options: { includeDown?: boolean } = {}
) {
  const includeDown = options.includeDown === true;
  if (getDatabaseUrl()) return neonList(voterId, includeDown);
  return fileList(voterId, includeDown);
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
      SELECT slug FROM templates WHERE bot_id = ${template.botId} LIMIT 1
    `) as { slug: string }[];
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
        id, slug, bot_id, bot_url, title, author_name, summary, description,
        og_image, category, tags, note, submitted_by, origin, featured, featured_until, boosted_until, created_at, adds,
        live, last_checked_at, skills, routines
      ) VALUES (
        ${saved.id}, ${saved.slug}, ${saved.botId}, ${saved.botUrl}, ${saved.title},
        ${saved.authorName}, ${saved.summary}, ${saved.description}, ${saved.ogImage ?? null},
        ${saved.category}, ${saved.tags}, ${saved.note ?? null}, ${saved.submittedBy},
        ${saved.origin}, ${saved.featured}, ${saved.featuredUntil ?? null}, ${saved.boostedUntil ?? null}, ${saved.createdAt}, ${saved.adds},
        ${saved.live}, ${saved.lastCheckedAt ?? null}, ${saved.skills}, ${saved.routines}
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

const STALE_MS = 12 * 60 * 60 * 1000;

function isDue(template: BotTemplate) {
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

export async function applyListingCheck(update: ListingCheckUpdate) {
  if (getDatabaseUrl()) {
    await ensureNeon();
    const db = sql();
    const ogImage = update.ogImage ?? null;
    if (update.skills && update.routines) {
      await db`
        UPDATE templates
        SET
          live = ${update.live},
          last_checked_at = ${update.lastCheckedAt},
          og_image = COALESCE(${ogImage}, og_image),
          skills = ${update.skills},
          routines = ${update.routines}
        WHERE id = ${update.id}
      `;
      return;
    }
    await db`
      UPDATE templates
      SET live = ${update.live}, last_checked_at = ${update.lastCheckedAt}
      WHERE id = ${update.id}
    `;
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
      skills: update.skills ?? current.skills,
      routines: update.routines ?? current.routines,
    };
    await writeStore(store);
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
    if (changed) await writeStore(store);
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
    return {
      applied: true,
      kind: input.kind,
      templateId: input.templateId,
    };
  });
}
