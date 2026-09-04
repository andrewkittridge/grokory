import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { GROK_BOT_EYE_L, GROK_BOT_EYE_R } from "./grok-bot-shapes";
import {
  GROK_BOT_ENTER_CLASS,
  enterGrokBot,
} from "./grok-bot-motion";

const src = join(dirname(fileURLToPath(import.meta.url)), "..");

function readSrc(rel: string) {
  return readFileSync(join(src, rel), "utf8");
}

function fakeBot() {
  const tokens = new Set<string>();
  return {
    offsetWidth: 120,
    classList: {
      add(name: string) {
        tokens.add(name);
      },
      remove(name: string) {
        tokens.delete(name);
      },
      contains(name: string) {
        return tokens.has(name);
      },
    },
  } as unknown as HTMLElement;
}

test("enterGrokBot skips the load class when motion is reduced", () => {
  const el = fakeBot();
  enterGrokBot(el, true);
  assert.equal(el.classList.contains(GROK_BOT_ENTER_CLASS), false);
});

test("enterGrokBot applies the load-entrance class without reduced motion", () => {
  const el = fakeBot();
  enterGrokBot(el, false);
  assert.equal(el.classList.contains(GROK_BOT_ENTER_CLASS), true);
});

test("standard white mark ships both eye paths", () => {
  assert.ok(GROK_BOT_EYE_L.includes("M"));
  assert.ok(GROK_BOT_EYE_R.includes("M"));
  assert.notEqual(GROK_BOT_EYE_L, GROK_BOT_EYE_R);
  const mark = readSrc("components/grok-bot.tsx");
  assert.match(mark, /GROK_BOT_EYE_L/);
  assert.match(mark, /GROK_BOT_EYE_R/);
  assert.match(mark, /function GrokBotMark/);
});

test("home landing mounts a large grok-bot that plays the load entrance", () => {
  const hero = readSrc("components/landing-hero.tsx");
  assert.match(hero, /<GrokBot/);
  assert.match(hero, /enterOnMount/);
  assert.match(hero, /landing-mascot/);
  assert.doesNotMatch(hero, /bot-thumb/);
  const bot = readSrc("components/grok-bot.tsx");
  assert.match(bot, /enterGrokBot/);
  assert.match(bot, /enterOnMount/);
});

test("load-entrance CSS is wired and killed under reduced motion", () => {
  const css = readSrc("app/globals.css");
  assert.match(
    css,
    /\.grok-bot-entering\s+\.grok-bot-motion\s*\{[^}]*animation:\s*bot-hop/
  );
  const reduced = css.split("@media (prefers-reduced-motion: reduce)")[1];
  assert.ok(reduced, "reduced-motion block");
  assert.match(reduced, /\.grok-bot-entering/);
  assert.match(reduced, /animation:\s*none/);
});
