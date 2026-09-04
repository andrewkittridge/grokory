import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { MCP_PATH, SKILL_DOCS } from "./agent";
import { absUrl } from "./site";

const src = join(dirname(fileURLToPath(import.meta.url)), "..");

function readSrc(rel: string) {
  return readFileSync(join(src, rel), "utf8");
}

test("paste UI copies the shipped list-a-grok-bot skill and public MCP URL", () => {
  const skill = SKILL_DOCS["list-a-grok-bot"].body.trim();
  const mcpUrl = absUrl(MCP_PATH);
  assert.match(skill, /list_bot/);
  assert.match(skill, /list me on Grokdex/i);
  assert.equal(MCP_PATH, "/mcp");
  assert.equal(mcpUrl, "https://grokdex.net/mcp");

  const paste = readSrc("components/bot-list-paste.tsx");
  assert.match(paste, /SKILL_DOCS\["list-a-grok-bot"\]/);
  assert.match(paste, /absUrl\(MCP_PATH\)/);
  assert.match(paste, /Copy skill/);
  assert.match(paste, /Copy MCP/);
});

test("home landing composes the paste strip before the ranked board", () => {
  const hero = readSrc("components/landing-hero.tsx");
  const pasteAt = hero.indexOf("<BotListPaste");
  const boardAt = hero.indexOf("{children}");
  assert.ok(pasteAt >= 0, "hero mounts BotListPaste");
  assert.ok(boardAt > pasteAt, "paste comes before the board slot");

  const page = readSrc("app/page.tsx");
  assert.match(page, /LandingBoard/);
  assert.doesNotMatch(page, /LandingHow/);
  const pageBoard = page.indexOf("<LandingBoard");
  const pagePaste = page.indexOf("BotListPaste");
  assert.ok(pageBoard >= 0);
  assert.equal(pagePaste, -1);
});
