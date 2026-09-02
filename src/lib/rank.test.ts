import assert from "node:assert/strict";
import { test } from "node:test";
import { hotRank, parseSort, sortTemplates } from "./rank";
import type { ListedTemplate } from "./types";

function bot(over: Partial<ListedTemplate> = {}): ListedTemplate {
  return {
    id: "id",
    slug: "slug",
    botId: "N92u9t1nHlL_gtgk2nAeN",
    botUrl: "https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN",
    title: "Title",
    authorName: "Andrew",
    summary: "A short summary of the bot.",
    description: "A short summary of the bot.",
    tags: [],
    submittedBy: "Anonymous",
    origin: "community",
    featured: false,
    createdAt: "2026-09-01T00:00:00.000Z",
    adds: 0,
    live: true,
    skills: [],
    routines: [],
    score: 0,
    userVote: 0,
    ...over,
  };
}

test("parseSort defaults to hot", () => {
  assert.equal(parseSort(undefined), "hot");
  assert.equal(parseSort("nope"), "hot");
  assert.equal(parseSort("top"), "top");
});

test("sortTemplates new and top", () => {
  const older = bot({
    id: "old",
    slug: "old",
    createdAt: "2026-08-01T00:00:00.000Z",
    score: 8,
  });
  const newer = bot({
    id: "new",
    slug: "new",
    createdAt: "2026-09-01T00:00:00.000Z",
    score: 2,
  });
  assert.deepEqual(
    sortTemplates([older, newer], "new").map((item) => item.id),
    ["new", "old"]
  );
  assert.deepEqual(
    sortTemplates([newer, older], "top").map((item) => item.id),
    ["old", "new"]
  );
});

test("sortTemplates ignores featured flags", () => {
  const featured = bot({
    id: "pin",
    featured: true,
    featuredUntil: "2026-12-01T00:00:00.000Z",
    score: 1,
    createdAt: "2026-08-01T00:00:00.000Z",
  });
  const hotter = bot({
    id: "hot",
    score: 12,
    createdAt: "2026-09-01T00:00:00.000Z",
  });
  assert.equal(sortTemplates([featured, hotter], "top")[0]?.id, "hot");
  assert.equal(sortTemplates([featured, hotter], "hot")[0]?.id, "hot");
});

test("hotRank prefers a recent score over a stale one", () => {
  const now = Date.now();
  const recent = bot({
    score: 10,
    createdAt: new Date(now).toISOString(),
  });
  const stale = bot({
    score: 10,
    createdAt: new Date(now - 72 * 36e5).toISOString(),
  });
  assert.ok(hotRank(recent) > hotRank(stale));
});

test("hotRank is negative when the score is negative", () => {
  const down = bot({
    score: -4,
    createdAt: new Date().toISOString(),
  });
  assert.ok(hotRank(down) < 0);
  assert.equal(hotRank(bot({ score: 0 })), 0);
});
