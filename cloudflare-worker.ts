// @ts-nocheck
// OpenNext generates `.open-next/worker.js` at build time.
import { default as handler } from "./.open-next/worker.js";
import { HOME_HTML_CACHE_URL } from "./src/lib/edge-cache";

function prefersMarkdown(accept) {
  if (!accept) return false;
  const markdown = accept.indexOf("text/markdown");
  if (markdown === -1) return false;
  const html = accept.indexOf("text/html");
  if (html === -1) return true;
  return markdown < html;
}

async function fetchHome(request, env, ctx) {
  const url = new URL(request.url);
  if (
    (request.method !== "GET" && request.method !== "HEAD") ||
    url.pathname !== "/" ||
    prefersMarkdown(request.headers.get("accept"))
  ) {
    return handler.fetch(request, env, ctx);
  }

  const cache = caches.default;
  const cacheKey = new Request(HOME_HTML_CACHE_URL, { method: "GET" });
  const hit = await cache.match(cacheKey);
  if (hit) {
    const headers = new Headers(hit.headers);
    headers.set("x-grokdex-cache", "hit");
    return new Response(hit.body, { status: hit.status, headers });
  }

  const response = await handler.fetch(request, env, ctx);
  const type = response.headers.get("content-type") || "";
  if (!response.ok || !type.includes("text/html")) return response;

  const headers = new Headers(response.headers);
  headers.delete("set-cookie");
  headers.set(
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=120"
  );
  headers.set("x-grokdex-cache", "miss");
  const cached = new Response(response.body, {
    status: response.status,
    headers,
  });
  ctx.waitUntil(cache.put(cacheKey, cached.clone()));
  return cached;
}

export default {
  async fetch(request, env, ctx) {
    return fetchHome(request, env, ctx);
  },

  async scheduled(_controller, env, ctx) {
    const secret = env.CRON_SECRET;
    if (!secret) return;
    ctx.waitUntil(
      env.WORKER_SELF_REFERENCE.fetch(
        "https://grokdex.net/api/cron/check-links",
        {
          headers: { authorization: `Bearer ${secret}` },
        }
      ).then(async (response) => {
        if (!response.ok) {
          console.error(
            "check-links",
            response.status,
            await response.text()
          );
        }
      })
    );
  },
};
