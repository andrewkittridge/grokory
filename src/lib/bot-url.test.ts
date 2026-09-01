import assert from "node:assert/strict";
import { test } from "node:test";
import {
  authorSlug,
  formatAdds,
  grokbotTemplateUrl,
  isGoneError,
  listingPostText,
  parseShareUrl,
  parseTags,
  slugify,
} from "./bot-url";

test("grokbotTemplateUrl is the app add deep link", () => {
  assert.equal(
    grokbotTemplateUrl("Q6NiveEqmhIiYir_ZQG-4"),
    "grokbot://app/v1/bot-template?id=Q6NiveEqmhIiYir_ZQG-4"
  );
});

test("parseShareUrl accepts a canonical x.ai/bot link", () => {
  const parsed = parseShareUrl("https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN");
  assert.deepEqual(parsed, {
    botId: "N92u9t1nHlL_gtgk2nAeN",
    botUrl: "https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN",
  });
});

test("parseShareUrl strips trailing path, query, and hash", () => {
  const parsed = parseShareUrl(
    "https://x.ai/bot/XjQ-AZTMrGLmQOTeMu3LF/ary-s-ea?ref=list#preview"
  );
  assert.deepEqual(parsed, {
    botId: "XjQ-AZTMrGLmQOTeMu3LF",
    botUrl: "https://x.ai/bot/XjQ-AZTMrGLmQOTeMu3LF",
  });
});

test("parseShareUrl accepts www, http, and a trailing slash", () => {
  const parsed = parseShareUrl("http://www.x.ai/bot/Ub3T7usX-c6yRQibQq83P/");
  assert.equal(parsed?.botId, "Ub3T7usX-c6yRQibQq83P");
  assert.equal(parsed?.botUrl, "https://x.ai/bot/Ub3T7usX-c6yRQibQq83P");
});

test("parseShareUrl accepts a bare bot id", () => {
  const parsed = parseShareUrl("N92u9t1nHlL_gtgk2nAeN");
  assert.equal(parsed?.botId, "N92u9t1nHlL_gtgk2nAeN");
});

test("parseShareUrl rejects junk", () => {
  assert.equal(parseShareUrl(""), null);
  assert.equal(parseShareUrl("https://x.ai/bot/short"), null);
  assert.equal(parseShareUrl("https://example.com/bot/N92u9t1nHlL_gtgk2nAeN"), null);
});

test("slugify uses the title and a bot-id suffix", () => {
  assert.equal(
    slugify("Chief of Agents", "N92u9t1nHlL_gtgk2nAeN"),
    "chief-of-agents-n92u9t"
  );
});

test("parseTags splits, lowercases, and caps the list", () => {
  assert.deepEqual(parseTags("Chief of Staff, #Routing, extra"), [
    "chief-of-staff",
    "routing",
    "extra",
  ]);
  assert.equal(parseTags("a,b,c,d,e,f,g,h,i").length, 8);
});

test("authorSlug and gone detection", () => {
  assert.equal(authorSlug("Andrew"), "andrew");
  assert.equal(authorSlug("  "), "unknown");
  assert.equal(isGoneError("x.ai returned 404. That share link may have been taken down."), true);
  assert.equal(isGoneError("Could not reach x.ai"), false);
});

test("formatAdds and listingPostText", () => {
  assert.equal(formatAdds(0), "0 adds");
  assert.equal(formatAdds(1), "1 add");
  assert.equal(formatAdds(12), "12 adds");
  assert.equal(
    listingPostText("Research", "https://grokdex.net/templates/research-q6nive"),
    "Research — a public Grok Bot on Grokdex https://grokdex.net/templates/research-q6nive"
  );
});
