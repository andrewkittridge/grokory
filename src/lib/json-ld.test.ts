import assert from "node:assert/strict";
import { test } from "node:test";
import { breadcrumbListJson, howToJson } from "./json-ld";

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
