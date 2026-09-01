import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { fetchBotPreview, parseBotHtml } from "./fetch-bot";

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
  assert.deepEqual(page.skills, ["Web search", "Citations"]);
  assert.deepEqual(page.routines, ["Morning brief"]);
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
