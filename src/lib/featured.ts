import { FEATURED_PIN_CAP } from "./pricing";

export type FeaturedLike = {
  id: string;
  featured?: boolean;
  featuredUntil?: string;
};

export function isFeaturedActive(
  template: FeaturedLike,
  now = Date.now()
) {
  if (!template.featuredUntil) return false;
  const until = Date.parse(template.featuredUntil);
  return Number.isFinite(until) && until > now;
}

export function extendFeaturedUntil(
  currentUntil: string | undefined,
  durationDays: number,
  now = new Date()
) {
  const days = Math.floor(durationDays);
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error("Featured duration must be a positive number of days.");
  }
  const currentMs = currentUntil ? Date.parse(currentUntil) : Number.NaN;
  const base =
    Number.isFinite(currentMs) && currentMs > now.getTime()
      ? currentMs
      : now.getTime();
  return new Date(base + days * 86_400_000).toISOString();
}

export function activeFeatured<T extends FeaturedLike>(
  templates: T[],
  now = Date.now()
) {
  return templates
    .filter((template) => isFeaturedActive(template, now))
    .sort((a, b) => {
      const aUntil = Date.parse(a.featuredUntil ?? "") || 0;
      const bUntil = Date.parse(b.featuredUntil ?? "") || 0;
      return bUntil - aUntil;
    });
}

export function partitionFeatured<T extends FeaturedLike>(
  templates: T[],
  now = Date.now(),
  cap = FEATURED_PIN_CAP
) {
  const featured = activeFeatured(templates, now);
  const pinnedIds = new Set(featured.slice(0, cap).map((template) => template.id));
  return {
    featured: featured.slice(0, cap),
    organic: templates.filter((template) => !pinnedIds.has(template.id)),
  };
}

export type FeaturedPurchaseGate =
  | { ok: true; extend: boolean }
  | { ok: false; reason: string; nextFreeAt?: string };

export function canBuyFeatured<T extends FeaturedLike & { live?: boolean }>(
  templates: T[],
  template: T,
  now = Date.now(),
  cap = FEATURED_PIN_CAP
): FeaturedPurchaseGate {
  if (template.live === false) {
    return {
      ok: false,
      reason: "This share link is down. Feature it after the preview comes back.",
    };
  }
  if (isFeaturedActive(template, now)) {
    return { ok: true, extend: true };
  }
  const pinned = activeFeatured(templates, now).slice(0, cap);
  if (pinned.length < cap) {
    return { ok: true, extend: false };
  }
  const nextFreeAt = pinned
    .map((item) => item.featuredUntil)
    .filter((value): value is string => Boolean(value))
    .sort()[0];
  return {
    ok: false,
    reason: nextFreeAt
      ? `Featured is full until ${formatFeaturedUntil(nextFreeAt)}.`
      : "Featured is full right now.",
    nextFreeAt,
  };
}

export function formatFeaturedUntil(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
