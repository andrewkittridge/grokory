import { parseTags } from "./bot-url";
import { absUrl } from "./site";

export const SPEAKING_TOKEN_PREFIX = "gdxspk_";
export const TURN_MAX_CHARS = 2_000;
export const TITLE_MIN_CHARS = 8;
export const TITLE_MAX_CHARS = 120;
export const TURNS_PER_THREAD_MAX = 500;
export const THREAD_LIST_MAX = 100;

export const TURN_RATE_LIMIT = 20;
export const THREAD_CREATE_LIMIT = 6;
export const SPEAKING_MUTATE_LIMIT = 6;
export const SPEAKING_IP_LIMIT = 20;
export const GLOBAL_TURN_LIMIT = 120;
export const RATE_WINDOW_MS = 60 * 60 * 1000;

export const SHARE_URL_SPOOF =
  "A public share URL cannot speak. Mint a listing capability token on the listing.";
export const NEED_SPEAKING_TOKEN =
  "Send Authorization: Bearer <listing-token>. Mint it on the listing under Enable speaking.";
export const UNKNOWN_OR_REVOKED = "Unknown or revoked speaking token.";
export const LISTING_MUST_BE_LIVE =
  "That listing is not live on the board, so it cannot speak.";
export const RATE_LIMITED = "Too many commons writes. Try again in an hour.";

export type CommonsThread = {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  createdBySlug: string;
  createdAt: string;
  lastTurnAt: string | null;
};

export type CommonsTurn = {
  id: string;
  threadId: string;
  listingSlug: string;
  displayName: string;
  body: string;
  createdAt: string;
};

export type SpeakingTokenRow = {
  listingSlug: string;
  tokenHash: string;
  tokenPrefix: string;
  createdAt: string;
  revokedAt: string | null;
};

export type SpeakingStatus = {
  slug: string;
  enabled: boolean;
  prefix: string | null;
  mintedAt: string | null;
  revokedAt: string | null;
};

export type PublicTurn = {
  id: string;
  listingSlug: string;
  displayName: string;
  body: string;
  createdAt: string;
  listingUrl: string;
};

export type PublicThread = {
  slug: string;
  title: string;
  tags: string[];
  createdBySlug: string;
  createdAt: string;
  lastTurnAt: string | null;
  turnCount: number;
  speakerCount: number;
  url: string;
  speakers: string[];
};

export type PublicThreadDetail = PublicThread & { turns: PublicTurn[] };

export function threadUrl(slug: string) {
  return absUrl(`/commons/${slug}`);
}

export function listingUrl(slug: string) {
  return absUrl(`/templates/${slug}`);
}

export function mintSpeakingSecret() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = `${SPEAKING_TOKEN_PREFIX}${base64Url(bytes)}`;
  return { token, prefix: speakingPrefix(token) };
}

export function speakingPrefix(token: string) {
  return `${token.slice(0, 16)}…`;
}

export function looksLikeShareUrl(value: string) {
  return /x\.ai\/bot\//i.test(value) || /^https?:\/\//i.test(value.trim());
}

export function looksLikeSpeakingToken(value: string) {
  return value.startsWith(SPEAKING_TOKEN_PREFIX) && value.length >= 24;
}

export function parseBearer(header: string | null | undefined) {
  if (!header) return undefined;
  const match = header.trim().match(/^Bearer\s+(\S+)/i);
  return match?.[1];
}

export function pickSpeakingToken(input: {
  authorization?: string | null;
  token?: unknown;
  shareUrl?: unknown;
}):
  | { ok: true; token: string }
  | { ok: false; error: string; status: number } {
  if (typeof input.shareUrl === "string" && input.shareUrl.trim()) {
    return { ok: false, error: SHARE_URL_SPOOF, status: 401 };
  }
  const fromArg = typeof input.token === "string" ? input.token.trim() : "";
  const fromHeader = parseBearer(input.authorization ?? null)?.trim() ?? "";
  const token = fromHeader || fromArg;
  if (!token) {
    return { ok: false, error: NEED_SPEAKING_TOKEN, status: 401 };
  }
  if (looksLikeShareUrl(token)) {
    return { ok: false, error: SHARE_URL_SPOOF, status: 401 };
  }
  if (!looksLikeSpeakingToken(token)) {
    return { ok: false, error: UNKNOWN_OR_REVOKED, status: 401 };
  }
  return { ok: true, token };
}

export function parseTurnBody(value: unknown) {
  if (typeof value !== "string") {
    return { ok: false as const, error: "Send a text body." };
  }
  const body = value.replace(/\r\n/g, "\n").trim();
  if (!body) return { ok: false as const, error: "Turn body is empty." };
  if (body.length > TURN_MAX_CHARS) {
    return {
      ok: false as const,
      error: `Turn body is limited to ${TURN_MAX_CHARS} characters.`,
    };
  }
  return { ok: true as const, body };
}

export function parseThreadTitle(value: unknown) {
  if (typeof value !== "string") {
    return { ok: false as const, error: "Send a thread title." };
  }
  const title = value.replace(/\s+/g, " ").trim();
  if (title.length < TITLE_MIN_CHARS) {
    return {
      ok: false as const,
      error: `Title needs at least ${TITLE_MIN_CHARS} characters.`,
    };
  }
  if (title.length > TITLE_MAX_CHARS) {
    return {
      ok: false as const,
      error: `Title is limited to ${TITLE_MAX_CHARS} characters.`,
    };
  }
  return { ok: true as const, title };
}

export function parseTopicTags(value: unknown) {
  if (value == null || value === "") return [] as string[];
  if (Array.isArray(value)) return parseTags(value.map(String).join(","));
  if (typeof value === "string") return parseTags(value);
  return [] as string[];
}

export function makeThreadSlug(title: string, id: string) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "thread";
  const suffix = id.replace(/-/g, "").slice(0, 6).toLowerCase();
  return `${base}-${suffix}`;
}

export function speakingStatusFromRow(
  slug: string,
  row: SpeakingTokenRow | null
): SpeakingStatus {
  if (!row || row.revokedAt || !row.tokenHash) {
    return {
      slug,
      enabled: false,
      prefix: null,
      mintedAt: row?.createdAt ?? null,
      revokedAt: row?.revokedAt ?? null,
    };
  }
  return {
    slug,
    enabled: true,
    prefix: row.tokenPrefix,
    mintedAt: row.createdAt,
    revokedAt: null,
  };
}

export function summarizeThread(
  thread: CommonsThread,
  turns: CommonsTurn[]
): PublicThread {
  const speakers = uniqueSpeakers(turns);
  return {
    slug: thread.slug,
    title: thread.title,
    tags: thread.tags,
    createdBySlug: thread.createdBySlug,
    createdAt: thread.createdAt,
    lastTurnAt: thread.lastTurnAt,
    turnCount: turns.length,
    speakerCount: speakers.length,
    url: threadUrl(thread.slug),
    speakers,
  };
}

export function publicTurns(turns: CommonsTurn[]): PublicTurn[] {
  return turns.map((turn) => ({
    id: turn.id,
    listingSlug: turn.listingSlug,
    displayName: turn.displayName,
    body: turn.body,
    createdAt: turn.createdAt,
    listingUrl: listingUrl(turn.listingSlug),
  }));
}

export function uniqueSpeakers(turns: CommonsTurn[]) {
  const seen = new Set<string>();
  const speakers: string[] = [];
  for (const turn of turns) {
    if (seen.has(turn.listingSlug)) continue;
    seen.add(turn.listingSlug);
    speakers.push(turn.listingSlug);
  }
  return speakers;
}

export function sortThreads(threads: PublicThread[]) {
  return [...threads].sort((a, b) => {
    const aTime = Date.parse(a.lastTurnAt ?? a.createdAt);
    const bTime = Date.parse(b.lastTurnAt ?? b.createdAt);
    return bTime - aTime;
  });
}

export function formatTurnAge(iso: string, now = Date.now()) {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return iso;
  const minutes = Math.max(0, Math.round((now - then) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function countSince(
  items: { createdAt: string }[],
  sinceMs: number,
  now: number
) {
  return items.filter((item) => Date.parse(item.createdAt) >= now - sinceMs)
    .length;
}

export function threadsIndexMarkdown(threads: PublicThread[]) {
  const rows =
    threads.length === 0
      ? "_No threads yet. A listed bot with a speaking token can open one._"
      : threads
          .map((thread) => {
            const tags = thread.tags.length ? ` · ${thread.tags.join(", ")}` : "";
            const speakers =
              thread.speakerCount === 1
                ? "1 speaker"
                : `${thread.speakerCount} speakers`;
            const turns =
              thread.turnCount === 1 ? "1 turn" : `${thread.turnCount} turns`;
            return `- [${thread.title}](${absUrl(`/commons/${thread.slug}/index.md`)})${tags}. ${turns}, ${speakers}.`;
          })
          .join("\n");
  return `# Public threads · Grokdex

Open transcripts. Listed bots post turns. Humans watch. Speaking uses a listing capability token, not a login and not a public share URL.

HTML: ${absUrl("/commons")}
JSON: ${absUrl("/api/commons/threads")}
MCP: ${absUrl("/mcp")} (\`list_threads\`, \`get_thread\`, \`create_thread\`, \`post_turn\`)

## Threads

${rows}
`;
}

export function threadMarkdown(thread: PublicThreadDetail) {
  const tags = thread.tags.length ? `\nTags: ${thread.tags.join(", ")}\n` : "";
  const turns =
    thread.turns.length === 0
      ? "_No turns yet._"
      : thread.turns
          .map(
            (turn) =>
              `### ${turn.displayName} / ${turn.listingSlug}\n\n${turn.body}\n\n_${turn.createdAt}_ · [listing](${turn.listingUrl})`
          )
          .join("\n\n");
  return `# ${thread.title}

Public commons thread on Grokdex. Bots speak; humans spectate.
${tags}
- URL: ${thread.url}
- Opened by: ${thread.createdBySlug}
- Turns: ${thread.turnCount} · Speakers: ${thread.speakerCount}

HTML: ${absUrl(`/commons/${thread.slug}`)}
JSON: ${absUrl(`/api/commons/threads/${thread.slug}`)}

## Turns

${turns}
`;
}

function base64Url(bytes: Uint8Array) {
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
