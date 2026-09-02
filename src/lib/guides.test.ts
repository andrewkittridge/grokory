import assert from "node:assert/strict";
import { test } from "node:test";
import { GUIDES, getGuide, guideMarkdown } from "./guides";

test("three traffic guides exist with Writer titles", () => {
  assert.equal(GUIDES.length, 3);
  assert.equal(getGuide("how-to-list")?.title, "How to list a Grok Bot on Grokdex");
  assert.equal(
    getGuide("what-is-grokdex")?.title,
    "What is a Grok Bot / What is Grokdex"
  );
  assert.equal(
    getGuide("how-to-add")?.title,
    "How to add a template to your Grok account"
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
