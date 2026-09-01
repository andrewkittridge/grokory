import assert from "node:assert/strict";
import { test } from "node:test";
import {
  activeBoosted,
  canBuyBoost,
  isBoostedActive,
  partitionBoosted,
} from "./boost";

const now = Date.parse("2026-09-01T12:00:00.000Z");

function bot(
  over: Partial<{
    id: string;
    category: string;
    boostedUntil: string;
    live: boolean;
  }> = {}
) {
  return {
    id: "a",
    category: "Coding",
    live: true,
    ...over,
  };
}

test("isBoostedActive requires a future boostedUntil", () => {
  assert.equal(isBoostedActive(bot(), now), false);
  assert.equal(
    isBoostedActive(bot({ boostedUntil: "2026-08-01T00:00:00.000Z" }), now),
    false
  );
  assert.equal(
    isBoostedActive(bot({ boostedUntil: "2026-09-08T00:00:00.000Z" }), now),
    true
  );
});

test("partitionBoosted keeps other categories organic", () => {
  const coding = bot({ id: "c", boostedUntil: "2026-09-10T00:00:00.000Z" });
  const writing = bot({
    id: "w",
    category: "Writing",
    boostedUntil: "2026-09-20T00:00:00.000Z",
  });
  const rest = bot({ id: "r" });
  const split = partitionBoosted([coding, writing, rest], "Coding", now, 2);
  assert.deepEqual(
    split.boosted.map((item) => item.id),
    ["c"]
  );
  assert.deepEqual(
    split.rest.map((item) => item.id),
    ["w", "r"]
  );
});

test("canBuyBoost extends an active boost and caps two per category", () => {
  const pins = [
    bot({ id: "a", boostedUntil: "2026-09-10T00:00:00.000Z" }),
    bot({ id: "b", boostedUntil: "2026-09-11T00:00:00.000Z" }),
  ];
  const extra = bot({ id: "d" });
  assert.deepEqual(canBuyBoost(pins, pins[0], now, 2), {
    ok: true,
    extend: true,
  });
  assert.equal(canBuyBoost([...pins, extra], extra, now, 2).ok, false);
  assert.deepEqual(canBuyBoost(pins.slice(0, 1), extra, now, 2), {
    ok: true,
    extend: false,
  });
  const writing = bot({ id: "w", category: "Writing" });
  assert.deepEqual(canBuyBoost(pins, writing, now, 2), {
    ok: true,
    extend: false,
  });
  assert.equal(
    canBuyBoost(pins, bot({ id: "down", live: false }), now, 2).ok,
    false
  );
});

test("activeBoosted sorts by expiry remaining", () => {
  const listed = [
    bot({ id: "soon", boostedUntil: "2026-09-05T00:00:00.000Z" }),
    bot({ id: "later", boostedUntil: "2026-09-20T00:00:00.000Z" }),
  ];
  assert.deepEqual(
    activeBoosted(listed, "Coding", now).map((item) => item.id),
    ["later", "soon"]
  );
});
