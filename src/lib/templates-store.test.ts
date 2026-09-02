import assert from "node:assert/strict";
import { test } from "node:test";
import { applyUserVotes, isMissingRelation } from "./templates-store";
import type { ListedTemplate } from "./types";

function bot(over: Partial<ListedTemplate> = {}): ListedTemplate {
  return {
    id: "id",
    slug: "research",
    botId: "Q6NiveEqmhIiYir_ZQG-4",
    botUrl: "https://x.ai/bot/Q6NiveEqmhIiYir_ZQG-4",
    title: "Research",
    authorName: "Andrew",
    summary: "Primary-source research for cited answers.",
    description: "Primary-source research for cited answers.",
    tags: ["citations"],
    submittedBy: "Anonymous",
    origin: "community",
    featured: false,
    createdAt: "2026-09-01T00:00:00.000Z",
    adds: 0,
    live: true,
    skills: [],
    routines: [],
    score: 3,
    userVote: 0,
    ...over,
  };
}

test("applyUserVotes overlays a voter's ballots onto a public list", () => {
  const listed = [
    bot({ id: "a", userVote: 0, score: 4 }),
    bot({ id: "b", userVote: 1, score: 2 }),
  ];
  const next = applyUserVotes(listed, [{ templateId: "a", value: -1 }]);
  assert.equal(next[0]?.userVote, -1);
  assert.equal(next[1]?.userVote, 0);
  assert.equal(next[0]?.score, 4);
});

test("applyUserVotes clears stale userVote when the voter has no ballots", () => {
  const listed = [bot({ userVote: 1 })];
  const next = applyUserVotes(listed, []);
  assert.equal(next[0]?.userVote, 0);
});

test("isMissingRelation matches Postgres undefined-table errors", () => {
  assert.equal(
    isMissingRelation(new Error(`relation "templates" does not exist`)),
    true
  );
  assert.equal(
    isMissingRelation(new Error("SQLSTATE 42P01 undefined_table")),
    true
  );
  assert.equal(isMissingRelation(new Error("column score does not exist")), false);
});
