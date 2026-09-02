import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FOUNDING_LISTING_FLOOR,
  HOME_BOARD_SLOTS,
  OPEN_SEAT_MAX,
  boardVacancies,
  isFoundingBoard,
  showBoardSortTabs,
} from "./founding";

test("isFoundingBoard is true below the listing floor", () => {
  assert.equal(isFoundingBoard(0), true);
  assert.equal(isFoundingBoard(1), true);
  assert.equal(isFoundingBoard(FOUNDING_LISTING_FLOOR - 1), true);
  assert.equal(isFoundingBoard(FOUNDING_LISTING_FLOOR), false);
});

test("showBoardSortTabs waits until the founding floor", () => {
  assert.equal(showBoardSortTabs(2), false);
  assert.equal(showBoardSortTabs(FOUNDING_LISTING_FLOOR - 1), false);
  assert.equal(showBoardSortTabs(FOUNDING_LISTING_FLOOR), true);
});

test("boardVacancies uses one seats-open invite under live founding rows", () => {
  const slots = boardVacancies(2, 2, HOME_BOARD_SLOTS);
  assert.deepEqual(slots, [
    {
      label: "Seats open",
      hint: "Claim this seat",
      href: "/upload",
    },
  ]);
});

test("boardVacancies fills at most OPEN_SEAT_MAX quiet seats on an empty founding board", () => {
  const slots = boardVacancies(0, 0, HOME_BOARD_SLOTS);
  assert.equal(slots.length, OPEN_SEAT_MAX);
  assert.equal(OPEN_SEAT_MAX, 2);
  assert.deepEqual(slots[0], {
    label: "Claim this seat",
    hint: "Paste a share link",
    href: "/upload",
  });
});

test("boardVacancies does not invent seats past remaining room", () => {
  const slots = boardVacancies(1, HOME_BOARD_SLOTS - 1, HOME_BOARD_SLOTS);
  assert.equal(slots.length, 1);
  assert.equal(slots[0]?.label, "Seats open");
});

test("boardVacancies keeps a share slot on a mature home board", () => {
  const slots = boardVacancies(FOUNDING_LISTING_FLOOR, 5, HOME_BOARD_SLOTS);
  assert.deepEqual(slots, [{ label: "Share a bot", href: "/upload" }]);
});
