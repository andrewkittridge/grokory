import assert from "node:assert/strict";
import { test } from "node:test";
import {
  activeFeatured,
  canBuyFeatured,
  extendFeaturedUntil,
  isFeaturedActive,
  partitionFeatured,
} from "./featured";

const now = Date.parse("2026-09-01T12:00:00.000Z");

function bot(
  over: Partial<{
    id: string;
    featuredUntil: string;
    live: boolean;
  }> = {}
) {
  return {
    id: "a",
    live: true,
    ...over,
  };
}

test("isFeaturedActive requires a future featuredUntil", () => {
  assert.equal(isFeaturedActive(bot(), now), false);
  assert.equal(
    isFeaturedActive(bot({ featuredUntil: "2026-08-01T00:00:00.000Z" }), now),
    false
  );
  assert.equal(
    isFeaturedActive(bot({ featuredUntil: "2026-09-08T00:00:00.000Z" }), now),
    true
  );
});

test("extendFeaturedUntil starts from now, then stacks", () => {
  const first = extendFeaturedUntil(undefined, 7, new Date(now));
  assert.equal(first, "2026-09-08T12:00:00.000Z");
  const stacked = extendFeaturedUntil(first, 7, new Date(now));
  assert.equal(stacked, "2026-09-15T12:00:00.000Z");
  const fromPast = extendFeaturedUntil(
    "2026-08-01T12:00:00.000Z",
    7,
    new Date(now)
  );
  assert.equal(fromPast, "2026-09-08T12:00:00.000Z");
});

test("partitionFeatured pins the longest remaining, rest stay organic", () => {
  const a = bot({ id: "a", featuredUntil: "2026-09-10T00:00:00.000Z" });
  const b = bot({ id: "b", featuredUntil: "2026-09-20T00:00:00.000Z" });
  const c = bot({ id: "c", featuredUntil: "2026-09-12T00:00:00.000Z" });
  const d = bot({ id: "d", featuredUntil: "2026-09-11T00:00:00.000Z" });
  const organic = bot({ id: "e" });
  const split = partitionFeatured([a, b, c, d, organic], now, 3);
  assert.deepEqual(
    split.featured.map((item) => item.id),
    ["b", "c", "d"]
  );
  assert.deepEqual(
    split.organic.map((item) => item.id),
    ["a", "e"]
  );
});

test("canBuyFeatured extends an active pin and blocks a fourth", () => {
  const pins = [
    bot({ id: "a", featuredUntil: "2026-09-10T00:00:00.000Z" }),
    bot({ id: "b", featuredUntil: "2026-09-11T00:00:00.000Z" }),
    bot({ id: "c", featuredUntil: "2026-09-12T00:00:00.000Z" }),
  ];
  const extra = bot({ id: "d" });
  assert.deepEqual(canBuyFeatured(pins, pins[0], now, 3), {
    ok: true,
    extend: true,
  });
  const blocked = canBuyFeatured([...pins, extra], extra, now, 3);
  assert.equal(blocked.ok, false);
  if (!blocked.ok) {
    assert.equal(blocked.nextFreeAt, "2026-09-10T00:00:00.000Z");
  }
  assert.equal(canBuyFeatured(pins, extra, now, 3).ok, false);
  assert.deepEqual(canBuyFeatured(pins.slice(0, 2), extra, now, 3), {
    ok: true,
    extend: false,
  });
  assert.equal(
    canBuyFeatured(pins, bot({ id: "down", live: false }), now, 3).ok,
    false
  );
});

test("activeFeatured sorts by expiry remaining", () => {
  const listed = [
    bot({ id: "soon", featuredUntil: "2026-09-05T00:00:00.000Z" }),
    bot({ id: "later", featuredUntil: "2026-09-20T00:00:00.000Z" }),
  ];
  assert.deepEqual(
    activeFeatured(listed, now).map((item) => item.id),
    ["later", "soon"]
  );
});
