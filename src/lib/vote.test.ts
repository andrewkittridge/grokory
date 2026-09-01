import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyBallot,
  nextBallot,
  scoreAfter,
  validVoterId,
} from "./vote";
import type { Vote } from "./types";

test("nextBallot sets, clears, and switches", () => {
  assert.equal(nextBallot(0, 1), 1);
  assert.equal(nextBallot(0, -1), -1);
  assert.equal(nextBallot(1, 1), 0);
  assert.equal(nextBallot(-1, -1), 0);
  assert.equal(nextBallot(1, -1), -1);
  assert.equal(nextBallot(-1, 1), 1);
});

test("scoreAfter matches none/up/down/clear/switch", () => {
  assert.equal(scoreAfter(4, 0, 1), 5);
  assert.equal(scoreAfter(4, 0, -1), 3);
  assert.equal(scoreAfter(5, 1, 0), 4);
  assert.equal(scoreAfter(3, -1, 0), 4);
  assert.equal(scoreAfter(5, 1, -1), 3);
  assert.equal(scoreAfter(3, -1, 1), 5);
});

test("applyBallot upserts one row per voter and listing", () => {
  const empty: Vote[] = [];
  const up = applyBallot(empty, "v1", "t1", 1);
  assert.deepEqual(up, [{ voterId: "v1", templateId: "t1", value: 1 }]);

  const stillUp = applyBallot(up, "v2", "t1", -1);
  assert.equal(stillUp.length, 2);

  const switched = applyBallot(up, "v1", "t1", -1);
  assert.deepEqual(switched, [{ voterId: "v1", templateId: "t1", value: -1 }]);

  const cleared = applyBallot(up, "v1", "t1", 1);
  assert.deepEqual(cleared, []);
});

test("validVoterId accepts randomUUID and rejects junk", () => {
  const id = crypto.randomUUID();
  assert.equal(validVoterId(id), id);
  assert.equal(validVoterId(id.toUpperCase()), id.toUpperCase());
  assert.equal(validVoterId(undefined), undefined);
  assert.equal(validVoterId(""), undefined);
  assert.equal(validVoterId("not-a-uuid"), undefined);
  assert.equal(validVoterId("00000000-0000-0000-0000-000000000000"), undefined);
});
