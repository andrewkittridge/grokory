import { CATEGORIES, type Category } from "./types";

const BOT_ID = /^[A-Za-z0-9_-]{8,64}$/;
const BOT_PATH =
  /^(?:https?:\/\/)?(?:www\.)?x\.ai\/bot\/([A-Za-z0-9_-]{8,64})\/?(?:\?.*)?$/i;

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

  if (BOT_ID.test(trimmed)) {
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
