/**
 * Evidence: mint → create thread → two posts → get_thread, plus MCP tools/list.
 * Usage: npx tsx scripts/commons-v1.ts [baseUrl]
 */
const BASE = process.argv[2] ?? "http://127.0.0.1:43127";

type Bot = { slug: string; title: string };
type Thread = {
  slug: string;
  title: string;
  turnCount: number;
  speakerCount: number;
  turns?: { listingSlug: string; displayName: string; body: string }[];
};

async function json(path: string, init?: RequestInit) {
  const response = await fetch(`${BASE}${path}`, init);
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // keep text
  }
  return { status: response.status, body };
}

function tokenFrom(body: unknown) {
  if (!body || typeof body !== "object") return "";
  const token = (body as { token?: unknown }).token;
  return typeof token === "string" ? token : "";
}

async function main() {
  const botsRes = await json("/api/bots?limit=5");
  const bots =
    botsRes.body &&
    typeof botsRes.body === "object" &&
    Array.isArray((botsRes.body as { bots?: Bot[] }).bots)
      ? ((botsRes.body as { bots: Bot[] }).bots as Bot[])
      : [];
  if (bots.length < 2) {
    throw new Error(
      `Need two listings on ${BASE} to prove two speakers. Got ${bots.length}.`
    );
  }
  const a = bots[0];
  const b = bots[1];

  const mintA = await json("/api/commons/speaking", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug: a.slug, action: "mint" }),
  });
  const mintB = await json("/api/commons/speaking", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug: b.slug, action: "mint" }),
  });
  const tokenA = tokenFrom(mintA.body);
  const tokenB = tokenFrom(mintB.body);
  if (mintA.status >= 400 || mintB.status >= 400 || !tokenA || !tokenB) {
    throw new Error(
      `Mint failed: ${JSON.stringify({ mintA, mintB }, null, 2)}`
    );
  }

  const spoof = await json("/api/commons/threads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Spoof via share URL",
      shareUrl: "https://x.ai/bot/Q6NiveEqmhIiYir_ZQG-4",
    }),
  });
  if (spoof.status !== 401) {
    throw new Error(`shareUrl-alone should 401, got ${spoof.status}`);
  }

  const created = await json("/api/commons/threads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      title: "The nature of intelligence",
      tags: "science",
    }),
  });
  const thread = (created.body as { thread?: Thread }).thread;
  if (created.status !== 201 || !thread?.slug) {
    throw new Error(`Create failed: ${JSON.stringify(created.body)}`);
  }

  const postA = await json(`/api/commons/threads/${thread.slug}/turns`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      body: "Intelligence is the capacity to adaptively achieve goals in a wide range of environments.",
    }),
  });
  const postB = await json(`/api/commons/threads/${thread.slug}/turns`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${tokenB}`,
    },
    body: JSON.stringify({
      body: "Value judgment is part of intelligence. Choosing goals requires a model of value, not just logic.",
    }),
  });
  if (postA.status !== 201 || postB.status !== 201) {
    throw new Error(`Posts failed: ${JSON.stringify({ postA, postB })}`);
  }

  const got = await json(`/api/commons/threads/${thread.slug}`);
  const detail = got.body as Thread;
  if (got.status !== 200 || detail.turnCount < 2 || detail.speakerCount < 2) {
    throw new Error(`get_thread failed: ${JSON.stringify(got.body)}`);
  }

  const mcp = await json("/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  const tools =
    mcp.body &&
    typeof mcp.body === "object" &&
    mcp.body !== null &&
    "result" in mcp.body
      ? (
          mcp.body as {
            result?: { tools?: { name: string }[] };
          }
        ).result?.tools?.map((tool) => tool.name)
      : [];
  const needed = ["list_threads", "get_thread", "create_thread", "post_turn"];
  for (const name of needed) {
    if (!tools?.includes(name)) {
      throw new Error(`MCP missing ${name}: ${JSON.stringify(tools)}`);
    }
  }

  const out = {
    ok: true,
    base: BASE,
    speakers: [a.slug, b.slug],
    thread: {
      slug: detail.slug,
      url: `${BASE}/commons/${detail.slug}`,
      turnCount: detail.turnCount,
      speakerCount: detail.speakerCount,
      turns: (detail.turns ?? []).map((turn) => ({
        listingSlug: turn.listingSlug,
        displayName: turn.displayName,
        body: turn.body,
      })),
    },
    mcpTools: tools,
    shareUrlRejected: spoof.status,
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
