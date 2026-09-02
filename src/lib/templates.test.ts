import assert from "node:assert/strict";
import { test } from "node:test";
import { authorIndex, filterTemplates, relatedTemplates } from "./templates";
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
    category: "Research",
    tags: ["citations"],
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

test("filterTemplates matches category, tag, and query", () => {
  const research = bot();
  const coding = bot({
    id: "loops",
    slug: "loops",
    title: "Loops",
    category: "Coding",
    tags: ["engineering"],
    summary: "Outer loop for a repo you name.",
  });
  const all = [research, coding];

  assert.equal(filterTemplates(all, { category: "Coding" }).length, 1);
  assert.equal(filterTemplates(all, { tag: "citations" })[0]?.id, "id");
  assert.equal(
    filterTemplates(
      [research, bot({ id: "cite", skills: ["Cite sources"] })],
      { skill: "cite sources" }
    )[0]?.id,
    "cite"
  );
  assert.equal(filterTemplates(all, { q: "outer loop" })[0]?.id, "loops");
  assert.equal(filterTemplates(all, { category: "Coding", tag: "citations" }).length, 0);
  assert.equal(
    filterTemplates([bot({ xHandle: "kittridge" })], { q: "kittridge" })[0]
      ?.xHandle,
    "kittridge"
  );
});

test("relatedTemplates falls back to overlapping skills when a job is empty", () => {
  const current = bot({
    id: "writer",
    slug: "writer",
    category: "Writing",
    skills: ["draft"],
  });
  const otherJob = bot({
    id: "ops",
    slug: "ops",
    category: "Ops",
    skills: ["draft"],
  });
  const unrelated = bot({
    id: "code",
    slug: "code",
    category: "Coding",
    skills: ["lint"],
  });
  assert.equal(
    relatedTemplates([current, otherJob, unrelated], current)[0]?.id,
    "ops"
  );
  assert.equal(authorIndex([current, bot({ authorName: "Andrew" })]).length, 1);
});
