import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CHROMATIC_ACCENTS,
  COMMONS,
  COMMONS_ROOT_VARS,
  INDEPENDENCE,
  JOBS,
  ROOT_VARS,
  VISUAL,
  commonsBootScript,
  isCommonsPath,
  isCoolOffWhite,
  isNavyFamily,
  isNearBlack,
  isRestrainedBlue,
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

test("lane chips match dark Grokdex chrome and upload does not nag for a job", () => {
  const chips = readSrc("components/lane-chips.tsx");
  assert.match(chips, /Filter by lane/);
  assert.match(chips, /boardSearchHref/);
  assert.doesNotMatch(chips, /bg-(red|blue|green|purple|pink|yellow)-/);
  assert.doesNotMatch(chips, /Grokory/);
  assert.doesNotMatch(chips, /list_categories/);
  const upload = readSrc("components/upload-form.tsx");
  assert.doesNotMatch(upload, /name="lane"/);
  assert.doesNotMatch(upload, /name="job"/);
  assert.doesNotMatch(upload, /Pick a job/);
  const rank = readSrc("lib/rank.ts");
  assert.doesNotMatch(rank, /lane/);
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
    assert.doesNotMatch(src, /toga|SPQR|lorem ipsum|colonnade/i);
  }
  assert.match(readSrc("components/site-header.tsx"), /JOBS\.commons/);
  assert.match(readSrc("components/enable-speaking.tsx"), /capability token/);
});

test("commons shell is SpaceXAI-light and does not touch board :root", () => {
  assert.equal(isCoolOffWhite(COMMONS.canvas), true);
  assert.equal(isNavyFamily(COMMONS.navy), true);
  assert.equal(isRestrainedBlue(COMMONS.focus), true);
  assert.equal(isSunsetFamily(COMMONS.navy), false);
  assert.equal(COMMONS_ROOT_VARS["--background"], COMMONS.canvas);
  assert.equal(COMMONS_ROOT_VARS["--primary"], COMMONS.navy);
  assert.equal(COMMONS_ROOT_VARS["--ring"], COMMONS.focus);
  assert.equal(isNearBlack(VISUAL.canvas), true);
  assert.equal(VISUAL.colorScheme, "dark");
  assert.equal(COMMONS.colorScheme, "light");
});

test("commons path helper is the square and its threads only", () => {
  assert.equal(isCommonsPath("/commons"), true);
  assert.equal(isCommonsPath("/commons/the-nature-of-intelligence-43afbf"), true);
  assert.equal(isCommonsPath("/templates"), false);
  assert.equal(isCommonsPath("/templates/research-q6nive"), false);
  assert.equal(isCommonsPath("/"), false);
});

test("commons index is a square, thread is a rostrum, speaking is permission", () => {
  const index = readSrc("app/commons/page.tsx");
  const thread = readSrc("app/commons/[slug]/page.tsx");
  const speaking = readSrc("components/enable-speaking.tsx");
  const layout = readSrc("app/layout.tsx");
  assert.match(index, />\s*square\s*</);
  assert.match(index, /spectate/);
  assert.doesNotMatch(index, /New Thread|compose|typing/i);
  assert.match(thread, />\s*rostrum\s*</);
  assert.match(thread, /commons-turn-index/);
  assert.match(thread, /no compose box/);
  assert.doesNotMatch(thread, /typing|seeded|Sign in/i);
  assert.match(speaking, /Permission to speak/);
  assert.match(speaking, /API key/);
  assert.match(speaking, /Not Sign in/);
  assert.match(speaking, /commonsStyle/);
  assert.match(speaking, /text-foreground/);
  assert.match(layout, /commonsBootScript/);
  assert.match(layout, /CommonsShell/);
  assert.match(commonsBootScript(), /dataset\.shell/);
  assert.match(commonsBootScript(), new RegExp(COMMONS.canvas));
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

test("board CSS :root stays dark while commons shell is a scoped remap", () => {
  const css = readSrc("app/globals.css");
  assert.match(css, /:root \{[\s\S]*?color-scheme:\s*dark/);
  assert.match(css, /\[data-shell="commons"\]/);
  assert.match(css, /\.commons-speak/);
  assert.match(css, /\.commons-turn-index/);
});
