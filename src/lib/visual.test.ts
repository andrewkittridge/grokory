import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CHROMATIC_ACCENTS,
  INDEPENDENCE,
  JOBS,
  ROOT_VARS,
  VISUAL,
  isNearBlack,
  isSunsetFamily,
  parseHex,
} from "./visual";

const src = join(dirname(fileURLToPath(import.meta.url)), "..");

function readSrc(rel: string) {
  return readFileSync(join(src, rel), "utf8");
}

test("default color-scheme is dark and the canvas is near-black", () => {
  assert.equal(VISUAL.colorScheme, "dark");
  assert.equal(isNearBlack(VISUAL.canvas), true);
  const { r, g, b } = parseHex(VISUAL.canvas);
  assert.ok(Math.max(r, g, b) <= 24);
});

test("a single warm sunset-family accent is the chromatic accent", () => {
  assert.equal(VISUAL.accentFamily, "sunset");
  assert.equal(CHROMATIC_ACCENTS.length, 1);
  assert.equal(CHROMATIC_ACCENTS[0], VISUAL.sunset);
  assert.equal(isSunsetFamily(VISUAL.sunset), true);
  assert.equal(isSunsetFamily("#22c55e"), false);
  assert.equal(isSunsetFamily("#3b82f6"), false);
});

test("commons chrome is Grokdex-only and does not invent Sign in", () => {
  const files = [
    "app/commons/page.tsx",
    "app/commons/[slug]/page.tsx",
    "components/enable-speaking.tsx",
    "components/site-header.tsx",
  ];
  for (const file of files) {
    const src = readSrc(file);
    assert.doesNotMatch(src, /Grokory/);
    assert.doesNotMatch(src, /Sign in with/);
    assert.doesNotMatch(src, /OAuth/);
  }
  assert.match(readSrc("components/site-header.tsx"), /JOBS\.commons/);
  assert.match(readSrc("components/enable-speaking.tsx"), /capability token/);
});

test("independence copy names xAI and SpaceXAI", () => {
  assert.match(INDEPENDENCE, /not affiliated/i);
  assert.match(INDEPENDENCE, /xAI/);
  assert.match(INDEPENDENCE, /SpaceXAI/);
});

test("primary job labels for Share, Add, and Board remain", () => {
  assert.equal(JOBS.share, "Share a bot");
  assert.equal(JOBS.add, "Add to Grok Bot");
  assert.equal(JOBS.board, "Board");
  assert.equal(JOBS.commons, "Commons");
});

test("shipped CSS :root matches the token table", () => {
  const css = readSrc("app/globals.css");
  assert.match(css, /color-scheme:\s*dark/);
  for (const [name, value] of Object.entries(ROOT_VARS)) {
    assert.match(
      css,
      new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*${value}`),
      `${name} ${value}`
    );
  }
  assert.equal(isNearBlack(VISUAL.canvas), true);
  assert.match(css, /--font-heading:\s*var\(--font-display\)/);
  assert.doesNotMatch(css, /--font-instrument/);
});

test("chrome imports the shipped token and copy units", () => {
  const layout = readSrc("app/layout.tsx");
  assert.match(layout, /visualStyle/);
  assert.match(layout, /className=\{`[^`]*\bdark\b/);
  assert.doesNotMatch(layout, /Instrument_Serif/);

  const footer = readSrc("components/site-footer.tsx");
  assert.match(footer, /INDEPENDENCE/);
  assert.match(footer, /JOBS/);

  const header = readSrc("components/site-header.tsx");
  assert.match(header, /JOBS\.share/);
  assert.match(header, /JOBS\.board/);

  const add = readSrc("components/add-bot-button.tsx");
  assert.match(add, /JOBS\.add/);
});
