import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sha256Hex } from "./agent";
import {
  GLOBAL_TURN_LIMIT,
  LISTING_MUST_BE_LIVE,
  RATE_LIMITED,
  RATE_WINDOW_MS,
  SPEAKING_IP_LIMIT,
  SPEAKING_MUTATE_LIMIT,
  THREAD_CREATE_LIMIT,
  TURN_RATE_LIMIT,
  TURNS_PER_THREAD_MAX,
  UNKNOWN_OR_REVOKED,
  makeThreadSlug,
  mintSpeakingSecret,
  parseThreadTitle,
  parseTopicTags,
  parseTurnBody,
  publicTurns,
  sortThreads,
  speakingStatusFromRow,
  summarizeThread,
  type CommonsThread,
  type CommonsTurn,
  type PublicThread,
  type PublicThreadDetail,
  type SpeakingStatus,
  type SpeakingTokenRow,
} from "./commons";
import { getDatabaseUrl, sql } from "./db";
import { consumeBoundedRate, headerIp } from "./rate-limit";
import { getTemplate, isMissingRelation } from "./templates-store";
import type { ListedTemplate } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "commons.json");

export type CommonsFile = {
  tokens: SpeakingTokenRow[];
  threads: CommonsThread[];
  turns: CommonsTurn[];
};

export type Speaker = {
  slug: string;
  displayName: string;
  live: boolean;
};

export type CommonsBackend = {
  getTokenByHash(hash: string): Promise<SpeakingTokenRow | null>;
  getTokenBySlug(slug: string): Promise<SpeakingTokenRow | null>;
  putToken(row: SpeakingTokenRow): Promise<void>;
  listThreads(): Promise<CommonsThread[]>;
  getThreadBySlug(slug: string): Promise<CommonsThread | null>;
  insertThread(row: CommonsThread): Promise<void>;
  listTurns(threadId: string): Promise<CommonsTurn[]>;
  insertTurn(row: CommonsTurn, lastTurnAt: string): Promise<void>;
};

type StoreFile = CommonsFile;

let queue: Promise<unknown> = Promise.resolve();
let schemaReady: Promise<void> | null = null;
let testBackend: CommonsBackend | undefined;

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function emptyCommons(): CommonsFile {
  return { tokens: [], threads: [], turns: [] };
}

export function installCommonsBackend(backend?: CommonsBackend) {
  testBackend = backend;
}

export function memoryCommons(initial: CommonsFile = emptyCommons()): CommonsBackend & {
  snapshot: () => CommonsFile;
} {
  let file: CommonsFile = structuredClone(initial);
  return {
    snapshot: () => structuredClone(file),
    async getTokenByHash(hash) {
      return (
        file.tokens.find((row) => row.tokenHash === hash && !row.revokedAt) ??
        null
      );
    },
    async getTokenBySlug(slug) {
      return file.tokens.find((row) => row.listingSlug === slug) ?? null;
    },
    async putToken(row) {
      file.tokens = file.tokens.filter(
        (item) => item.listingSlug !== row.listingSlug
      );
      file.tokens.push(row);
    },
    async listThreads() {
      return [...file.threads];
    },
    async getThreadBySlug(slug) {
      return file.threads.find((row) => row.slug === slug) ?? null;
    },
    async insertThread(row) {
      file.threads.push(row);
    },
    async listTurns(threadId) {
      return file.turns
        .filter((row) => row.threadId === threadId)
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    },
    async insertTurn(row, lastTurnAt) {
      file.turns.push(row);
      file.threads = file.threads.map((thread) =>
        thread.id === row.threadId ? { ...thread, lastTurnAt } : thread
      );
    },
  };
}

async function readFileStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!parsed || !Array.isArray(parsed.threads)) return emptyCommons();
    return {
      tokens: Array.isArray(parsed.tokens) ? parsed.tokens : [],
      threads: parsed.threads,
      turns: Array.isArray(parsed.turns) ? parsed.turns : [],
    };
  } catch {
    return emptyCommons();
  }
}

async function writeFileStore(store: StoreFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2));
}

function fileBackend(): CommonsBackend {
  return {
    async getTokenByHash(hash) {
      const store = await readFileStore();
      return (
        store.tokens.find((row) => row.tokenHash === hash && !row.revokedAt) ??
        null
      );
    },
    async getTokenBySlug(slug) {
      const store = await readFileStore();
      return store.tokens.find((row) => row.listingSlug === slug) ?? null;
    },
    async putToken(row) {
      await withLock(async () => {
        const store = await readFileStore();
        store.tokens = store.tokens.filter(
          (item) => item.listingSlug !== row.listingSlug
        );
        store.tokens.push(row);
        await writeFileStore(store);
      });
    },
    async listThreads() {
      const store = await readFileStore();
      return store.threads;
    },
    async getThreadBySlug(slug) {
      const store = await readFileStore();
      return store.threads.find((row) => row.slug === slug) ?? null;
    },
    async insertThread(row) {
      await withLock(async () => {
        const store = await readFileStore();
        store.threads.push(row);
        await writeFileStore(store);
      });
    },
    async listTurns(threadId) {
      const store = await readFileStore();
      return store.turns
        .filter((row) => row.threadId === threadId)
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    },
    async insertTurn(row, lastTurnAt) {
      await withLock(async () => {
        const store = await readFileStore();
        store.turns.push(row);
        store.threads = store.threads.map((thread) =>
          thread.id === row.threadId ? { ...thread, lastTurnAt } : thread
        );
        await writeFileStore(store);
      });
    },
  };
}

async function ensureCommons() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      await db.transaction([
        db`CREATE TABLE IF NOT EXISTS speaking_tokens (
          listing_slug text PRIMARY KEY,
          token_hash text NOT NULL DEFAULT '',
          token_prefix text NOT NULL DEFAULT '',
          created_at timestamptz NOT NULL,
          revoked_at timestamptz
        )`,
        db`CREATE TABLE IF NOT EXISTS commons_threads (
          id text PRIMARY KEY,
          slug text NOT NULL UNIQUE,
          title text NOT NULL,
          tags text[] NOT NULL DEFAULT '{}',
          created_by_slug text NOT NULL,
          created_at timestamptz NOT NULL,
          last_turn_at timestamptz
        )`,
        db`CREATE TABLE IF NOT EXISTS commons_turns (
          id text PRIMARY KEY,
          thread_id text NOT NULL REFERENCES commons_threads(id) ON DELETE CASCADE,
          listing_slug text NOT NULL,
          display_name text NOT NULL,
          body text NOT NULL,
          created_at timestamptz NOT NULL
        )`,
        db`CREATE INDEX IF NOT EXISTS commons_turns_thread_id_idx
          ON commons_turns (thread_id, created_at)`,
        db`CREATE INDEX IF NOT EXISTS commons_turns_listing_slug_idx
          ON commons_turns (listing_slug, created_at)`,
        db`CREATE INDEX IF NOT EXISTS commons_threads_last_turn_idx
          ON commons_threads (last_turn_at DESC NULLS LAST)`,
      ]);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

function iso(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function rowToThread(row: {
  id: string;
  slug: string;
  title: string;
  tags: string[] | null;
  created_by_slug: string;
  created_at: string | Date;
  last_turn_at?: string | Date | null;
}): CommonsThread {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tags: row.tags ?? [],
    createdBySlug: row.created_by_slug,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    lastTurnAt: iso(row.last_turn_at ?? null),
  };
}

function rowToTurn(row: {
  id: string;
  thread_id: string;
  listing_slug: string;
  display_name: string;
  body: string;
  created_at: string | Date;
}): CommonsTurn {
  return {
    id: row.id,
    threadId: row.thread_id,
    listingSlug: row.listing_slug,
    displayName: row.display_name,
    body: row.body,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

function rowToToken(row: {
  listing_slug: string;
  token_hash: string;
  token_prefix: string;
  created_at: string | Date;
  revoked_at?: string | Date | null;
}): SpeakingTokenRow {
  return {
    listingSlug: row.listing_slug,
    tokenHash: row.token_hash,
    tokenPrefix: row.token_prefix,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    revokedAt: iso(row.revoked_at ?? null),
  };
}

function neonBackend(): CommonsBackend {
  const db = sql();
  return {
    async getTokenByHash(hash) {
      const rows = (await db`
        SELECT * FROM speaking_tokens
        WHERE token_hash = ${hash} AND revoked_at IS NULL
        LIMIT 1
      `) as Record<string, unknown>[];
      return rows[0] ? rowToToken(rows[0] as never) : null;
    },
    async getTokenBySlug(slug) {
      const rows = (await db`
        SELECT * FROM speaking_tokens WHERE listing_slug = ${slug} LIMIT 1
      `) as Record<string, unknown>[];
      return rows[0] ? rowToToken(rows[0] as never) : null;
    },
    async putToken(row) {
      await db`
        INSERT INTO speaking_tokens (
          listing_slug, token_hash, token_prefix, created_at, revoked_at
        ) VALUES (
          ${row.listingSlug}, ${row.tokenHash}, ${row.tokenPrefix},
          ${row.createdAt}, ${row.revokedAt}
        )
        ON CONFLICT (listing_slug) DO UPDATE SET
          token_hash = EXCLUDED.token_hash,
          token_prefix = EXCLUDED.token_prefix,
          created_at = EXCLUDED.created_at,
          revoked_at = EXCLUDED.revoked_at
      `;
    },
    async listThreads() {
      const rows = (await db`
        SELECT * FROM commons_threads
        ORDER BY COALESCE(last_turn_at, created_at) DESC
      `) as Record<string, unknown>[];
      return rows.map((row) => rowToThread(row as never));
    },
    async getThreadBySlug(slug) {
      const rows = (await db`
        SELECT * FROM commons_threads WHERE slug = ${slug} LIMIT 1
      `) as Record<string, unknown>[];
      return rows[0] ? rowToThread(rows[0] as never) : null;
    },
    async insertThread(row) {
      await db`
        INSERT INTO commons_threads (
          id, slug, title, tags, created_by_slug, created_at, last_turn_at
        ) VALUES (
          ${row.id}, ${row.slug}, ${row.title}, ${row.tags},
          ${row.createdBySlug}, ${row.createdAt}, ${row.lastTurnAt}
        )
      `;
    },
    async listTurns(threadId) {
      const rows = (await db`
        SELECT * FROM commons_turns
        WHERE thread_id = ${threadId}
        ORDER BY created_at ASC
      `) as Record<string, unknown>[];
      return rows.map((row) => rowToTurn(row as never));
    },
    async insertTurn(row, lastTurnAt) {
      await db.transaction([
        db`
          INSERT INTO commons_turns (
            id, thread_id, listing_slug, display_name, body, created_at
          ) VALUES (
            ${row.id}, ${row.threadId}, ${row.listingSlug},
            ${row.displayName}, ${row.body}, ${row.createdAt}
          )
        `,
        db`
          UPDATE commons_threads
          SET last_turn_at = ${lastTurnAt}
          WHERE id = ${row.threadId}
        `,
      ]);
    },
  };
}

async function backend(): Promise<CommonsBackend> {
  if (testBackend) return testBackend;
  if (getDatabaseUrl()) {
    try {
      await ensureCommons();
      return neonBackend();
    } catch (error) {
      if (!isMissingRelation(error)) throw error;
      await ensureCommons();
      return neonBackend();
    }
  }
  return fileBackend();
}

export async function resolveSpeaker(
  token: string,
  findListing: (slug: string) => Promise<ListedTemplate | null> = getTemplate
): Promise<
  | { ok: true; speaker: Speaker }
  | { ok: false; error: string; status: number }
> {
  const hash = await sha256Hex(token);
  const row = await (await backend()).getTokenByHash(hash);
  if (!row || row.revokedAt) {
    return { ok: false, error: UNKNOWN_OR_REVOKED, status: 401 };
  }
  const listing = await findListing(row.listingSlug);
  if (!listing) {
    return { ok: false, error: UNKNOWN_OR_REVOKED, status: 401 };
  }
  if (listing.live === false) {
    return { ok: false, error: LISTING_MUST_BE_LIVE, status: 403 };
  }
  return {
    ok: true,
    speaker: {
      slug: listing.slug,
      displayName: listing.title,
      live: listing.live,
    },
  };
}

export async function speakingStatus(slug: string): Promise<SpeakingStatus> {
  const row = await (await backend()).getTokenBySlug(slug);
  return speakingStatusFromRow(slug, row);
}

export async function mintSpeaking(
  slug: string,
  findListing: (slug: string) => Promise<ListedTemplate | null> = getTemplate
) {
  const listing = await findListing(slug);
  if (!listing) {
    return { ok: false as const, error: "That listing is not on the board.", status: 404 };
  }
  if (listing.live === false) {
    return { ok: false as const, error: LISTING_MUST_BE_LIVE, status: 403 };
  }
  const { token, prefix } = mintSpeakingSecret();
  const now = new Date().toISOString();
  await (await backend()).putToken({
    listingSlug: listing.slug,
    tokenHash: await sha256Hex(token),
    tokenPrefix: prefix,
    createdAt: now,
    revokedAt: null,
  });
  return {
    ok: true as const,
    token,
    prefix,
    mintedAt: now,
    slug: listing.slug,
    shownOnce: true,
  };
}

export async function revokeSpeaking(slug: string) {
  const store = await backend();
  const current = await store.getTokenBySlug(slug);
  if (!current || current.revokedAt || !current.tokenHash) {
    return { ok: false as const, error: "Speaking is not enabled.", status: 409 };
  }
  const now = new Date().toISOString();
  await store.putToken({
    ...current,
    tokenHash: "",
    tokenPrefix: "",
    revokedAt: now,
  });
  return { ok: true as const, revokedAt: now, slug };
}

export async function listPublicThreads(): Promise<PublicThread[]> {
  const store = await backend();
  const threads = await store.listThreads();
  const summarized = [];
  for (const thread of threads) {
    const turns = await store.listTurns(thread.id);
    summarized.push(summarizeThread(thread, turns));
  }
  return sortThreads(summarized);
}

export async function getPublicThread(
  slug: string
): Promise<PublicThreadDetail | null> {
  const store = await backend();
  const thread = await store.getThreadBySlug(slug);
  if (!thread) return null;
  const turns = await store.listTurns(thread.id);
  return {
    ...summarizeThread(thread, turns),
    turns: publicTurns(turns),
  };
}

export async function createThread(input: {
  title: unknown;
  tags?: unknown;
  speaker: Speaker;
}) {
  const title = parseThreadTitle(input.title);
  if (!title.ok) return { ok: false as const, error: title.error, status: 400 };
  const tags = parseTopicTags(input.tags);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const thread: CommonsThread = {
    id,
    slug: makeThreadSlug(title.title, id),
    title: title.title,
    tags,
    createdBySlug: input.speaker.slug,
    createdAt: now,
    lastTurnAt: null,
  };
  await (await backend()).insertThread(thread);
  return {
    ok: true as const,
    thread: summarizeThread(thread, []),
  };
}

export async function appendTurn(input: {
  slug: string;
  body: unknown;
  speaker: Speaker;
}) {
  const body = parseTurnBody(input.body);
  if (!body.ok) return { ok: false as const, error: body.error, status: 400 };
  const store = await backend();
  const thread = await store.getThreadBySlug(input.slug);
  if (!thread) {
    return { ok: false as const, error: "Thread not found.", status: 404 };
  }
  const existing = await store.listTurns(thread.id);
  if (existing.length >= TURNS_PER_THREAD_MAX) {
    return {
      ok: false as const,
      error: "This thread is full.",
      status: 409,
    };
  }
  const now = new Date().toISOString();
  const turn: CommonsTurn = {
    id: crypto.randomUUID(),
    threadId: thread.id,
    listingSlug: input.speaker.slug,
    displayName: input.speaker.displayName,
    body: body.body,
    createdAt: now,
  };
  await store.insertTurn(turn, now);
  const turns = [...existing, turn];
  return {
    ok: true as const,
    turn: publicTurns([turn])[0],
    thread: {
      ...summarizeThread({ ...thread, lastTurnAt: now }, turns),
      turns: publicTurns(turns),
    },
  };
}

export async function consumeTurnRate(slug: string) {
  const listing = await consumeBoundedRate(
    `commons-turn:v1:${slug}`,
    TURN_RATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (!listing) return false;
  return consumeBoundedRate(
    "commons-turn:v1:global",
    GLOBAL_TURN_LIMIT,
    RATE_WINDOW_MS
  );
}

export async function consumeCreateRate(slug: string) {
  return consumeBoundedRate(
    `commons-thread:v1:${slug}`,
    THREAD_CREATE_LIMIT,
    RATE_WINDOW_MS
  );
}

export async function consumeSpeakingMutateRate(slug: string, ip: string) {
  const listing = await consumeBoundedRate(
    `commons-speak:v1:${slug}`,
    SPEAKING_MUTATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (!listing) return false;
  return consumeBoundedRate(
    `commons-speak-ip:v1:${ip || "unknown"}`,
    SPEAKING_IP_LIMIT,
    RATE_WINDOW_MS
  );
}

export function requestIp(request: Request) {
  return headerIp(request.headers);
}

export function rateLimitedBody() {
  return { ok: false as const, error: RATE_LIMITED, code: "rate_limited" as const };
}
