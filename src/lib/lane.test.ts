import assert from "node:assert/strict";
import { test } from "node:test";
import { sortTemplates } from "./rank";
import {
  LANES,
  assignLane,
  boardSearchHref,
  explainLane,
  laneCounts,
  parseLane,
} from "./lane";
import type { ListedTemplate } from "./types";

test("closed vocabulary is 8–12 lanes including Other", () => {
  assert.ok(LANES.length >= 8 && LANES.length <= 12);
  assert.equal(LANES.at(-1), "other");
  assert.deepEqual(
    [...LANES],
    [
      "product",
      "engineering",
      "research",
      "writing",
      "design",
      "marketing",
      "sales",
      "ops",
      "personal",
      "media",
      "other",
    ]
  );
});

test("boardSearchHref is the same board with ?lane=", () => {
  assert.equal(boardSearchHref({}), "/templates");
  assert.equal(boardSearchHref({ lane: "writing" }), "/templates?lane=writing");
  assert.equal(
    boardSearchHref({ q: "loops", sort: "top", lane: "engineering" }),
    "/templates?q=loops&lane=engineering&sort=top"
  );
  assert.doesNotMatch(boardSearchHref({ lane: "writing" }), /\/writing$/);
});

test("parseLane accepts slugs, labels, and operations", () => {
  assert.equal(parseLane("Writing"), "writing");
  assert.equal(parseLane("ops"), "ops");
  assert.equal(parseLane("operations"), "ops");
  assert.equal(parseLane("nope"), undefined);
  assert.equal(parseLane(""), undefined);
});

test("marketplace category wins over tags and keywords", () => {
  const assigned = explainLane({
    botId: "i2hvaEONDg6_gEF5C9RlK",
    title: "Researchy",
    summary: "A research and fact-check desk.",
    tags: ["research"],
  });
  assert.equal(assigned.lane, "engineering");
  assert.equal(assigned.source, "marketplace");
  assert.equal(
    assignLane({
      marketplaceCategory: ["From Grok Bot Team", "Sales"],
      title: "Outbound Prospecting",
      tags: ["writing"],
    }),
    "sales"
  );
});

test("human tags matching a lane beat keywords and do not require wiping tags", () => {
  const tags = ["writing", "drafts", "copy"];
  const assigned = explainLane({
    title: "Chief of Agents",
    summary: "Orchestrates a roster of specialist Grok Bots.",
    tags,
  });
  assert.equal(assigned.lane, "writing");
  assert.equal(assigned.source, "tag");
  assert.deepEqual(tags, ["writing", "drafts", "copy"]);
  assert.equal(
    assignLane({
      title: "Event Request Desk",
      tags: ["operations"],
    }),
    "ops"
  );
  assert.equal(
    assignLane({
      title: "Fantasy",
      summary: "Win your fantasy football league.",
      tags: ["fantasy", "sports"],
    }),
    "personal"
  );
});

test("keyword rules cover title+summary when marketplace and tags miss", () => {
  assert.equal(
    explainLane({
      title: "Writing Bot",
      summary: "A writing partner for drafting and revising essays, emails, docs, and other prose.",
    }).source,
    "keyword"
  );
  assert.equal(
    assignLane({
      title: "Writing Bot",
      summary: "A writing partner for drafting and revising essays.",
    }),
    "writing"
  );
  assert.equal(
    assignLane({
      title: "Engineer",
      summary: "Outer-loop engineering manager: break work down, hand it to a build agent.",
    }),
    "engineering"
  );
  assert.equal(
    assignLane({
      title: "Research",
      summary: "Primary-source research for anyone who needs cited answers.",
    }),
    "research"
  );
  assert.equal(
    assignLane({
      title: "Product",
      summary: "Product judgment for indie apps — what to ship next.",
    }),
    "product"
  );
  assert.equal(
    assignLane({
      title: "figma bro",
      summary: "Designs in Figma. Real components, intuitive layout.",
    }),
    "design"
  );
  assert.equal(
    assignLane({
      title: "Pitch Deck Coach",
      summary: "Reviews a pitch deck and reports what an investor is likely to understand.",
    }),
    "sales"
  );
  assert.equal(
    assignLane({
      title: "Email",
      summary: "Protects your attention in email — ruthless triage, drafts the few replies that matter.",
    }),
    "ops"
  );
  assert.equal(
    assignLane({
      title: "Health",
      summary: "Owns training, sleep, nutrition, and recovery with simple systems that stick.",
    }),
    "personal"
  );
  assert.equal(
    assignLane({
      title: "Image Gen Bot",
      summary: "An outer-loop assistant for stills and clips.",
    }),
    "media"
  );
  assert.equal(
    assignLane({
      title: "X Algo",
      summary: "Helps X posters decide when to quote, ship a new post, or wait.",
    }),
    "marketing"
  );
});

test("unknown text lands in Other", () => {
  const assigned = explainLane({
    title: "dr eggbot",
    summary: "Designs high-quality Grok Bots. Asks a few preference questions.",
  });
  assert.equal(assigned.lane, "other");
  assert.equal(assigned.source, "other");
});

test("laneCounts are honest and skip empty seats", () => {
  const counts = laneCounts([
    { lane: "writing" },
    { lane: "writing" },
    { lane: "engineering" },
    { lane: "nope" },
  ]);
  assert.equal(counts.find((row) => row.lane === "writing")?.count, 2);
  assert.equal(counts.find((row) => row.lane === "engineering")?.count, 1);
  assert.equal(counts.find((row) => row.lane === "other")?.count, 1);
  assert.equal(counts.find((row) => row.lane === "sales")?.count, 0);
});

test("sortTemplates ignores lane — filter only", () => {
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
      lane: "other",
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
  const writing = bot({
    id: "w",
    lane: "writing",
    score: 1,
    createdAt: "2026-09-01T00:00:00.000Z",
  });
  const engineering = bot({
    id: "e",
    lane: "engineering",
    score: 9,
    createdAt: "2026-08-01T00:00:00.000Z",
  });
  assert.deepEqual(
    sortTemplates([writing, engineering], "top").map((item) => item.id),
    ["e", "w"]
  );
  assert.deepEqual(
    sortTemplates(
      [bot({ id: "w", lane: "writing", score: 9 }), bot({ id: "e", lane: "engineering", score: 9 })],
      "top"
    ).map((item) => item.id),
    sortTemplates(
      [bot({ id: "w", lane: "other", score: 9 }), bot({ id: "e", lane: "other", score: 9 })],
      "top"
    ).map((item) => item.id)
  );
});
