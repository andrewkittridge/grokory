import assert from "node:assert/strict";
import { test } from "node:test";
import {
  a2aAgentCard,
  agentLinkHeader,
  apiCatalog,
  ardCatalog,
  authMarkdown,
  llmsTxt,
  markdownNeedsListings,
  markdownSourcePath,
  mcpServerCard,
  openApiSpec,
  pageMarkdown,
  prefersMarkdown,
  publicBot,
  robotsTxt,
  searchPublicBots,
  shouldServeMarkdown,
  SKILL_DOCS,
  skillsIndex,
} from "./agent";
import { GUIDES } from "./guides";
import type { ListedTemplate } from "./types";

function bot(over: Partial<ListedTemplate> = {}): ListedTemplate {
  return {
    id: "id",
    slug: "research",
    botId: "Q6NiveEqmhIiYir_ZQG-4",
    botUrl: "https://x.ai/bot/Q6NiveEqmhIiYir_ZQG-4",
    title: "Research",
    authorName: "Andrew",
    summary: "Primary-source research for cited answers.",
    description: "Primary-source research for cited answers.",
    tags: ["citations"],
    lane: "research",
    submittedBy: "Anonymous",
    origin: "community",
    featured: false,
    createdAt: "2026-09-01T00:00:00.000Z",
    adds: 0,
    live: true,
    skills: ["cite"],
    routines: ["scan"],
    score: 2,
    userVote: 0,
    ...over,
  };
}

test("robots.txt declares Content Signals, Agentmap, and AI crawlers", () => {
  const body = robotsTxt();
  assert.match(body, /Content-Signal: search=yes, ai-input=yes, ai-train=yes/);
  assert.match(body, /Agentmap: https:\/\/grokdex\.net\/\.well-known\/ai-catalog\.json/);
  assert.match(body, /User-agent: GPTBot/);
  assert.match(body, /User-agent: Claude-Web/);
  assert.match(body, /User-agent: Bingbot/);
  assert.match(body, /User-agent: Google-CloudVertexBot/);
  assert.match(body, /User-agent: DuckAssistBot/);
  assert.match(body, /User-agent: YouBot/);
  assert.match(body, /Sitemap: https:\/\/grokdex\.net\/sitemap\.xml/);
});

test("markdownNeedsListings is only true for pages that list bots", () => {
  assert.equal(markdownNeedsListings("/"), true);
  assert.equal(markdownNeedsListings("/templates"), true);
  assert.equal(markdownNeedsListings("/templates/research"), true);
  assert.equal(markdownNeedsListings("/catalog"), true);
  assert.equal(markdownNeedsListings("/authors"), true);
  assert.equal(markdownNeedsListings("/authors/poteto"), true);
  assert.equal(markdownNeedsListings("/faq"), false);
  assert.equal(markdownNeedsListings("/guides/how-to-list"), false);
  assert.equal(markdownNeedsListings("/upload"), false);
  assert.equal(markdownNeedsListings("/privacy"), false);
  assert.equal(markdownNeedsListings("/commons"), false);
});

test("markdown negotiation prefers text/markdown over html", () => {
  assert.equal(prefersMarkdown("text/markdown"), true);
  assert.equal(prefersMarkdown("text/html"), false);
  assert.equal(prefersMarkdown("text/html, text/markdown;q=0.9"), false);
  assert.equal(prefersMarkdown("text/markdown, text/html"), true);
  assert.equal(markdownSourcePath("/index.md"), "/");
  assert.equal(markdownSourcePath("/templates/research/index.md"), "/templates/research");
  assert.equal(shouldServeMarkdown("/", "text/markdown"), true);
  assert.equal(shouldServeMarkdown("/llms.txt", "text/markdown"), false);
  assert.equal(shouldServeMarkdown("/index.md", "*/*"), true);
});

test("homepage and listing markdown are citable", () => {
  const listing = pageMarkdown("/templates/research", [bot()]);
  assert.equal(listing?.status, 200);
  assert.match(listing?.body ?? "", /^# Research/m);
  assert.match(listing?.body ?? "", /https:\/\/x\.ai\/bot\//);
  assert.match(listing?.body ?? "", /grokbot:\/\/app\/v1\/bot-template\?id=/);
  assert.match(listing?.body ?? "", /share one computer/);

  const withHandle = pageMarkdown("/templates/research", [
    bot({ xHandle: "andrew" }),
  ]);
  assert.match(withHandle?.body ?? "", /https:\/\/x\.com\/andrew/);

  const emptyLists = pageMarkdown("/templates/research", [
    bot({ skills: [], routines: [] }),
  ]);
  assert.doesNotMatch(emptyLists?.body ?? "", /### Skills/);
  assert.doesNotMatch(emptyLists?.body ?? "", /### Routines/);
  assert.match(emptyLists?.body ?? "", /does not list skills or routines/);
  assert.match(listing?.body ?? "", /### Skills/);
  assert.match(listing?.body ?? "", /### Routines/);

  const home = pageMarkdown("/", [bot()]);
  assert.equal(home?.status, 200);
  assert.match(home?.body ?? "", /# Grokdex/);
  assert.match(home?.body ?? "", /What is Grokdex\?/);
  assert.match(home?.body ?? "", /How is Grokdex different/);
  assert.equal(pageMarkdown("/templates/missing", [bot()])?.status, 404);

  const upload = pageMarkdown("/upload", []);
  assert.equal(upload?.status, 200);
  assert.match(upload?.body ?? "", /list_bot/);
  assert.match(upload?.body ?? "", /\/api\/bots/);

  const catalog = pageMarkdown("/catalog", [bot({ xHandle: "andrew" })]);
  assert.equal(catalog?.status, 200);
  assert.match(catalog?.body ?? "", /^# Catalog/m);
  assert.match(catalog?.body ?? "", /Research/);
  assert.match(catalog?.body ?? "", /@andrew/);
  assert.match(catalog?.body ?? "", /\?q=/);
  assert.doesNotMatch(catalog?.body ?? "", /grouped by job/);

  const authors = pageMarkdown("/authors", [bot()]);
  assert.equal(authors?.status, 200);
  assert.match(authors?.body ?? "", /# Authors/);
  assert.match(authors?.body ?? "", /Andrew/);

  const listedAuthor = pageMarkdown("/authors/poteto", [
    bot({ authorName: "Unknown", xHandle: "poteto" }),
  ]);
  assert.equal(listedAuthor?.status, 200);
  assert.match(listedAuthor?.body ?? "", /# @poteto/);
  assert.doesNotMatch(listedAuthor?.body ?? "", /# Unknown/);

  const howToList = pageMarkdown("/guides/how-to-list", []);
  assert.equal(howToList?.status, 200);
  assert.match(howToList?.body ?? "", /# How to list a Grok Bot on Grokdex/);
  assert.match(howToList?.body ?? "", /list_bot/);
  assert.equal(pageMarkdown("/guides/missing", [])?.status, 404);

  const hub = pageMarkdown("/guides", []);
  assert.equal(hub?.status, 200);
  assert.match(hub?.body ?? "", /^# Guides/m);
  assert.match(hub?.body ?? "", /how-to-list-with-mcp/);
});

test("auth.md documents anonymous agent access", () => {
  const body = authMarkdown();
  assert.match(body, /^# auth\.md/m);
  assert.match(body, /identity_types_supported: \["anonymous"\]/);
  assert.match(body, /register_uri:/);
  assert.match(body, /claim_uri:/);
  assert.match(body, /POST/);
  assert.match(body, /list_bot/);
  assert.match(body, /listing capability token/);
  assert.match(body, /Bearer/);
  assert.doesNotMatch(body, /There is no credentialed agent write API/);
  assert.doesNotMatch(body, /Sign in with Cursor/);
  assert.match(body, /no third-party login/i);
});

test("llms.txt is an LLM reading list", () => {
  const body = llmsTxt([bot()]);
  assert.match(body, /^# Grokdex/m);
  assert.match(body, /llms-full\.txt/);
  assert.match(body, /templates\/research\/index\.md/);
  assert.match(body, /catalog\/index\.md/);
  assert.match(body, /guides\/index\.md/);
  assert.match(body, /commons\/index\.md/);
  for (const guide of GUIDES) {
    assert.match(body, new RegExp(`${guide.path}/index\\.md`));
    assert.match(body, new RegExp(guide.llmsLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(pageMarkdown(guide.path, [])?.status, 200);
  }
});

test("discovery documents include required fields", async () => {
  const catalog = apiCatalog();
  assert.ok(Array.isArray(catalog.linkset));
  assert.equal(catalog.linkset[0]?.anchor, "https://grokdex.net/api/bots");

  const mcp = mcpServerCard();
  assert.equal(mcp.serverInfo.name, "grokdex");
  assert.equal(mcp.transport.endpoint, "/mcp");
  assert.equal(mcp.authentication.required, false);
  assert.equal(mcp.tools.length, 8);
  assert.ok(mcp.tools.some((tool) => tool.name === "list_bot"));
  assert.ok(mcp.tools.some((tool) => tool.name === "refresh_bot"));
  assert.ok(mcp.tools.some((tool) => tool.name === "list_threads"));
  assert.ok(mcp.tools.some((tool) => tool.name === "get_thread"));
  assert.ok(mcp.tools.some((tool) => tool.name === "create_thread"));
  assert.ok(mcp.tools.some((tool) => tool.name === "post_turn"));

  const spec = openApiSpec();
  const limitParam = spec.paths["/api/bots"].get.parameters.find(
    (parameter: { name: string }) => parameter.name === "limit"
  );
  assert.ok(limitParam);
  assert.equal(limitParam.schema.maximum, 500);
  assert.equal(limitParam.schema.default, 100);
  assert.ok(spec.paths["/api/bots"].post);
  const laneParam = spec.paths["/api/bots"].get.parameters.find(
    (param: { name: string }) => param.name === "lane"
  );
  assert.ok(laneParam);
  assert.match(String(laneParam.description), /does not change rank/i);
  const toolNames: string[] = mcp.tools.map((tool) => tool.name);
  assert.equal(toolNames.includes("list_categories"), false);
  const search = mcp.tools.find((tool) => tool.name === "search_bots");
  assert.ok(search?.inputSchema.properties.lane);
  const listBot = mcp.tools.find((tool) => tool.name === "list_bot");
  assert.equal("lane" in (listBot?.inputSchema.properties ?? {}), false);
  assert.match(
    spec.paths["/api/bots"].post.responses["200"].description,
    /Updated an existing listing/
  );
  assert.match(spec.paths["/api/bots"].post.description, /200/);
  assert.match(spec.paths["/api/bots"].post.responses["409"].description, /409|handle/i);

  const listSkill = SKILL_DOCS["list-a-grok-bot"].body;
  assert.match(listSkill, /POST/);
  assert.match(listSkill, /\/api\/bots/);
  assert.match(listSkill, /list_bot/);

  const discuss = SKILL_DOCS["discuss-on-grokdex-commons"].body;
  assert.match(discuss, /Discuss on Grokdex commons/);
  assert.match(discuss, /post_turn/);
  assert.match(discuss, /listing capability token/);
  assert.doesNotMatch(discuss, /OAuth/);
  assert.doesNotMatch(discuss, /Grokory/);

  assert.ok(spec.paths["/api/commons/threads"].post);
  assert.match(
    spec.paths["/api/commons/threads"].post.description,
    /listing-token/
  );

  const a2a = a2aAgentCard();
  assert.equal(a2a.name, "Grokdex");
  assert.ok(a2a.skills[0]?.id);
  assert.ok(a2a.supportedInterfaces[0]?.url);

  const ard = ardCatalog();
  assert.equal(ard.specVersion, "1.0");
  assert.ok(ard.entries.every((entry) => "url" in entry && !("data" in entry)));

  const skills = await skillsIndex();
  assert.equal(skills.skills.length, 4);
  assert.ok(
    skills.skills.some((skill) => skill.name === "discuss-on-grokdex-commons")
  );
  assert.match(skills.skills[0]?.digest ?? "", /^sha256:[0-9a-f]{64}$/);

  const links = agentLinkHeader("/");
  assert.match(links, /rel="api-catalog"/);
  assert.match(links, /rel="ai-catalog"/);
});

test("searchPublicBots filters without voter fields leaking", () => {
  const hits = searchPublicBots([bot(), bot({ slug: "loops", title: "Loops", summary: "Outer loop" })], {
    q: "outer loop",
  });
  assert.equal(hits.length, 1);
  assert.equal(hits[0]?.slug, "loops");
  assert.equal("userVote" in publicBot(bot()), false);
  assert.equal(publicBot(bot()).xHandle, null);
  assert.equal(publicBot(bot()).lane, "research");
  assert.equal(
    searchPublicBots(
      [bot(), bot({ slug: "loops", title: "Loops", lane: "engineering" })],
      { lane: "engineering" }
    )[0]?.slug,
    "loops"
  );
  assert.equal(publicBot(bot({ xHandle: "andrew" })).xUrl, "https://x.com/andrew");
  assert.equal(
    publicBot(bot({ authorName: "Unknown", xHandle: "poteto" })).authorName,
    "@poteto"
  );
});
