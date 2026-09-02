import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FOUNDING_LISTING_FLOOR,
  HOME_BOARD_SLOTS,
  OPEN_SEAT_MAX,
  boardVacancies,
  isFoundingBoard,
} from "./founding";

test("isFoundingBoard is true below the listing floor", () => {
  assert.equal(isFoundingBoard(0), true);
  assert.equal(isFoundingBoard(1), true);
  assert.equal(isFoundingBoard(FOUNDING_LISTING_FLOOR - 1), true);
  assert.equal(isFoundingBoard(FOUNDING_LISTING_FLOOR), false);
});

test("boardVacancies fills at most OPEN_SEAT_MAX quiet seats while the board is new", () => {
  const slots = boardVacancies(1, 1, HOME_BOARD_SLOTS);
  assert.equal(slots.length, OPEN_SEAT_MAX);
  assert.deepEqual(slots[0], {
    label: "Claim this seat",
    hint: "Paste a share link",
    href: "/upload",
  });
});

test("boardVacancies does not invent seats past remaining room", () => {
  const slots = boardVacancies(1, HOME_BOARD_SLOTS - 1, HOME_BOARD_SLOTS);
  assert.equal(slots.length, 1);
  assert.equal(slots[0]?.label, "Claim this seat");
});

test("boardVacancies keeps a share slot on a mature home board", () => {
  const slots = boardVacancies(FOUNDING_LISTING_FLOOR, 5, HOME_BOARD_SLOTS);
  assert.deepEqual(slots, [{ label: "Share a bot", href: "/upload" }]);
});
