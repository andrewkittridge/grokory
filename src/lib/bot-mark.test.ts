import assert from "node:assert/strict";
import { test } from "node:test";
import {
  coatForTheme,
  eyeFillForCoat,
  identifyBotShape,
  parseShareMark,
  resolveBotMark,
  sanitizeMark,
} from "./bot-mark";
import {
  GROK_BOT_BLOB_HEAD,
  GROK_BOT_TEARDROP_HEAD,
} from "./grok-bot-shapes";

const RESEARCH_HTML = `<span class="share-template-mark" style="--share-coat-light:#FFAF38;--share-coat-dark:#FF9800"><svg class="grok-bot-mark" viewBox="-15 -15 259 259"><defs><clipPath id="c"><path d="${GROK_BOT_TEARDROP_HEAD}"></path></clipPath></defs><path class="grok-bot-mark__head" d="M228.54 114.27C228.54 116.76 228.46 119.26 228.3 121.74Z" style="display: none;"></path><path class="grok-bot-mark__head" d="${GROK_BOT_TEARDROP_HEAD}"></path></svg></span>`;

const WRITER_HTML = `<span class="share-template-mark" style="--share-coat-light:#000000;--share-coat-dark:#FFFFFF"><svg class="grok-bot-mark" viewBox="-15 -15 259 259"><defs><clipPath id="c"><path d="${GROK_BOT_BLOB_HEAD}"></path></clipPath></defs><path class="grok-bot-mark__head" d="${GROK_BOT_BLOB_HEAD}"></path></svg></span>`;

test("parseShareMark reads Research as an orange teardrop", () => {
  const mark = parseShareMark(RESEARCH_HTML);
  assert.deepEqual(mark, {
    coatLight: "#FFAF38",
    coatDark: "#FF9800",
    shape: "teardrop",
  });
  const resolved = resolveBotMark(mark!);
  assert.equal(resolved?.coat, "#FF9800");
  assert.equal(resolved?.eyeFill, "#121212");
  assert.equal(resolved?.head, GROK_BOT_TEARDROP_HEAD);
  assert.equal(resolved?.eyes.length, 2);
});

test("parseShareMark reads Writer as a white blob on dark", () => {
  const mark = parseShareMark(WRITER_HTML);
  assert.deepEqual(mark, {
    coatLight: "#000000",
    coatDark: "#FFFFFF",
    shape: "blob",
  });
  assert.equal(coatForTheme(mark!, "dark"), "#FFFFFF");
  assert.equal(eyeFillForCoat("#FFFFFF"), "#121212");
  assert.equal(eyeFillForCoat("#000000"), "#F4F4F5");
});

test("parseShareMark skips the hidden default circle and uses the clip silhouette", () => {
  const html = `<span class="share-template-mark" style="--share-coat-light:#abc;--share-coat-dark:#def"><svg><path class="grok-bot-mark__head" d="M228.54 114.27C228.54 116.76 228.46 119.26 228.3 121.74Z" style="display: none;"></path><defs><clipPath id="c"><path d="${GROK_BOT_TEARDROP_HEAD}"></path></clipPath></defs></svg></span>`;
  const mark = parseShareMark(html);
  assert.equal(mark?.shape, "teardrop");
  assert.equal(mark?.coatLight, "#AABBCC");
  assert.equal(mark?.coatDark, "#DDEEFF");
});

test("identifyBotShape fingerprints the local silhouettes", () => {
  assert.equal(identifyBotShape(GROK_BOT_TEARDROP_HEAD), "teardrop");
  assert.equal(identifyBotShape(GROK_BOT_BLOB_HEAD), "blob");
  assert.equal(
    identifyBotShape("M10 10L20 20L10 30Z M10 10L20 20L10 30Z extra"),
    undefined
  );
});

test("sanitizeMark drops unsafe coats and paths", () => {
  assert.equal(
    sanitizeMark({
      coatLight: "orange",
      coatDark: "#FF9800",
      shape: "teardrop",
    }),
    undefined
  );
  assert.equal(
    sanitizeMark({
      coatLight: "#FFAF38",
      coatDark: "#FF9800",
      headPath: 'M0 0"><script>alert(1)</script>',
    }),
    undefined
  );
  assert.equal(
    sanitizeMark({
      coatLight: "#FFAF38",
      coatDark: "#FF9800",
      shape: "cube",
    }),
    undefined
  );
});
