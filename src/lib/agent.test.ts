import assert from "node:assert/strict";
import { test } from "node:test";
import {
  a2aAgentCard,
  agentLinkHeader,
  apiCatalog,
  ardCatalog,
  authMarkdown,
  llmsTxt,
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
    category: "Research",
    tags: ["citations"],
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
  assert.match(body, /Sitemap: https:\/\/grokdex\.net\/sitemap\.xml/);
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

  const home = pageMarkdown("/", [bot()]);
  assert.equal(home?.status, 200);
  assert.match(home?.body ?? "", /# Grokdex/);
  assert.match(home?.body ?? "", /What is Grokdex\?/);
  assert.equal(pageMarkdown("/templates/missing", [bot()])?.status, 404);

  const upload = pageMarkdown("/upload", []);
  assert.equal(upload?.status, 200);
  assert.match(upload?.body ?? "", /list_bot/);
  assert.match(upload?.body ?? "", /\/api\/bots/);
});

test("auth.md documents anonymous agent access", () => {
  const body = authMarkdown();
  assert.match(body, /^# auth\.md/m);
  assert.match(body, /identity_types_supported: \["anonymous"\]/);
  assert.match(body, /register_uri:/);
  assert.match(body, /claim_uri:/);
  assert.match(body, /POST/);
  assert.match(body, /list_bot/);
  assert.doesNotMatch(body, /There is no credentialed agent write API/);
});

test("llms.txt is an LLM reading list", () => {
  const body = llmsTxt([bot()]);
  assert.match(body, /^# Grokdex/m);
  assert.match(body, /llms-full\.txt/);
  assert.match(body, /templates\/research\/index\.md/);
});

test("discovery documents include required fields", async () => {
  const catalog = apiCatalog();
  assert.ok(Array.isArray(catalog.linkset));
  assert.equal(catalog.linkset[0]?.anchor, "https://grokdex.net/api/bots");

  const mcp = mcpServerCard();
  assert.equal(mcp.serverInfo.name, "grokdex");
  assert.equal(mcp.transport.endpoint, "/mcp");
  assert.equal(mcp.authentication.required, false);
  assert.ok(mcp.tools.length >= 4);
  assert.ok(mcp.tools.some((tool) => tool.name === "list_bot"));

  const spec = openApiSpec();
  assert.ok(spec.paths["/api/bots"].post);

  const listSkill = SKILL_DOCS["list-a-grok-bot"].body;
  assert.match(listSkill, /POST/);
  assert.match(listSkill, /\/api\/bots/);
  assert.match(listSkill, /list_bot/);

  const a2a = a2aAgentCard();
  assert.equal(a2a.name, "Grokdex");
  assert.ok(a2a.skills[0]?.id);
  assert.ok(a2a.supportedInterfaces[0]?.url);

  const ard = ardCatalog();
  assert.equal(ard.specVersion, "1.0");
  assert.ok(ard.entries.every((entry) => "url" in entry && !("data" in entry)));

  const skills = await skillsIndex();
  assert.equal(skills.skills.length, 3);
  assert.match(skills.skills[0]?.digest ?? "", /^sha256:[0-9a-f]{64}$/);

  const links = agentLinkHeader("/");
  assert.match(links, /rel="api-catalog"/);
  assert.match(links, /rel="ai-catalog"/);
});

test("searchPublicBots filters without voter fields leaking", () => {
  const hits = searchPublicBots([bot(), bot({ slug: "loops", title: "Loops", category: "Coding", summary: "Outer loop" })], {
    q: "outer loop",
  });
  assert.equal(hits.length, 1);
  assert.equal(hits[0]?.slug, "loops");
  assert.equal("userVote" in publicBot(bot()), false);
});
