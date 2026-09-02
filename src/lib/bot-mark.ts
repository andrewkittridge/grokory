import { GROK_BOT_SHAPES, type GrokBotEye } from "./grok-bot-shapes";
import type { BotMark, BotMarkShape } from "./types";

export type { BotMark, BotMarkShape };

const PATH_CHARS = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+\-]*$/;
const MAX_HEAD_PATH = 8000;

export type ResolvedBotMark = {
  coat: string;
  eyeFill: string;
  head: string;
  eyes: GrokBotEye[];
  shape?: BotMarkShape;
};

export function isBotMarkShape(value: unknown): value is BotMarkShape {
  return value === "teardrop" || value === "blob";
}

export function normalizeHex(value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  const match = raw.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/);
  if (!match) return undefined;
  const hex = match[1];
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toUpperCase();
  }
  return `#${hex.toUpperCase()}`;
}

export function isSafeHeadPath(value: string | undefined): value is string {
  if (!value) return false;
  const path = value.trim();
  if (path.length < 24 || path.length > MAX_HEAD_PATH) return false;
  if (!path.startsWith("M") && !path.startsWith("m")) return false;
  return PATH_CHARS.test(path);
}

export function identifyBotShape(path: string): BotMarkShape | undefined {
  const compact = path.replace(/,/g, " ").replace(/\s+/g, " ");
  if (compact.includes("Q114.27 -7.28") || compact.includes("Q114.27-7.28")) {
    return "teardrop";
  }
  if (
    compact.includes("155.933 232.34") ||
    compact.includes("M228.541 114.228C228.541 130.133")
  ) {
    return "blob";
  }
  return undefined;
}

export function sanitizeMark(input: unknown): BotMark | undefined {
  if (!input || typeof input !== "object") return undefined;
  const raw = input as Record<string, unknown>;
  const coatLight = normalizeHex(
    typeof raw.coatLight === "string" ? raw.coatLight : undefined
  );
  const coatDark = normalizeHex(
    typeof raw.coatDark === "string" ? raw.coatDark : undefined
  );
  if (!coatLight || !coatDark) return undefined;
  if (isBotMarkShape(raw.shape)) {
    return { coatLight, coatDark, shape: raw.shape };
  }
  const headPath =
    typeof raw.headPath === "string" ? raw.headPath.trim() : undefined;
  if (!isSafeHeadPath(headPath)) return undefined;
  const shape = identifyBotShape(headPath);
  return shape
    ? { coatLight, coatDark, shape }
    : { coatLight, coatDark, headPath };
}

export function parseShareMark(html: string): BotMark | undefined {
  const coats = html.match(
    /--share-coat-light:\s*(#[0-9A-Fa-f]{3,8})\s*;\s*--share-coat-dark:\s*(#[0-9A-Fa-f]{3,8})/i
  );
  const coatLight = normalizeHex(coats?.[1]);
  const coatDark = normalizeHex(coats?.[2]);
  if (!coatLight || !coatDark) return undefined;

  const head = visibleHeadPath(html);
  if (!head) return undefined;
  return sanitizeMark({ coatLight, coatDark, headPath: head });
}

function visibleHeadPath(html: string): string | undefined {
  const clip = html.match(/<clipPath\b[^>]*>\s*<path\b[^>]*\sd="([^"]+)"/i);
  if (clip?.[1] && isSafeHeadPath(clip[1])) return clip[1];

  const heads = html.matchAll(
    /<path\b[^>]*class="[^"]*grok-bot-mark__head[^"]*"[^>]*>/gi
  );
  for (const match of heads) {
    const tag = match[0];
    if (/display:\s*none/i.test(tag)) continue;
    const d = tag.match(/\sd="([^"]+)"/i)?.[1];
    if (d && isSafeHeadPath(d)) return d;
  }
  return undefined;
}

export function coatForTheme(
  mark: BotMark,
  theme: "dark" | "light" = "dark"
) {
  return theme === "light" ? mark.coatLight : mark.coatDark;
}

export function relativeLuminance(hex: string): number {
  const normalized = normalizeHex(hex);
  if (!normalized) return 0;
  const n = Number.parseInt(normalized.slice(1), 16);
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function eyeFillForCoat(hex: string) {
  return relativeLuminance(hex) > 0.35 ? "#121212" : "#F4F4F5";
}

export function resolveBotMark(
  mark: BotMark,
  theme: "dark" | "light" = "dark"
): ResolvedBotMark | undefined {
  const clean = sanitizeMark(mark);
  if (!clean) return undefined;
  const coat = coatForTheme(clean, theme);
  const named = clean.shape ? GROK_BOT_SHAPES[clean.shape] : undefined;
  const head = named?.head ?? clean.headPath;
  if (!head) return undefined;
  return {
    coat,
    eyeFill: eyeFillForCoat(coat),
    head,
    eyes: named?.eyes ?? GROK_BOT_SHAPES.blob.eyes,
    shape: clean.shape,
  };
}

export function serializeMark(mark: BotMark | undefined) {
  const clean = sanitizeMark(mark);
  return clean ? JSON.stringify(clean) : null;
}

export function markFromStored(raw: unknown): BotMark | undefined {
  if (!raw) return undefined;
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    return sanitizeMark(value);
  } catch {
    return undefined;
  }
}
