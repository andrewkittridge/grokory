import assert from "node:assert/strict";
import { test } from "node:test";
import { headerIp, nextRate, VOTE_RATE_LIMIT } from "./rate-limit";

test("headerIp prefers cf-connecting-ip", () => {
  const headers = new Headers({
    "cf-connecting-ip": "1.2.3.4",
    "x-forwarded-for": "9.9.9.9, 8.8.8.8",
  });
  assert.equal(headerIp(headers), "1.2.3.4");
});

test("headerIp falls back to the first x-forwarded-for hop", () => {
  const headers = new Headers({
    "x-forwarded-for": "9.9.9.9, 8.8.8.8",
  });
  assert.equal(headerIp(headers), "9.9.9.9");
});

test("nextRate allows a burst then blocks until the window resets", () => {
  const now = 1_000_000;
  const windowMs = 600_000;
  let record = null as ReturnType<typeof nextRate>["record"] | null;
  for (let i = 0; i < VOTE_RATE_LIMIT; i += 1) {
    const next = nextRate(record, now, VOTE_RATE_LIMIT, windowMs);
    assert.equal(next.ok, true);
    record = next.record;
  }
  assert.equal(nextRate(record, now, VOTE_RATE_LIMIT, windowMs).ok, false);
  assert.equal(
    nextRate(record, now + windowMs, VOTE_RATE_LIMIT, windowMs).ok,
    true
  );
});
