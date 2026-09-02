import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FOUNDING_LISTING_FLOOR,
  HOME_BOARD_SLOTS,
  boardVacancies,
  isFoundingBoard,
} from "./founding";

test("isFoundingBoard is true below the listing floor", () => {
  assert.equal(isFoundingBoard(0), true);
  assert.equal(isFoundingBoard(1), true);
  assert.equal(isFoundingBoard(FOUNDING_LISTING_FLOOR - 1), true);
  assert.equal(isFoundingBoard(FOUNDING_LISTING_FLOOR), false);
});

test("boardVacancies fills open seats while the board is new", () => {
  const slots = boardVacancies(1, 1, HOME_BOARD_SLOTS);
  assert.equal(slots.length, HOME_BOARD_SLOTS - 1);
  assert.equal(slots[0]?.label, "Open");
  assert.equal(slots[0]?.hint, "Paste a share link");
  assert.equal(slots[0]?.href, "/upload");
});

test("boardVacancies keeps a share slot on a mature home board", () => {
  const slots = boardVacancies(FOUNDING_LISTING_FLOOR, 5, HOME_BOARD_SLOTS);
  assert.deepEqual(slots, [{ label: "Share a bot", href: "/upload" }]);
});
