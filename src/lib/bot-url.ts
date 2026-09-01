import { REPORT_EMAIL } from "./site";
import { CATEGORIES, type Category } from "./types";

const BOT_PATH =
  /^(?:https?:\/\/)?(?:www\.)?x\.ai\/bot\/([A-Za-z0-9_-]{8,64})(?:[/?#].*)?$/i;
const BARE_ID = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9_-]{12,64}$/;

export const ALREADY_LISTED = "That Grok Bot is already listed.";
export const HANDLE_ALREADY_SET = "That listing already has an X handle.";

const X_HANDLE = /^[A-Za-z0-9_]{1,15}$/;
const X_PROFILE =
  /^(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/@?([A-Za-z0-9_]{1,15})(?:[/?#].*)?$/i;
const X_RESERVED = new Set([
  "about",
  "compose",
  "download",
  "explore",
  "home",
  "i",
  "intent",
  "jobs",
  "login",
  "messages",
  "notifications",
  "privacy",
  "search",
  "settings",
  "share",
  "signup",
  "tos",
]);

export function parseXHandle(
  input?: string
): { ok: true; handle?: string } | { ok: false; error: string } {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return { ok: true };

  const fromUrl = trimmed.match(X_PROFILE);
  const raw = (fromUrl?.[1] ?? trimmed.replace(/^@/, "")).trim();
  if (!X_HANDLE.test(raw) || X_RESERVED.has(raw.toLowerCase())) {
    return {
      ok: false,
      error: "Use an X username like @handle.",
    };
  }
  return { ok: true, handle: raw };
}

export function xHandleUrl(handle: string) {
  return `https://x.com/${handle}`;
}

export function xHandleLabel(handle: string) {
  return `@${handle}`;
}

export function grokbotTemplateUrl(botId: string) {
  return `grokbot://app/v1/bot-template?id=${encodeURIComponent(botId)}`;
}

export function parseShareUrl(
  input: string
): { botId: string; botUrl: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const fromUrl = trimmed.match(BOT_PATH);
  if (fromUrl) {
    const botId = fromUrl[1];
    return { botId, botUrl: `https://x.ai/bot/${botId}` };
  }

  if (BARE_ID.test(trimmed)) {
    return { botId: trimmed, botUrl: `https://x.ai/bot/${trimmed}` };
  }

  return null;
}

export function slugify(title: string, botId: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = botId.slice(0, 6).toLowerCase();
  return `${base || "bot"}-${suffix}`;
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function parseTags(raw: string) {
  return raw
    .split(/[,#]/)
    .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter((tag) => tag.length > 0 && tag.length <= 24)
    .slice(0, 8);
}

export function formatCount(n: number) {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
}

export function formatAdds(n: number) {
  return n === 1 ? "1 add" : `${formatCount(n)} adds`;
}

export function listingPostText(title: string, url: string) {
  return `${title} — a public Grok Bot on Grokdex ${url}`;
}

export function authorSlug(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "unknown"
  );
}

export function formatCheckedAt(iso?: string) {
  if (!iso) return "Not checked yet";
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "Not checked yet";
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "Checked just now";
  if (minutes < 60) return `Checked ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `Checked ${hours}h ago`;
  const days = Math.round(hours / 24);
  return `Checked ${days}d ago`;
}

export function isGoneError(error: string) {
  return /404|does not have a bot|taken down/i.test(error);
}

export function reportMailto(input: {
  title: string;
  slug: string;
  botUrl: string;
  listingUrl: string;
}) {
  const subject = `Report listing: ${input.title}`;
  const body = [
    "Why this listing should come down:",
    "",
    "",
    `Title: ${input.title}`,
    `Listing: ${input.listingUrl}`,
    `Share link: ${input.botUrl}`,
    `Slug: ${input.slug}`,
  ].join("\n");
  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
