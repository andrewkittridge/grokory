import assert from "node:assert/strict";
import { test } from "node:test";
import {
  breadcrumbListJson,
  definedTermJson,
  guideListJson,
  howToJson,
  personJson,
} from "./json-ld";

test("breadcrumbListJson is Board then listing", () => {
  const json = breadcrumbListJson([
    { name: "Board", path: "/templates" },
    { name: "Writer", path: "/templates/writer-n92u9t" },
  ]);
  assert.equal(json["@type"], "BreadcrumbList");
  assert.equal(json.itemListElement.length, 2);
  assert.equal(json.itemListElement[0]?.name, "Board");
  assert.equal(json.itemListElement[0]?.item, "https://grokdex.net/templates");
  assert.equal(json.itemListElement[1]?.name, "Writer");
  assert.equal(
    json.itemListElement[1]?.item,
    "https://grokdex.net/templates/writer-n92u9t"
  );
});

test("howToJson lists numbered steps", () => {
  const json = howToJson({
    name: "How to list a Grok Bot on Grokdex",
    description: "Paste a public share link.",
    url: "https://grokdex.net/guides/how-to-list",
    steps: [
      { name: "Open Share a bot", text: "Open grokdex.net/upload." },
      { name: "Paste", text: "Paste the https://x.ai/bot/… link." },
    ],
  });
  assert.equal(json["@type"], "HowTo");
  assert.equal(json.step.length, 2);
  assert.equal(json.step[0]?.position, 1);
  assert.equal(json.step[0]?.["@type"], "HowToStep");
});

test("definedTermJson names Grok Bot and points at the what-is guide", () => {
  const json = definedTermJson();
  assert.equal(json["@type"], "DefinedTerm");
  assert.equal(json.name, "Grok Bot");
  assert.equal(json.url, "https://grokdex.net/guides/what-is-grokdex");
  assert.match(json.description, /https:\/\/x\.ai\/bot/);
  assert.equal(json.inDefinedTermSet.name, "Grokdex");
});

test("personJson is an author URL with optional sameAs", () => {
  const json = personJson("Ada", "/authors/ada", "https://x.com/ada");
  assert.equal(json["@type"], "Person");
  assert.equal(json.url, "https://grokdex.net/authors/ada");
  assert.equal(json.sameAs, "https://x.com/ada");
  const bare = personJson("Ada", "/authors/ada");
  assert.equal("sameAs" in bare, false);
});

test("guideListJson lists hub URLs", () => {
  const json = guideListJson([
    { name: "How to list a Grok Bot on Grokdex", path: "/guides/how-to-list" },
  ]);
  assert.equal(json["@type"], "ItemList");
  assert.equal(json.url, "https://grokdex.net/guides");
  assert.equal(json.numberOfItems, 1);
  assert.equal(
    json.itemListElement[0]?.url,
    "https://grokdex.net/guides/how-to-list"
  );
});
