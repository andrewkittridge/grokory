import { authorSlug, grokbotTemplateUrl } from "./bot-url";
import { isFeaturedActive } from "./featured";
import { filterTemplates } from "./templates";
import { parseSort, sortTemplates } from "./rank";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absUrl } from "./site";
import { CATEGORIES, type ListedTemplate } from "./types";

export const AGENT_VERSION = "0.2.0";
export const CONTENT_SIGNAL =
  "search=yes, ai-input=yes, ai-train=yes, use=full";
export const AI_CATALOG_PATH = "/.well-known/ai-catalog.json";
export const API_CATALOG_PATH = "/.well-known/api-catalog";
export const MCP_PATH = "/mcp";

const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "Googlebot",
  "PerplexityBot",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "meta-externalagent",
  "FacebookBot",
  "Diffbot",
] as const;

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Grokdex?",
    a: "Grokdex is a public board of Grok Bot templates at grokdex.net. Anyone can list a public x.ai/bot share link, upvote useful ones, and add a copy onto their own Grok account. Grokdex is independent and is not affiliated with xAI or SpaceXAI.",
  },
  {
    q: "What is a Grok Bot?",
    a: "A Grok Bot is a custom agent on x.ai. A public share URL looks like https://x.ai/bot/…. Adding that link on x.ai copies the template — identity, description, skills, and routines — onto your Grok account. It does not share the author’s computer, logins, or chats.",
  },
  {
    q: "How do I add a Grok Bot from Grokdex to my Grok account?",
    a: "Open a listing on grokdex.net, preview the share link on x.ai, then click Add. Add opens the Grok Bot app so it can copy the template onto your account. If you don’t have the app, use Preview on x.ai. Adds count clicks, not confirmed installs.",
  },
  {
    q: "How do I list a Grok Bot on Grokdex?",
    a: "Go to https://grokdex.net/upload and paste a public https://x.ai/bot/… share link, or paste the list-on-grokdex skill into your Grok Bot and tell it to list you. Listing is free and does not require an account. Duplicate share URLs are not listed twice.",
  },
  {
    q: "Can my Grok Bot list itself?",
    a: "Yes. Copy the skill on https://grokdex.net/upload — or add https://grokdex.net/mcp as a custom connector — paste it into your Grok Bot, and say list me on Grokdex. The bot posts the public share URL. No Grokdex account.",
  },
  {
    q: "Is listing on Grokdex free?",
    a: "Yes. Browsing, voting, and listing a public share link are free. Optional paid placement (Featured) and category boosts exist; they are labeled and are not an xAI or Grokdex endorsement. Tips are optional and do not change rank.",
  },
  {
    q: "Where can agents read Grokdex without HTML?",
    a: "Send Accept: text/markdown, or fetch /index.md on any page. Start with https://grokdex.net/llms.txt and https://grokdex.net/llms-full.txt. The public catalog is GET /api/bots. MCP is at https://grokdex.net/mcp. Agents can list a live share URL with POST /api/bots or MCP list_bot.",
  },
];

export type PublicBot = {
  slug: string;
  title: string;
  authorName: string;
  summary: string;
  description: string;
  category: string;
  tags: string[];
  skills: string[];
  routines: string[];
  botUrl: string;
  listingUrl: string;
  score: number;
  adds: number;
  live: boolean;
  featured: boolean;
  createdAt: string;
};

export function publicBot(template: ListedTemplate): PublicBot {
  return {
    slug: template.slug,
    title: template.title,
    authorName: template.authorName,
    summary: template.summary,
    description: template.description,
    category: template.category,
    tags: template.tags,
    skills: template.skills,
    routines: template.routines,
    botUrl: template.botUrl,
    listingUrl: absUrl(`/templates/${template.slug}`),
    score: template.score,
    adds: template.adds,
    live: template.live,
    featured: isFeaturedActive(template),
    createdAt: template.createdAt,
  };
}

export function searchPublicBots(
  templates: ListedTemplate[],
  filters: { q?: string; category?: string; tag?: string; sort?: string }
) {
  const filtered = filterTemplates(templates, {
    q: filters.q,
    category: filters.category,
    tag: filters.tag,
  });
  return sortTemplates(filtered, parseSort(filters.sort)).map(publicBot);
}

export function robotsTxt() {
  const aiBlocks = AI_USER_AGENTS.map(
    (agent) => `User-agent: ${agent}\nAllow: /`
  ).join("\n\n");
  return `# Grokdex welcomes search crawlers and answer engines.
# Content Signals: https://contentsignals.org/

User-agent: *
Content-Signal: ${CONTENT_SIGNAL}
Allow: /
Agentmap: ${absUrl(AI_CATALOG_PATH)}

${aiBlocks}

Host: ${SITE_URL}
Sitemap: ${absUrl("/sitemap.xml")}
`;
}

export function agentLinkHeader(pathname = "/") {
  const markdownPath =
    pathname === "/" ? "/index.md" : `${pathname.replace(/\/$/, "")}/index.md`;
  return [
    `<${API_CATALOG_PATH}>; rel="api-catalog"`,
    `<${absUrl("/openapi.json")}>; rel="service-desc"; type="application/json"`,
    `<${absUrl("/llms.txt")}>; rel="describedby"; type="text/plain"`,
    `<${absUrl("/faq")}>; rel="service-doc"; type="text/html"`,
    `<${absUrl(AI_CATALOG_PATH)}>; rel="ai-catalog"; type="application/json"`,
    `<${absUrl("/.well-known/mcp/server-card.json")}>; rel="alternate"; type="application/json"`,
    `<${absUrl("/.well-known/agent-card.json")}>; rel="alternate"; type="application/json"`,
    `<${markdownPath}>; rel="alternate"; type="text/markdown"`,
  ].join(", ");
}

export function prefersMarkdown(accept: string | null) {
  if (!accept) return false;
  const parts = accept.split(",").map((part) => {
    const [rawType, ...params] = part.trim().split(";");
    let q = 1;
    for (const param of params) {
      const [key, value] = param.trim().split("=");
      if (key === "q") q = Number(value) || 0;
    }
    return { type: rawType.trim().toLowerCase(), q };
  });
  const markdownQ = maxQ(parts, ["text/markdown", "text/x-markdown"]);
  if (markdownQ < 0) return false;
  const htmlQ = maxQ(parts, ["text/html"]);
  if (htmlQ < 0) return true;
  return markdownQ >= htmlQ;
}

function maxQ(
  parts: { type: string; q: number }[],
  types: string[]
) {
  const matched = parts.filter((part) => types.includes(part.type));
  if (matched.length === 0) return -1;
  return Math.max(...matched.map((part) => part.q));
}

export function markdownSourcePath(pathname: string) {
  if (pathname === "/index.md") return "/";
  if (pathname.endsWith("/index.md")) {
    return pathname.slice(0, -"/index.md".length) || "/";
  }
  if (pathname.endsWith(".md")) return pathname.slice(0, -3) || "/";
  return null;
}

const SKIP_MARKDOWN =
  /^\/(?:api\/|_next\/|mcp(?:\/|$)|\.well-known\/|robots\.txt|sitemap\.xml|feed\.xml|llms(?:-full)?\.txt|openapi\.json|auth\.md|agent\/markdown)/;

export function shouldServeMarkdown(pathname: string, accept: string | null) {
  if (SKIP_MARKDOWN.test(pathname)) return false;
  if (markdownSourcePath(pathname)) return true;
  if (/\.[a-z0-9]+$/i.test(pathname)) return false;
  return prefersMarkdown(accept);
}

export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function pageMarkdown(
  pathname: string,
  templates: ListedTemplate[]
): { status: number; body: string } | null {
  const path = pathname === "" ? "/" : pathname;
  if (path === "/") return { status: 200, body: homeMarkdown(templates) };
  if (path === "/templates") {
    return { status: 200, body: boardMarkdown(templates) };
  }
  if (path === "/upload") return { status: 200, body: uploadMarkdown() };
  if (path === "/support") return { status: 200, body: supportMarkdown() };
  if (path === "/faq") return { status: 200, body: faqMarkdown() };
  if (path === "/privacy") return { status: 200, body: privacyMarkdown() };
  if (path === "/terms") return { status: 200, body: termsMarkdown() };
  const listing = path.match(/^\/templates\/([^/]+)$/);
  if (listing) {
    const template = templates.find((item) => item.slug === listing[1]);
    if (!template) return { status: 404, body: "# Not found\n" };
    return { status: 200, body: listingMarkdown(template) };
  }
  const author = path.match(/^\/authors\/([^/]+)$/);
  if (author) {
    const listed = templates.filter(
      (item) => authorSlug(item.authorName) === author[1]
    );
    if (listed.length === 0) return { status: 404, body: "# Not found\n" };
    return { status: 200, body: authorMarkdown(listed) };
  }
  return null;
}

function homeMarkdown(templates: ListedTemplate[]) {
  const ranked = sortTemplates(templates, "hot").slice(0, 12);
  const jobs = CATEGORIES.join(", ");
  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Grokdex is a ranked public board of [Grok Bot](https://x.ai/bot) share links. List a public \`https://x.ai/bot/…\` URL and it shows up immediately. Add copies the template onto your Grok account — identity, description, skills, and routines. It does not share the author’s computer, logins, or chats.

Grokdex is independent. It is not affiliated with, endorsed by, or operated by xAI or SpaceXAI.

## For agents

- Prefer Markdown: send \`Accept: text/markdown\` or fetch this page at [index.md](${absUrl("/index.md")}).
- Site map for models: [llms.txt](${absUrl("/llms.txt")}), full text [llms-full.txt](${absUrl("/llms-full.txt")}).
- Public JSON: [GET /api/bots](${absUrl("/api/bots")}). List a live share URL with POST.
- MCP: [server card](${absUrl("/.well-known/mcp/server-card.json")}) · endpoint [ /mcp ](${absUrl(MCP_PATH)}). Tool \`list_bot\` publishes a listing.

## How to use it

1. [Browse the board](${absUrl("/templates/index.md")}).
2. Open a listing, preview on x.ai, then Add.
3. [Share a bot](${absUrl("/upload/index.md")}) — free, no account.

Jobs on the board: ${jobs}.

## Ranked listings

${botList(ranked)}

## FAQ

${FAQS.map((item) => `### ${item.q}\n\n${item.a}`).join("\n\n")}
`;
}

function boardMarkdown(templates: ListedTemplate[]) {
  const ranked = sortTemplates(templates, "hot");
  return `# The board · ${SITE_NAME}

A public board of Grok Bot share links. Upvote the useful ones, then add a copy on x.ai.

Browse HTML: ${absUrl("/templates")}
JSON: ${absUrl("/api/bots")}

## Listings

${botList(ranked)}
`;
}

function listingMarkdown(template: ListedTemplate) {
  const bot = publicBot(template);
  const missingLists =
    "_Not listed on the public x.ai share page. Preview there before you add._";
  const skills =
    bot.skills.length > 0
      ? bot.skills.map((item) => `- ${item}`).join("\n")
      : missingLists;
  const routines =
    bot.routines.length > 0
      ? bot.routines.map((item) => `- ${item}`).join("\n")
      : missingLists;
  return `# ${bot.title}

> ${bot.summary}

- Author: ${bot.authorName}
- Job: ${bot.category}
- Share link: ${bot.botUrl}
- Grokdex listing: ${bot.listingUrl}
- Votes: ${bot.score} · Adds: ${bot.adds} · ${bot.live ? "Live share link" : "Share link is down"}
${bot.featured ? "- Featured placement on Grokdex (paid, labeled, not an endorsement)\n" : ""}
${bot.description}

## What gets copied

A template copies identity, description, skills, and routines onto your Grok account. It does not share the author’s computer, logins, or chats.

### Skills

${skills}

### Routines

${routines}

## Add this bot

1. Preview the share link on x.ai: ${bot.botUrl}
2. Add in the Grok Bot app: ${grokbotTemplateUrl(template.botId)}
3. Or open the listing and use Add: ${bot.listingUrl}

Third-party template. Bots on your account share one computer. Connect the smallest tools, and keep sends, purchases, and deletes behind your approval.

Tags: ${bot.tags.length ? bot.tags.join(", ") : "none"}
`;
}

function authorMarkdown(listed: ListedTemplate[]) {
  const name = listed[0].authorName;
  return `# ${name} · Grokdex

Public Grok Bot templates by ${name}.

${botList(sortTemplates(listed, "hot"))}
`;
}

function uploadMarkdown() {
  return `# Share a Grok Bot · ${SITE_NAME}

Paste a public share link — \`https://x.ai/bot/…\`. Pick a job, and it lists immediately. Listing is free. No account.

HTML form: ${absUrl("/upload")}

Or paste the [list-on-grokdex skill](${absUrl("/.well-known/agent-skills/list-a-grok-bot/SKILL.md")}) into your Grok Bot and tell it to list you. Agents POST ${absUrl("/api/bots")} or call MCP \`list_bot\` on ${absUrl(MCP_PATH)}.

Only paste a share link you are allowed to make public. Duplicate share URLs are not listed twice.
`;
}

function supportMarkdown() {
  return `# Support Grokdex

Grokdex is free to browse and list. A tip is optional. It is not tax-deductible, and it does not feature a bot or change rank.

HTML: ${absUrl("/support")}
`;
}

function faqMarkdown() {
  return `# FAQ · ${SITE_NAME}

${FAQS.map((item) => `## ${item.q}\n\n${item.a}`).join("\n\n")}
`;
}

function privacyMarkdown() {
  return `# Privacy · ${SITE_NAME}

Grokdex stores a voter cookie for one vote per listing per browser, the public listing text you publish, add counts, and payment records if you tip or buy placement. Full policy: ${absUrl("/privacy")}
`;
}

function termsMarkdown() {
  return `# Terms · ${SITE_NAME}

Grokdex is an independent catalog of public Grok Bot share links. It is not affiliated with xAI or SpaceXAI. Full terms: ${absUrl("/terms")}
`;
}

function botList(templates: ListedTemplate[]) {
  if (templates.length === 0) return "_No listings yet._";
  return templates
    .map((template) => {
      const url = absUrl(`/templates/${template.slug}/index.md`);
      return `- [${template.title}](${url}) — ${template.summary}`;
    })
    .join("\n");
}

export function llmsTxt(templates: ListedTemplate[]) {
  const ranked = sortTemplates(templates, "hot").slice(0, 40);
  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Grokdex indexes public Grok Bot share links (\`https://x.ai/bot/…\`). Rankings come from browser votes. Add copies a template onto your Grok account. Grokdex is not affiliated with xAI.

## Start here

- [Overview](${absUrl("/index.md")}): What Grokdex is, how Add works, FAQ
- [The board](${absUrl("/templates/index.md")}): Ranked public Grok Bots
- [Share a bot](${absUrl("/upload/index.md")}): List a public share URL
- [FAQ](${absUrl("/faq/index.md")}): Citable answers for assistants
- [Full text](${absUrl("/llms-full.txt")}): Expanded board dump

## For agents

- Markdown negotiation: \`Accept: text/markdown\` or append \`/index.md\`
- JSON catalog: ${absUrl("/api/bots")} (GET read, POST list a live share URL)
- OpenAPI: ${absUrl("/openapi.json")}
- MCP: ${absUrl("/.well-known/mcp/server-card.json")} · ${absUrl(MCP_PATH)} (\`list_bot\` to publish)
- Skills: ${absUrl("/.well-known/agent-skills/index.json")}

## Public Grok Bots

${botList(ranked)}
`;
}

export function llmsFullTxt(templates: ListedTemplate[]) {
  const ranked = sortTemplates(templates, "hot");
  const listings = ranked
    .map((template) => listingMarkdown(template))
    .join("\n\n---\n\n");
  return `${homeMarkdown(templates)}

---

# All listings

${listings || "_No listings yet._"}
`;
}

export function authMarkdown() {
  return `# auth.md

Grokdex is a public catalog. Agents do not register an account and do not need credentials to read the board or list a live share URL.

## Audience

AI agents and crawlers reading, querying, or listing public Grok Bot share links.

## Access

- Browse, search, and fetch listings: no authentication
- MCP tools at ${absUrl(MCP_PATH)}: no authentication
- JSON at ${absUrl("/api/bots")}: no authentication
- List a bot with POST ${absUrl("/api/bots")} or MCP \`list_bot\`: no authentication. Proof is a live public \`https://x.ai/bot/…\` URL that Grokdex can fetch. Duplicate share URLs are rejected.
- Listing via the HTML form uses Cloudflare Turnstile (human check).

## Agent registration

Public read and listing access is anonymous. There is nothing to provision.

\`\`\`yaml
agent_auth:
  skill: find-grok-bot
  register_uri: ${absUrl("/auth.md")}
  identity_types_supported: ["anonymous"]
  anonymous:
    credential_types_supported: ["none"]
    claim_uri: ${absUrl("/auth.md")}
\`\`\`

## Credentials

Do not send API keys or OAuth tokens. Protected writes (checkout, webhooks, cron) are not part of the public agent surface.
`;
}

export function apiCatalog() {
  const bots = absUrl("/api/bots");
  const mcp = absUrl(MCP_PATH);
  return {
    linkset: [
      {
        anchor: bots,
        "service-desc": [
          {
            href: absUrl("/openapi.json"),
            type: "application/json",
          },
        ],
        "service-doc": [
          {
            href: absUrl("/faq"),
            type: "text/html",
          },
          {
            href: absUrl("/llms.txt"),
            type: "text/plain",
          },
        ],
        status: [
          {
            href: absUrl("/api/status"),
            type: "application/json",
          },
        ],
      },
      {
        anchor: mcp,
        "service-desc": [
          {
            href: absUrl("/.well-known/mcp/server-card.json"),
            type: "application/json",
          },
        ],
        "service-doc": [
          {
            href: absUrl("/.well-known/agent-skills/index.json"),
            type: "application/json",
          },
        ],
      },
    ],
  };
}

export function openApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: `${SITE_NAME} public API`,
      version: AGENT_VERSION,
      description:
        "Read the public Grok Bot board and list a live https://x.ai/bot/… share URL. No authentication.",
    },
    servers: [{ url: SITE_URL }],
    paths: {
      "/api/bots": {
        get: {
          summary: "List public Grok Bots",
          parameters: [
            {
              name: "q",
              in: "query",
              schema: { type: "string" },
              description: "Search title, summary, author, tags, skills",
            },
            {
              name: "category",
              in: "query",
              schema: { type: "string", enum: [...CATEGORIES] },
            },
            {
              name: "sort",
              in: "query",
              schema: { type: "string", enum: ["hot", "top", "new"] },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 100 },
            },
          ],
          responses: {
            "200": { description: "Array of public listings" },
          },
        },
        post: {
          summary: "List a public Grok Bot",
          description:
            "Publish a live https://x.ai/bot/… share URL. Title, author, and description come from the x.ai preview. Duplicate share URLs return 409 with listingUrl.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["shareUrl", "category"],
                  properties: {
                    shareUrl: {
                      type: "string",
                      description: "Public https://x.ai/bot/… share URL",
                    },
                    category: {
                      type: "string",
                      enum: [...CATEGORIES],
                    },
                    tags: {
                      type: "string",
                      description: "Optional comma-separated tags",
                    },
                    note: { type: "string" },
                    submittedBy: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Listed" },
            "400": { description: "Invalid share URL, category, or preview" },
            "409": { description: "Already listed" },
            "429": { description: "Rate limited" },
          },
        },
      },
      "/api/bots/{slug}": {
        get: {
          summary: "Get one listing",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Listing" },
            "404": { description: "Not found" },
          },
        },
      },
      "/api/status": {
        get: {
          summary: "Liveness",
          responses: { "200": { description: "ok" } },
        },
      },
    },
  };
}

export const MCP_TOOLS = [
  {
    name: "search_bots",
    title: "Search Grok Bots",
    description:
      "Search public Grok Bot listings on Grokdex by query, job category, or sort.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search" },
        category: {
          type: "string",
          description: `One of: ${CATEGORIES.join(", ")}`,
        },
        sort: { type: "string", enum: ["hot", "top", "new"] },
        limit: { type: "integer", minimum: 1, maximum: 50 },
      },
    },
  },
  {
    name: "get_bot",
    title: "Get a Grok Bot listing",
    description: "Fetch one Grokdex listing by slug.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
      },
      required: ["slug"],
    },
  },
  {
    name: "list_categories",
    title: "List job categories",
    description: "Job categories used on the Grokdex board.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_bot",
    title: "List a Grok Bot on Grokdex",
    description:
      "Publish a live public https://x.ai/bot/… share URL to the Grokdex board. Title and description come from x.ai. Duplicate share URLs return the existing listingUrl.",
    inputSchema: {
      type: "object",
      properties: {
        shareUrl: {
          type: "string",
          description: "Public https://x.ai/bot/… share URL",
        },
        category: {
          type: "string",
          description: `One of: ${CATEGORIES.join(", ")}`,
        },
        tags: {
          type: "string",
          description: "Optional comma-separated tags",
        },
        note: { type: "string" },
        submittedBy: { type: "string" },
      },
      required: ["shareUrl", "category"],
    },
  },
] as const;

export function mcpServerCard() {
  return {
    $schema:
      "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    version: "1.0",
    protocolVersion: "2025-06-18",
    serverInfo: {
      name: "grokdex",
      title: SITE_NAME,
      version: AGENT_VERSION,
    },
    description:
      "Search, read, and list public Grok Bot share links on Grokdex. No authentication.",
    transport: {
      type: "streamable-http",
      endpoint: MCP_PATH,
    },
    authentication: { required: false },
    tools: MCP_TOOLS,
  };
}

export function mcpDiscovery() {
  return {
    serverInfo: {
      name: SITE_NAME,
      version: AGENT_VERSION,
    },
    description:
      "Search, read, and list public Grok Bot share links on Grokdex. No authentication.",
    url: absUrl(MCP_PATH),
    transport: { type: "streamable-http" },
    capabilities: { tools: true },
  };
}

export function a2aAgentCard() {
  return {
    protocolVersion: "0.3.0",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absUrl(MCP_PATH),
    version: AGENT_VERSION,
    provider: {
      organization: SITE_NAME,
      url: SITE_URL,
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["application/json", "text/plain"],
    skills: [
      {
        id: "search-bots",
        name: "Search Grok Bots",
        description: "Find public Grok Bot templates by query or job.",
        tags: ["grok", "bots", "catalog"],
        examples: [
          "Find a research Grok Bot",
          "Show coding bots on Grokdex",
        ],
      },
      {
        id: "get-bot",
        name: "Get a listing",
        description: "Read one Grokdex listing by slug.",
        tags: ["grok", "bots"],
        examples: ["Get the Grokdex listing for a slug"],
      },
      {
        id: "list-bot",
        name: "List a Grok Bot",
        description:
          "Publish a live public https://x.ai/bot/… share URL to Grokdex.",
        tags: ["grok", "bots", "publish"],
        examples: [
          "List my Grok Bot on Grokdex",
          "Publish this share link to the board",
        ],
      },
    ],
    supportedInterfaces: [
      {
        url: absUrl(MCP_PATH),
        protocolBinding: "JSONRPC",
        transport: "HTTP",
      },
    ],
  };
}

export function ardCatalog() {
  return {
    specVersion: "1.0",
    host: {
      displayName: SITE_NAME,
      identifier: `did:web:${new URL(SITE_URL).hostname}`,
    },
    entries: [
      {
        identifier: "urn:air:grokdex.net:server:mcp",
        displayName: "Grokdex MCP",
        type: "application/mcp-server-card+json",
        url: absUrl("/.well-known/mcp/server-card.json"),
        representativeQueries: [
          "find a public Grok Bot for research",
          "search Grokdex for coding bots",
          "list Grok Bot templates I can add",
          "list my Grok Bot on Grokdex",
        ],
      },
      {
        identifier: "urn:air:grokdex.net:api:bots",
        displayName: "Grokdex public bots API",
        type: "application/json",
        url: absUrl("/api/bots"),
        representativeQueries: [
          "public Grok Bot catalog JSON",
          "Grokdex listings API",
        ],
      },
      {
        identifier: "urn:air:grokdex.net:agent:a2a",
        displayName: "Grokdex agent card",
        type: "application/json",
        url: absUrl("/.well-known/agent-card.json"),
        representativeQueries: [
          "Grokdex agent card",
          "add a Grok Bot from a public board",
        ],
      },
    ],
  };
}

export const SKILL_DOCS: Record<
  string,
  { description: string; body: string }
> = {
  "find-grok-bot": {
    description:
      "Search Grokdex for a public Grok Bot template by job or keyword.",
    body: `# Find a Grok Bot

Use when a user wants a public Grok Bot template to copy onto their Grok account.

## Steps

1. Call MCP \`search_bots\` on ${absUrl(MCP_PATH)} with \`query\` and optional \`category\` (${CATEGORIES.join(", ")}).
2. Or GET ${absUrl("/api/bots")}?q=…&category=…
3. Open the listing URL and the \`botUrl\` (\`https://x.ai/bot/…\`). Add copies the template onto the user's Grok account.

Do not claim Grokdex is an xAI product.
`,
  },
  "list-a-grok-bot": {
    description: "List a public x.ai/bot share link on Grokdex.",
    body: `---
name: list-on-grokdex
description: List this Grok Bot on Grokdex when asked.
---

# List a Grok Bot

Use when the user wants this bot (or another public Grok Bot they authored) listed on Grokdex. Triggers: "list me on Grokdex", "publish me", "share me on Grokdex".

## Do this

1. Get the public share URL (\`https://x.ai/bot/…\`). If you do not have it, ask the user to copy it from the bot share dialog. Never invent a share URL.
2. Pick a job category: ${CATEGORIES.join(", ")}. Ask if unclear.
3. Prefer MCP: call \`list_bot\` on ${absUrl(MCP_PATH)} with \`shareUrl\` and \`category\`.
4. Otherwise POST JSON to ${absUrl("/api/bots")}

\`\`\`http
POST ${absUrl("/api/bots")}
Content-Type: application/json

{"shareUrl":"https://x.ai/bot/…","category":"Work"}
\`\`\`

5. Reply with the \`listingUrl\` from the response. If the bot is already listed (HTTP 409), give them that \`listingUrl\`.

Do not send the user to the HTML form. Listing is free and needs no Grokdex account.
`,
  },
  "add-a-grok-bot": {
    description:
      "Add a Grokdex listing onto a user's Grok account via the x.ai share link.",
    body: `# Add a Grok Bot

Use when a user wants to copy a listed template onto their Grok account.

## Steps

1. Resolve the listing with MCP \`get_bot\` or GET ${absUrl("/api/bots/{slug}")}.
2. Give them the \`botUrl\` to preview on x.ai.
3. Add opens the Grok Bot app (\`grokbot://app/v1/bot-template?id=…\`). That copies identity, description, skills, and routines. It does not share the author’s computer, logins, or chats.
4. Third-party template. Bots on an account share one computer — connect the smallest tools, and keep sends, purchases, and deletes behind approval.

If \`live\` is false, the share link is down — do not send them to Add.
`,
  },
};

export async function sha256Hex(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function skillsIndex() {
  const skills = [];
  for (const [name, skill] of Object.entries(SKILL_DOCS)) {
    const digest = await sha256Hex(skill.body);
    skills.push({
      name,
      type: "skill-md" as const,
      description: skill.description,
      url: `/.well-known/agent-skills/${name}/SKILL.md`,
      digest: `sha256:${digest}`,
    });
  }
  return {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills,
  };
}
