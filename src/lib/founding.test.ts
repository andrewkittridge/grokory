import assert from "node:assert/strict";
import { test } from "node:test";
import { CATEGORIES } from "./types";
import {
  FOUNDING_LISTING_FLOOR,
  HOME_BOARD_SLOTS,
  boardVacancies,
  isFoundingBoard,
  unlistedJobs,
} from "./founding";

test("isFoundingBoard is true below the listing floor", () => {
  assert.equal(isFoundingBoard(0), true);
  assert.equal(isFoundingBoard(1), true);
  assert.equal(isFoundingBoard(FOUNDING_LISTING_FLOOR - 1), true);
  assert.equal(isFoundingBoard(FOUNDING_LISTING_FLOOR), false);
});

test("unlistedJobs skips categories that already have a listing", () => {
  const open = unlistedJobs([
    { category: "Research" },
    { category: "Research" },
  ]);
  assert.equal(open.includes("Research"), false);
  assert.equal(open[0], "Work");
  assert.equal(open.length, CATEGORIES.length - 1);
});

test("boardVacancies fills open jobs while the board is new", () => {
  const slots = boardVacancies([{ category: "Research" }], 1, HOME_BOARD_SLOTS);
  assert.equal(slots.length, HOME_BOARD_SLOTS - 1);
  assert.equal(slots[0]?.label, "Work");
  assert.equal(slots[0]?.hint, "Open");
  assert.equal(slots[0]?.href, "/upload?category=Work");
  assert.equal(
    slots.some((slot) => slot.label === "Research"),
    false
  );
});

test("boardVacancies keeps a share slot on a mature home board", () => {
  const filled = Array.from({ length: FOUNDING_LISTING_FLOOR }, (_, index) => ({
    category: CATEGORIES[index % CATEGORIES.length],
  }));
  const slots = boardVacancies(filled, 5, HOME_BOARD_SLOTS);
  assert.deepEqual(slots, [{ label: "Share a bot", href: "/upload" }]);
});
