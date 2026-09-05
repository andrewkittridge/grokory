#!/usr/bin/env node
/**
 * Live SEO/AEO audit. Rerun against a host after a change.
 *
 *   node scripts/seo-aeo-audit.mjs
 *   node scripts/seo-aeo-audit.mjs http://127.0.0.1:43127
 */

const base = (process.argv[2] || "https://grokdex.net").replace(/\/$/, "");
const UA = "GrokdexSeoAeoAudit/1.0";

const HTML_PAGES = [
  "/",
  "/templates",
  "/catalog",
  "/upload",
  "/faq",
  "/authors",
  "/guides",
  "/guides/how-to-list",
  "/guides/what-is-grokdex",
  "/guides/how-to-add",
  "/privacy",
  "/terms",
  "/support",
];

const MARKDOWN = [
  { path: "/index.md", accept: "*/*" },
  { path: "/faq/index.md", accept: "*/*" },
  { path: "/faq", accept: "text/markdown" },
  { path: "/llms.txt", accept: "*/*" },
];

const JSON_SURFACES = [
  "/api/bots",
  "/.well-known/mcp/server-card.json",
  "/.well-known/ai-catalog.json",
  "/openapi.json",
  "/sitemap.xml",
  "/robots.txt",
];

function headingCount(html, tag) {
  const re = new RegExp(`<${tag}\\b`, "gi");
  return (html.match(re) || []).length;
}

function jsonLdTypes(html) {
  const types = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    try {
      const data = JSON.parse(match[1]);
      const blocks = Array.isArray(data) ? data : [data];
      for (const block of blocks) {
        if (block && typeof block === "object" && block["@type"]) {
          types.push(block["@type"]);
        }
      }
    } catch {
      types.push("INVALID_JSON");
    }
  }
  return types;
}

function meta(html, attr, key) {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(re);
  return match ? match[1] : "";
}

async function fetchUrl(path, accept) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const started = Date.now();
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: accept || "*/*" },
    redirect: "follow",
  });
  const body = await res.text();
  return {
    url,
    status: res.status,
    contentType: res.headers.get("content-type") || "",
    bytes: Buffer.byteLength(body),
    ms: Date.now() - started,
    body,
  };
}

const issues = [];
function fail(message) {
  issues.push(message);
}

async function main() {
  console.log(`SEO/AEO audit ${base}`);

  for (const path of HTML_PAGES) {
    const page = await fetchUrl(path);
    const h1 = headingCount(page.body, "h1");
    const types = jsonLdTypes(page.body);
    const title = (page.body.match(/<title>([^<]*)<\/title>/i) || [, ""])[1];
    const ogUrl = meta(page.body, "property", "og:url");
    console.log(
      [
        page.status,
        `${page.bytes}B`,
        `h1=${h1}`,
        title,
        types.join(",") || "-",
      ].join("\t"),
      path
    );
    if (page.status >= 500) fail(`${path} returned ${page.status}`);
    if (page.status === 200 && !page.contentType.includes("text/html")) {
      fail(`${path} content-type ${page.contentType}`);
    }
    if (page.status === 200 && h1 !== 1) {
      fail(`${path} h1 count ${h1}, want 1`);
    }
    if (page.status === 200 && page.bytes > 400_000) {
      fail(`${path} HTML ${page.bytes} bytes, want under 400k`);
    }
    if (page.status === 200 && path !== "/" && ogUrl && !ogUrl.includes(path)) {
      fail(`${path} og:url ${ogUrl} does not name the page`);
    }
  }

  for (const item of MARKDOWN) {
    const page = await fetchUrl(item.path, item.accept);
    console.log(
      [page.status, page.contentType, `${page.bytes}B`].join("\t"),
      item.path,
      item.accept
    );
    if (page.status >= 500) fail(`${item.path} returned ${page.status}`);
    if (page.status === 200 && !page.contentType.includes("markdown") && !page.contentType.includes("text/plain")) {
      fail(`${item.path} Accept ${item.accept} got ${page.contentType}`);
    }
  }

  for (const path of JSON_SURFACES) {
    const page = await fetchUrl(path);
    console.log([page.status, page.contentType, `${page.bytes}B`].join("\t"), path);
    if (page.status >= 500) fail(`${path} returned ${page.status}`);
  }

  const api = await fetchUrl("/api/bots");
  if (api.status === 200) {
    const data = JSON.parse(api.body);
    const n = Array.isArray(data.bots) ? data.bots.length : 0;
    const total = Number(data.total ?? data.count);
    console.log(`api bots=${n} count=${data.count} total=${data.total} limit=${data.limit}`);
    if (!Number.isFinite(total) || total < n) {
      fail(`GET /api/bots total ${data.total} count ${data.count} bots ${n}`);
    }
    const slug = data.bots?.[0]?.slug;
    if (slug) {
      const listing = await fetchUrl(`/templates/${slug}`);
      const h1 = headingCount(listing.body, "h1");
      console.log(
        [listing.status, `${listing.bytes}B`, `h1=${h1}`].join("\t"),
        `/templates/${slug}`
      );
      if (listing.status >= 500) fail(`/templates/${slug} returned ${listing.status}`);
      if (listing.status === 200 && h1 !== 1) {
        fail(`/templates/${slug} h1 count ${h1}, want 1`);
      }
    }
  }

  if (issues.length) {
    console.error(`\nFAIL ${issues.length}`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }
  console.log("\nPASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
