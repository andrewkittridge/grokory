import { BOOST_PIN_CAP } from "./pricing";
import { extendFeaturedUntil, formatFeaturedUntil } from "./featured";
import type { Category } from "./types";

export type BoostedLike = {
  id: string;
  category?: Category | string;
  boostedUntil?: string;
  live?: boolean;
};

export function isBoostedActive(
  template: BoostedLike,
  now = Date.now()
) {
  if (!template.boostedUntil) return false;
  const until = Date.parse(template.boostedUntil);
  return Number.isFinite(until) && until > now;
}

export const extendBoostedUntil = extendFeaturedUntil;

export function activeBoosted<T extends BoostedLike>(
  templates: T[],
  category: string,
  now = Date.now()
) {
  return templates
    .filter(
      (template) =>
        template.category === category && isBoostedActive(template, now)
    )
    .sort((a, b) => {
      const aUntil = Date.parse(a.boostedUntil ?? "") || 0;
      const bUntil = Date.parse(b.boostedUntil ?? "") || 0;
      return bUntil - aUntil;
    });
}

export function partitionBoosted<T extends BoostedLike>(
  templates: T[],
  category: string,
  now = Date.now(),
  cap = BOOST_PIN_CAP
) {
  const boosted = activeBoosted(templates, category, now).slice(0, cap);
  const pinnedIds = new Set(boosted.map((template) => template.id));
  return {
    boosted,
    rest: templates.filter((template) => !pinnedIds.has(template.id)),
  };
}

export type BoostPurchaseGate =
  | { ok: true; extend: boolean }
  | { ok: false; reason: string; nextFreeAt?: string };

export function canBuyBoost<T extends BoostedLike>(
  templates: T[],
  template: T,
  now = Date.now(),
  cap = BOOST_PIN_CAP
): BoostPurchaseGate {
  if (template.live === false) {
    return {
      ok: false,
      reason: "This share link is down. Boost it after the preview comes back.",
    };
  }
  if (!template.category) {
    return { ok: false, reason: "This listing has no job category." };
  }
  if (isBoostedActive(template, now)) {
    return { ok: true, extend: true };
  }
  const pinned = activeBoosted(templates, template.category, now).slice(0, cap);
  if (pinned.length < cap) {
    return { ok: true, extend: false };
  }
  const nextFreeAt = pinned
    .map((item) => item.boostedUntil)
    .filter((value): value is string => Boolean(value))
    .sort()[0];
  return {
    ok: false,
    reason: nextFreeAt
      ? `Boosts in ${template.category} are full until ${formatFeaturedUntil(nextFreeAt)}.`
      : `Boosts in ${template.category} are full right now.`,
    nextFreeAt,
  };
}
