import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CATALOG_EMPTY_OPENS,
  CATALOG_LANE_FLOOR,
  catalogLaneTokens,
  categoryAnchor,
  filterTemplates,
  groupTemplatesByCategory,
} from "./templates";
import { CATEGORIES, type ListedTemplate } from "./types";

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
  assert.equal(filterTemplates(all, { q: "outer loop" })[0]?.id, "loops");
  assert.equal(filterTemplates(all, { category: "Coding", tag: "citations" }).length, 0);
  assert.equal(
    filterTemplates([bot({ xHandle: "kittridge" })], { q: "kittridge" })[0]
      ?.xHandle,
    "kittridge"
  );
});

const NOW = Date.parse("2026-09-02T00:00:00.000Z");

test("categoryAnchor lowercases the job name", () => {
  assert.equal(categoryAnchor("Coding"), "job-coding");
  assert.equal(categoryAnchor("Work"), "job-work");
});

test("groupTemplatesByCategory keeps job order and pins featured then boosted", () => {
  const featured = bot({
    id: "feat",
    slug: "feat",
    title: "Featured loops",
    category: "Coding",
    featuredUntil: "2026-09-20T00:00:00.000Z",
    score: 1,
  });
  const boosted = bot({
    id: "boost",
    slug: "boost",
    title: "Boosted loops",
    category: "Coding",
    boostedUntil: "2026-09-18T00:00:00.000Z",
    score: 40,
  });
  const organic = bot({
    id: "org",
    slug: "org",
    title: "Hot loops",
    category: "Coding",
    score: 80,
    createdAt: "2026-09-01T00:00:00.000Z",
  });
  const writing = bot({
    id: "write",
    slug: "write",
    title: "Writer",
    category: "Writing",
  });
  const expired = bot({
    id: "old",
    slug: "old",
    title: "Expired pin",
    category: "Coding",
    featuredUntil: "2026-08-01T00:00:00.000Z",
    score: 9,
  });

  const lanes = groupTemplatesByCategory(
    [organic, writing, boosted, featured, expired],
    NOW
  );

  assert.deepEqual(
    lanes.map((lane) => lane.category),
    [...CATEGORIES]
  );

  const coding = lanes.find((lane) => lane.category === "Coding");
  assert.deepEqual(
    coding?.templates.map((item) => item.id),
    ["feat", "boost", "org", "old"]
  );

  const research = lanes.find((lane) => lane.category === "Research");
  assert.equal(research?.templates.length, 0);

  const writingLane = lanes.find((lane) => lane.category === "Writing");
  assert.deepEqual(
    writingLane?.templates.map((item) => item.id),
    ["write"]
  );
});

test("catalogLaneTokens pads empty and sparse jobs with Open seats", () => {
  const empty = catalogLaneTokens({ category: "Sales", templates: [] }, NOW);
  assert.equal(empty.length, CATALOG_EMPTY_OPENS);
  assert.equal(
    empty.every((token) => token.kind === "open"),
    true
  );
  assert.equal(empty[0]?.kind === "open" && empty[0].vacancy.href, "/upload?category=Sales");

  const one = catalogLaneTokens(
    {
      category: "Writing",
      templates: [bot({ category: "Writing" })],
    },
    NOW
  );
  assert.equal(one.length, CATALOG_LANE_FLOOR);
  assert.equal(one[0]?.kind, "listed");
  assert.equal(one.filter((token) => token.kind === "open").length, 3);

  const featured = catalogLaneTokens(
    {
      category: "Coding",
      templates: [
        bot({
          id: "feat",
          category: "Coding",
          featuredUntil: "2026-09-20T00:00:00.000Z",
          boostedUntil: "2026-09-18T00:00:00.000Z",
        }),
      ],
    },
    NOW
  );
  assert.equal(featured[0]?.kind, "listed");
  if (featured[0]?.kind === "listed") {
    assert.equal(featured[0].featured, true);
    assert.equal(featured[0].boosted, true);
  }
});
