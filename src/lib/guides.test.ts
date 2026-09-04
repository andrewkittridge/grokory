import assert from "node:assert/strict";
import { test } from "node:test";
import {
  GUIDES,
  GUIDES_HUB_PATH,
  getGuide,
  guideMarkdown,
  guidesHubMarkdown,
} from "./guides";

const SLUGS = [
  "how-to-list",
  "what-is-grokdex",
  "how-to-add",
  "how-to-update",
  "how-to-link-x",
  "how-to-list-with-mcp",
] as const;

test("traffic guides cover list, define, add, update, handle, and MCP", () => {
  assert.equal(GUIDES_HUB_PATH, "/guides");
  assert.deepEqual(
    GUIDES.map((guide) => guide.slug),
    [...SLUGS]
  );
  assert.equal(getGuide("how-to-list")?.title, "How to list a Grok Bot on Grokdex");
  assert.equal(
    getGuide("what-is-grokdex")?.title,
    "What is a Grok Bot / What is Grokdex"
  );
  assert.equal(
    getGuide("how-to-add")?.title,
    "How to add a template to your Grok account"
  );
  assert.equal(
    getGuide("how-to-update")?.title,
    "How to update a Grokdex listing"
  );
  assert.equal(
    getGuide("how-to-link-x")?.title,
    "How to add an X handle to a listing"
  );
  assert.equal(
    getGuide("how-to-list-with-mcp")?.title,
    "How to list a Grok Bot with MCP"
  );
});

test("guide copy stays honest: Grokdex brand, no seeds, no density claims", () => {
  for (const guide of GUIDES) {
    const body = guideMarkdown(guide);
    assert.match(body, /^# /m);
    assert.match(body, /Grokdex/);
    assert.doesNotMatch(body, /Grokory/);
    assert.doesNotMatch(body, /handpicked/i);
    assert.doesNotMatch(body, /403/);
    assert.doesNotMatch(body, /seed bot/i);
    assert.doesNotMatch(body, /review queue/i);
    assert.doesNotMatch(body, /submit for approval/i);
    assert.match(guide.llmsLine, /\S/);
  }
});

test("how-to-list covers free paste and agent self-list", () => {
  const body = guideMarkdown(getGuide("how-to-list")!);
  assert.match(body, /https:\/\/x\.ai\/bot/);
  assert.match(body, /free/i);
  assert.match(body, /no account/i);
  assert.match(body, /list_bot/);
  assert.match(body, /not affiliated with xAI/);
  assert.equal(getGuide("how-to-list")?.howTo?.length, 4);
});

test("how-to-add says adds are clicks not installs", () => {
  const body = guideMarkdown(getGuide("how-to-add")!);
  assert.match(body, /click/);
  assert.match(body, /not a confirmed install/);
  assert.match(body, /Preview/);
  assert.equal(getGuide("how-to-add")?.howTo?.length, 3);
});

test("what-is distinguishes Grok Bot from Grokdex", () => {
  const body = guideMarkdown(getGuide("what-is-grokdex")!);
  assert.match(body, /## What is a Grok Bot\?/);
  assert.match(body, /## What is Grokdex\?/);
  assert.match(body, /does not invent listings/);
  assert.match(body, /not affiliated with xAI/);
  assert.equal(getGuide("what-is-grokdex")?.howTo, null);
});

test("how-to-update re-pastes the share URL and keeps the first handle", () => {
  const guide = getGuide("how-to-update")!;
  const body = guideMarkdown(guide);
  assert.match(body, /same public share URL|same `https:\/\/x\.ai\/bot/i);
  assert.match(body, /first X handle still sticks/);
  assert.match(body, /list_bot/);
  assert.match(body, /no Grokdex account/i);
  assert.equal(guide.howTo?.length, 4);
});

test("how-to-link-x is a public label, not a login", () => {
  const guide = getGuide("how-to-link-x")!;
  const body = guideMarkdown(guide);
  assert.match(body, /not Sign in with X/);
  assert.match(body, /does not verify/);
  assert.match(body, /first handle sticks/);
  assert.equal(guide.howTo?.length, 4);
});

test("how-to-list-with-mcp documents list_bot and the skill", () => {
  const guide = getGuide("how-to-list-with-mcp")!;
  const body = guideMarkdown(guide);
  assert.match(body, /list_bot/);
  assert.match(body, /\/mcp/);
  assert.match(body, /list-a-grok-bot/);
  assert.match(body, /\/api\/bots/);
  assert.match(body, /do not need a Grokdex account/i);
  assert.equal(guide.howTo?.length, 3);
});

test("guides hub markdown lists every guide", () => {
  const body = guidesHubMarkdown();
  assert.match(body, /^# Guides/m);
  for (const guide of GUIDES) {
    assert.match(body, new RegExp(`${guide.path}/index\\.md`));
    assert.match(body, new RegExp(guide.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
