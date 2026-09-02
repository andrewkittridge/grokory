import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  extractSharePayload,
  fetchBotPreview,
  parseBotHtml,
} from "./fetch-bot";
import { GROK_BOT_TEARDROP_HEAD } from "./grok-bot-shapes";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function htmlResponse(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: { "content-type": "text/html" },
  });
}

test("fetchBotPreview reads title, author, and description from x.ai html", async () => {
  globalThis.fetch = (async () =>
    htmlResponse(`<!doctype html>
      <meta property="og:title" content="Loops by Matt Palmer" />
      <meta property="og:description" content="Generalized engineering outer loop." />
      <meta property="og:image" content="https://x.ai/bot/Ub3T7usX-c6yRQibQq83P/og.png" />
      <h1 title="Loops">Loops</h1>
      <p class="text-secondary text-sm">by Matt Palmer</p>
      <p title="Generalized engineering outer loop. Sits above coding agents." class="text-secondary mt-3">loop</p>
    `)) as typeof fetch;

  const result = await fetchBotPreview(
    "https://x.ai/bot/Ub3T7usX-c6yRQibQq83P/extra"
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.preview.botId, "Ub3T7usX-c6yRQibQq83P");
  assert.equal(result.preview.title, "Loops");
  assert.equal(result.preview.authorName, "Matt Palmer");
  assert.match(result.preview.description, /coding agents/);
  assert.equal(
    result.preview.ogImage,
    "https://x.ai/bot/Ub3T7usX-c6yRQibQq83P/og.png"
  );
  assert.equal(
    result.preview.addHref,
    "grokbot://app/v1/bot-template?id=Ub3T7usX-c6yRQibQq83P"
  );
});

test("fetchBotPreview reports a 404", async () => {
  globalThis.fetch = (async () => htmlResponse("missing", 404)) as typeof fetch;
  const result = await fetchBotPreview("https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /404/);
});

test("parseBotHtml reads the live x.ai preview shape and optional lists", () => {
  const page = parseBotHtml(`<!doctype html>
    <meta property="og:title" content="Research by Andrew" />
    <meta property="og:description" content="Primary-source research." />
    <h1 title="Research">Research</h1>
    <p class="text-secondary text-sm">by Andrew</p>
    <p title="Primary-source research for cited answers." class="text-secondary mt-3">desc</p>
    <a href="grokbot://app/v1/bot-template?id=Q6NiveEqmhIiYir_ZQG-4">Add</a>
    <h2>Skills</h2>
    <ul><li>Web search</li><li>Citations</li></ul>
    <h2>Routines</h2>
    <ul><li>Morning brief</li></ul>
  `);
  assert.equal(page.gone, false);
  assert.equal(page.title, "Research");
  assert.equal(page.authorName, "Andrew");
  assert.equal(
    page.addHref,
    "grokbot://app/v1/bot-template?id=Q6NiveEqmhIiYir_ZQG-4"
  );
  assert.deepEqual(page.skills, ["Web search", "Citations"]);
  assert.deepEqual(page.routines, ["Morning brief"]);
});

const LIVE_RSC = String.raw`<script>self.__next_f.push([1,"2c:{\"state\":{\"data\":{\"id\":\"Q6NiveEqmhIiYir_ZQG-4\",\"ownerType\":\"USER\",\"sharerName\":\"Andrew Kittridge\",\"botName\":\"Research\",\"description\":\"Primary-source research for anyone who needs cited answers.\",\"addHref\":\"grokbot://app/v1/bot-template?id=Q6NiveEqmhIiYir_ZQG-4\"}}}"])</script>`;

test("parseBotHtml reads identity from the live x.ai RSC payload", () => {
  const html = `<!doctype html>
    <meta property="og:title" content="Research by Andrew" />
    <h1 title="Research">Research</h1>
    <p class="text-secondary text-sm">by Andrew</p>
    <a href="grokbot://app/v1/bot-template?id=Q6NiveEqmhIiYir_ZQG-4">Add to Grok Bot</a>
    ${LIVE_RSC}
  `;
  const payload = extractSharePayload(html);
  assert.equal(payload?.sharerName, "Andrew Kittridge");
  assert.equal(payload?.botName, "Research");
  const page = parseBotHtml(html);
  assert.equal(page.title, "Research");
  assert.equal(page.authorName, "Andrew Kittridge");
  assert.match(page.description ?? "", /cited answers/);
  assert.equal(
    page.addHref,
    "grokbot://app/v1/bot-template?id=Q6NiveEqmhIiYir_ZQG-4"
  );
  assert.deepEqual(page.skills, []);
  assert.deepEqual(page.routines, []);
});

test("parseBotHtml reads the share-page identity mark", () => {
  const page = parseBotHtml(`<!doctype html>
    <h1 title="Research">Research</h1>
    <span class="share-template-mark" style="--share-coat-light:#FFAF38;--share-coat-dark:#FF9800">
      <svg class="grok-bot-mark" viewBox="-15 -15 259 259">
        <defs><clipPath id="c"><path d="${GROK_BOT_TEARDROP_HEAD}"></path></clipPath></defs>
        <path class="grok-bot-mark__head" d="${GROK_BOT_TEARDROP_HEAD}"></path>
      </svg>
    </span>
  `);
  assert.deepEqual(page.mark, {
    coatLight: "#FFAF38",
    coatDark: "#FF9800",
    shape: "teardrop",
  });
});

test("parseBotHtml marks a missing bot as gone", () => {
  const page = parseBotHtml(`<!doctype html><title>Page not found</title><p>Page not found</p>`);
  assert.equal(page.gone, true);
});

test("fetchBotPreview rejects an invalid link without fetching", async () => {
  let called = false;
  globalThis.fetch = (async () => {
    called = true;
    return htmlResponse("");
  }) as typeof fetch;
  const result = await fetchBotPreview("not-a-bot");
  assert.equal(result.ok, false);
  assert.equal(called, false);
});
