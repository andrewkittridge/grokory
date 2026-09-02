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
    boostedUntil: string;
    live: boolean;
  }> = {}
) {
  return {
    id: "a",
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

test("partitionBoosted pins active boosts ahead of organic", () => {
  const coding = bot({ id: "c", boostedUntil: "2026-09-10T00:00:00.000Z" });
  const writing = bot({
    id: "w",
    boostedUntil: "2026-09-20T00:00:00.000Z",
  });
  const rest = bot({ id: "r" });
  const split = partitionBoosted([coding, writing, rest], now, 2);
  assert.deepEqual(
    split.boosted.map((item) => item.id),
    ["w", "c"]
  );
  assert.deepEqual(
    split.rest.map((item) => item.id),
    ["r"]
  );
});

test("canBuyBoost extends an active boost and caps two on the board", () => {
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
    activeBoosted(listed, now).map((item) => item.id),
    ["later", "soon"]
  );
});
