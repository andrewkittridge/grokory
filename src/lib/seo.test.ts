import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const src = join(dirname(fileURLToPath(import.meta.url)), "..");

function readSrc(rel: string) {
  return readFileSync(join(src, rel), "utf8");
}

test("board and catalog loading fallbacks do not emit an h1", () => {
  const board = readSrc("app/templates/loading.tsx");
  const catalog = readSrc("app/catalog/loading.tsx");
  assert.doesNotMatch(board, /<h1\b/);
  assert.doesNotMatch(catalog, /<h1\b/);
});

test("FAQ is dynamic so Accept markdown is not cached as HTML for a year", () => {
  const faq = readSrc("app/faq/page.tsx");
  assert.match(faq, /export const dynamic = "force-dynamic"/);
});

test("list thumbs wait until mount so SSR HTML is not a pile of SVG paths", () => {
  const thumbs = readSrc("components/bot-identity.tsx");
  assert.match(thumbs, /setPainted\(true\)/);
  assert.match(thumbs, /painted \?/);
});

test("markdown route skips the catalog when the page has no listings", () => {
  const route = readSrc("app/agent/markdown/route.ts");
  assert.match(route, /markdownNeedsListings/);
});
