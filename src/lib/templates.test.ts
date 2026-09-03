import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CATALOG_EMPTY_OPENS,
  CATALOG_LANE_FLOOR,
  authorIndex,
  catalogLaneTokens,
  catalogListedHitCount,
  catalogParadeLanes,
  catalogTokenMatches,
  filterTemplates,
  relatedTemplates,
} from "./templates";
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
    score: 0,
    userVote: 0,
    ...over,
  };
}

test("filterTemplates matches tag, skill, and query", () => {
  const research = bot();
  const coding = bot({
    id: "loops",
    slug: "loops",
    title: "Loops",
    tags: ["engineering"],
    summary: "Outer loop for a repo you name.",
  });
  const all = [research, coding];

  assert.equal(filterTemplates(all, { tag: "citations" })[0]?.id, "id");
  assert.equal(
    filterTemplates(
      [research, bot({ id: "cite", skills: ["Cite sources"] })],
      { skill: "cite sources" }
    )[0]?.id,
    "cite"
  );
  assert.equal(filterTemplates(all, { q: "outer loop" })[0]?.id, "loops");
  assert.equal(filterTemplates(all, { tag: "citations", q: "outer" }).length, 0);
  assert.equal(
    filterTemplates([bot({ xHandle: "kittridge" })], { q: "kittridge" })[0]
      ?.xHandle,
    "kittridge"
  );
  assert.equal(
    filterTemplates([bot({ xHandle: "kittridge" })], { q: "@kitt" })[0]
      ?.xHandle,
    "kittridge"
  );
});

const NOW = Date.parse("2026-09-02T00:00:00.000Z");

test("catalogParadeLanes pins featured then boosted then hot", () => {
  const featured = bot({
    id: "feat",
    slug: "feat",
    title: "Featured loops",
    featuredUntil: "2026-09-20T00:00:00.000Z",
    score: 1,
  });
  const boosted = bot({
    id: "boost",
    slug: "boost",
    title: "Boosted loops",
    boostedUntil: "2026-09-18T00:00:00.000Z",
    score: 40,
  });
  const organic = bot({
    id: "org",
    slug: "org",
    title: "Hot loops",
    score: 80,
    createdAt: "2026-09-01T00:00:00.000Z",
  });
  const writing = bot({
    id: "write",
    slug: "write",
    title: "Writer",
  });
  const expired = bot({
    id: "old",
    slug: "old",
    title: "Expired pin",
    featuredUntil: "2026-08-01T00:00:00.000Z",
    score: 9,
  });

  const lanes = catalogParadeLanes(
    [organic, writing, boosted, featured, expired],
    NOW
  );

  assert.deepEqual(
    lanes.flatMap((lane) => lane.templates.map((item) => item.id)),
    ["feat", "boost", "org", "old", "write"]
  );
});

test("catalogLaneTokens pads empty and sparse lanes with Open seats", () => {
  const empty = catalogLaneTokens({ id: "lane-0", templates: [] }, NOW);
  assert.equal(empty.length, CATALOG_EMPTY_OPENS);
  assert.equal(
    empty.every((token) => token.kind === "open"),
    true
  );
  assert.equal(
    empty[0]?.kind === "open" && empty[0].vacancy.href,
    "/upload"
  );

  const one = catalogLaneTokens(
    {
      id: "lane-1",
      templates: [bot()],
    },
    NOW
  );
  assert.equal(one.length, CATALOG_LANE_FLOOR);
  assert.equal(one[0]?.kind, "listed");
  assert.equal(one.filter((token) => token.kind === "open").length, 3);

  const featured = catalogLaneTokens(
    {
      id: "lane-2",
      templates: [
        bot({
          id: "feat",
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

test("catalogTokenMatches hops listed bots and ignores open seats", () => {
  const listed = catalogLaneTokens(
    { id: "lane-0", templates: [bot({ xHandle: "kittridge" })] },
    NOW
  );
  const token = listed[0];
  const open = listed.find((item) => item.kind === "open");
  assert.equal(token?.kind, "listed");
  assert.ok(open);
  assert.equal(catalogTokenMatches(token!, ""), true);
  assert.equal(catalogTokenMatches(token!, "research"), true);
  assert.equal(catalogTokenMatches(token!, "@kittridge"), true);
  assert.equal(catalogTokenMatches(token!, "nope"), false);
  assert.equal(catalogTokenMatches(open!, ""), true);
  assert.equal(catalogTokenMatches(open!, "research"), false);
  assert.equal(catalogListedHitCount(listed, "@kittridge"), 1);
  assert.equal(catalogListedHitCount(listed, "nope"), 0);
});

test("catalogLaneTokens keep the share-page mark on listed bots", () => {
  const mark = {
    coatLight: "#FFAF38",
    coatDark: "#FF9800",
    shape: "teardrop" as const,
  };
  const tokens = catalogLaneTokens(
    {
      id: "lane-0",
      templates: [bot({ mark })],
    },
    NOW
  );
  assert.equal(tokens[0]?.kind, "listed");
  if (tokens[0]?.kind === "listed") {
    assert.deepEqual(tokens[0].template.mark, mark);
  }
});

test("relatedTemplates prefers overlapping skills then other hot bots", () => {
  const current = bot({
    id: "writer",
    slug: "writer",
    skills: ["draft"],
  });
  const overlap = bot({
    id: "ops",
    slug: "ops",
    skills: ["draft"],
  });
  const unrelated = bot({
    id: "code",
    slug: "code",
    skills: ["lint"],
    score: 9,
  });
  assert.equal(
    relatedTemplates([current, overlap, unrelated], current)[0]?.id,
    "ops"
  );
  assert.equal(
    relatedTemplates([current, unrelated], current)[0]?.id,
    "code"
  );
  assert.equal(authorIndex([current, bot({ authorName: "Andrew" })]).length, 1);
});

test("authorIndex splits placeholder authors by X handle", () => {
  const rows = authorIndex([
    bot({
      id: "a",
      slug: "a",
      authorName: "Unknown",
      xHandle: "poteto",
    }),
    bot({
      id: "b",
      slug: "b",
      authorName: "Unknown",
      xHandle: "mattyp",
    }),
    bot({
      id: "c",
      slug: "c",
      authorName: "Andrew",
      xHandle: "andrew",
    }),
    bot({ id: "d", slug: "d", authorName: "Andrew" }),
  ]);
  assert.equal(rows.length, 3);
  const poteto = rows.find((row) => row.slug === "poteto");
  assert.equal(poteto?.name, "@poteto");
  assert.equal(poteto?.count, 1);
  const andrew = rows.find((row) => row.slug === "andrew");
  assert.equal(andrew?.name, "Andrew");
  assert.equal(andrew?.count, 2);
});
