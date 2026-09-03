import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  TWITTER_SITE,
  pageMetadata,
  twitterMeta,
} from "./site";

test("twitter:site is omitted without a stable handle", () => {
  assert.equal(TWITTER_SITE, undefined);
  const card = twitterMeta("FAQ · Grokdex", "What Grokdex is.");
  assert.equal("site" in card, false);
  assert.equal(card.card, "summary_large_image" as const);
});

test("pageMetadata sets page-specific OG url and title", () => {
  const faq = pageMetadata({
    title: "FAQ",
    description: "What Grokdex is.",
    path: "/faq",
  });
  assert.equal(faq.title, "FAQ");
  assert.equal(faq.openGraph?.url, "https://grokdex.net/faq");
  assert.equal(faq.openGraph?.title, "FAQ · Grokdex");
  assert.notEqual(faq.openGraph?.url, "https://grokdex.net");
  assert.equal(faq.alternates?.canonical, "/faq");
  assert.equal(faq.twitter && "site" in faq.twitter, false);

  const board = pageMetadata({
    title: "The board",
    description: "A public board of Grok Bot share links.",
    path: "/templates",
  });
  assert.equal(board.openGraph?.url, "https://grokdex.net/templates");
  assert.equal(board.openGraph?.title, "The board · Grokdex");
});

test("site title and description name the ranked directory", () => {
  assert.match(SITE_TITLE, /directory/i);
  assert.match(SITE_DESCRIPTION, /ranked/i);
  assert.match(SITE_DESCRIPTION, /x\.ai/);
});
