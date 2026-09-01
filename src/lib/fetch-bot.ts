import { grokbotTemplateUrl, parseShareUrl } from "./bot-url";
import type { BotPreview } from "./types";

const PREVIEW_TTL = 60 * 60 * 6;
const GONE_TTL = 60 * 30;

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function metaContent(html: string, property: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+property="${property}"[^>]+content="([^"]*)"`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content="([^"]*)"[^>]+property="${property}"`,
      "i"
    ),
    new RegExp(`<meta[^>]+name="${property}"[^>]+content="([^"]*)"`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decode(match[1]);
  }
  return undefined;
}

function attr(html: string, tagPattern: RegExp) {
  const match = html.match(tagPattern);
  return match?.[1] ? decode(match[1]) : undefined;
}

function uniqueLabels(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const label = value.replace(/\s+/g, " ").trim();
    const key = label.toLowerCase();
    if (label.length < 2 || label.length > 80 || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= 12) break;
  }
  return out;
}

function extractSectionList(html: string, heading: string) {
  const headingRe = new RegExp(
    `<(?:h[1-6]|p|span|div)[^>]*>\\s*${heading}\\s*</(?:h[1-6]|p|span|div)>`,
    "i"
  );
  const headingMatch = html.match(headingRe);
  if (!headingMatch || headingMatch.index === undefined) return [];
  const after = html.slice(headingMatch.index + headingMatch[0].length);
  const end = after.search(/<(?:h[1-6])\b/i);
  const slice = end >= 0 ? after.slice(0, end) : after.slice(0, 4000);
  const items = [...slice.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(
    (match) =>
      decode(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
  );
  return uniqueLabels(items);
}

export type ParsedBotPage = {
  gone: boolean;
  title?: string;
  authorName?: string;
  description?: string;
  ogImage?: string;
  addHref?: string;
  skills: string[];
  routines: string[];
};

const GROKBOT_HREF =
  /grokbot:\/\/app\/v1\/bot-template\?id=([A-Za-z0-9_-]+)/i;

function unescapeJsonString(value: string) {
  return value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    )
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function jsonStringField(source: string, key: string) {
  const match = source.match(
    new RegExp(`"${key}":"((?:\\\\.|[^"\\\\])*)"`)
  );
  return match?.[1] ? unescapeJsonString(match[1]) : undefined;
}

/** Live x.ai share pages embed identity in an RSC payload, not Skills/Routines lists. */
export function extractSharePayload(html: string) {
  const marker = html.search(/addHref\\?":\\?"grokbot:/i);
  if (marker < 0) return null;
  const snippet = html
    .slice(Math.max(0, marker - 900), marker + 500)
    .replace(/\\"/g, '"');
  const sharerName = jsonStringField(snippet, "sharerName");
  const botName = jsonStringField(snippet, "botName");
  const description = jsonStringField(snippet, "description");
  const addHref = jsonStringField(snippet, "addHref");
  if (!botName && !sharerName && !description && !addHref) return null;
  return { sharerName, botName, description, addHref };
}

export function parseBotHtml(html: string): ParsedBotPage {
  const ogTitle = metaContent(html, "og:title");
  const ogDescription = metaContent(html, "og:description");
  const ogImage = metaContent(html, "og:image");
  const pageTitle = attr(html, /<h1[^>]*title="([^"]+)"/i);
  const byline = attr(
    html,
    /<p class="text-secondary text-sm">by ([^<]+)<\/p>/i
  );
  const fullDescription = attr(
    html,
    /<p title="([^"]+)" class="text-secondary mt-3/i
  );
  const payload = extractSharePayload(html);
  const grokbot = html.match(GROKBOT_HREF);
  const addHref =
    payload?.addHref?.startsWith("grokbot://")
      ? payload.addHref
      : grokbot
        ? `grokbot://app/v1/bot-template?id=${grokbot[1]}`
        : undefined;

  const gone =
    html.includes("Page not found") &&
    !pageTitle &&
    !payload?.botName &&
    !ogTitle?.includes(" by ");

  let title = payload?.botName || pageTitle;
  let authorName = payload?.sharerName || byline;
  if (!title && ogTitle) {
    const split = ogTitle.match(/^(.*) by (.+)$/);
    if (split) {
      title = split[1];
      authorName = authorName ?? split[2];
    } else {
      title = ogTitle;
    }
  }

  const description =
    payload?.description || fullDescription || ogDescription;

  return {
    gone,
    title,
    authorName,
    description,
    ogImage,
    addHref,
    skills: extractSectionList(html, "Skills"),
    routines: extractSectionList(html, "Routines"),
  };
}

function previewFromParsed(
  parsed: { botId: string; botUrl: string },
  page: ParsedBotPage
): BotPreview {
  const description =
    page.description || "A shared Grok Bot template.";
  const summary =
    description.length > 180
      ? `${description.slice(0, 177).trimEnd()}…`
      : description;
  return {
    botId: parsed.botId,
    botUrl: parsed.botUrl,
    title: (page.title || "Untitled bot").slice(0, 80),
    authorName: (page.authorName || "Unknown").slice(0, 60),
    summary,
    description: description.slice(0, 2000),
    ogImage: page.ogImage,
    addHref: page.addHref ?? grokbotTemplateUrl(parsed.botId),
    skills: page.skills,
    routines: page.routines,
  };
}

type CacheEntry =
  | { ok: true; preview: BotPreview }
  | { ok: false; error: string; gone?: boolean };

async function previewCache() {
  try {
    const { getCloudflareContext } = await import(
      "@opennextjs/cloudflare"
    );
    const { env } = await getCloudflareContext({ async: true });
    return env.TEMPLATES;
  } catch {
    return undefined;
  }
}

async function readCached(botId: string): Promise<CacheEntry | undefined> {
  const kv = await previewCache();
  if (!kv) return undefined;
  try {
    const raw = await kv.get(`bot-preview:v1:${botId}`, "text");
    if (!raw) return undefined;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return undefined;
  }
}

async function writeCached(
  botId: string,
  entry: CacheEntry,
  ttl: number
) {
  const kv = await previewCache();
  if (!kv) return;
  try {
    await kv.put(`bot-preview:v1:${botId}`, JSON.stringify(entry), {
      expirationTtl: ttl,
    });
  } catch {
    // Local or missing KV should not fail lookup.
  }
}

export async function fetchBotPreview(
  input: string,
  options: { skipCache?: boolean } = {}
): Promise<{ ok: true; preview: BotPreview } | { ok: false; error: string; gone?: boolean }> {
  const parsed = parseShareUrl(input);
  if (!parsed) {
    return {
      ok: false,
      error:
        "Paste a Grok Bot share link, like https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN",
    };
  }

  if (!options.skipCache) {
    const cached = await readCached(parsed.botId);
    if (cached) return cached;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const response = await fetch(parsed.botUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Grokdex/1.0; +https://grokdex.net)",
        Accept: "text/html",
      },
      cache: "no-store",
    });
    clearTimeout(timer);

    if (response.status === 404) {
      const result = {
        ok: false as const,
        error: "x.ai returned 404. That share link may have been taken down.",
        gone: true,
      };
      await writeCached(parsed.botId, result, GONE_TTL);
      return result;
    }
    if (!response.ok) {
      return {
        ok: false,
        error: `Could not load that bot from x.ai (${response.status}). You can still fill in the name by hand.`,
      };
    }

    const html = await response.text();
    const page = parseBotHtml(html);
    if (page.gone) {
      const result = {
        ok: false as const,
        error: "x.ai does not have a bot at that link.",
        gone: true,
      };
      await writeCached(parsed.botId, result, GONE_TTL);
      return result;
    }

    const result = {
      ok: true as const,
      preview: previewFromParsed(parsed, page),
    };
    await writeCached(parsed.botId, result, PREVIEW_TTL);
    return result;
  } catch {
    return {
      ok: false,
      error:
        "Could not reach x.ai to look up that bot. Check the link, or enter the name and description yourself.",
    };
  }
}
