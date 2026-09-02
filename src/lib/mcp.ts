import {
  AGENT_VERSION,
  MCP_TOOLS,
  publicBot,
  searchPublicBots,
} from "./agent";
import { jsonResponse, jsonWrite } from "./agent-http";
import { listBotFromAgent } from "./listing";
import { SITE_NAME } from "./site";
import { listTemplates } from "./templates-store";
import { CATEGORIES } from "./types";

type JsonRpcId = string | number | null;
type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

export async function handleMcp(request: Request) {
  if (request.method === "GET") {
    return jsonResponse({
      protocolVersion: "2025-06-18",
      serverInfo: { name: "grokdex", title: SITE_NAME, version: AGENT_VERSION },
      transport: { type: "streamable-http", endpoint: "/mcp" },
    });
  }
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonRpcError(null, -32700, "Parse error");
  }

  if (Array.isArray(payload)) {
    const replies = [];
    for (const item of payload) {
      const reply = await dispatch(item as JsonRpcRequest, request);
      if (reply) replies.push(reply);
    }
    return jsonWrite(replies);
  }

  const reply = await dispatch(payload as JsonRpcRequest, request);
  if (!reply) return new Response(null, { status: 202 });
  return jsonWrite(reply);
}

async function dispatch(message: JsonRpcRequest, request: Request) {
  const id = message.id ?? null;
  const method = message.method ?? "";
  if (id === null && method.startsWith("notifications/")) return null;

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2025-06-18",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "grokdex", version: AGENT_VERSION },
        instructions:
          "Grokdex is a public board of Grok Bot share links. Use search_bots, get_bot, list_bot, and refresh_bot. list_bot publishes or updates a live https://x.ai/bot/… share URL. refresh_bot re-fetches identity from x.ai. No auth.",
      });
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: MCP_TOOLS });
    case "tools/call":
      return ok(id, await callTool(message.params ?? {}, request));
    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Unknown method: ${method}` },
      };
  }
}

async function callTool(
  params: Record<string, unknown>,
  request: Request
) {
  const name = String(params.name ?? "");
  const args = (params.arguments ?? {}) as Record<string, unknown>;

  if (name === "list_bot") {
    const tags = args.tags;
    const listed = await listBotFromAgent(
      {
        shareUrl: str(args.shareUrl),
        category: str(args.category),
        tags: Array.isArray(tags)
          ? tags.map((tag) => String(tag))
          : str(tags),
        note: str(args.note),
        submittedBy: str(args.submittedBy),
        xHandle: str(args.xHandle),
      },
      request
    );
    return {
      content: [{ type: "text", text: JSON.stringify(listed.body) }],
      isError: listed.status >= 400 && listed.status !== 409,
    };
  }

  if (name === "refresh_bot") {
    let shareUrl = str(args.shareUrl);
    if (!shareUrl) {
      const slug = str(args.slug);
      if (!slug) {
        return {
          content: [
            {
              type: "text",
              text: "Pass slug or shareUrl to refresh a listing.",
            },
          ],
          isError: true,
        };
      }
      const templates = await listTemplates();
      const template = templates.find((item) => item.slug === slug);
      if (!template) {
        return {
          content: [{ type: "text", text: `No listing for slug "${slug}".` }],
          isError: true,
        };
      }
      shareUrl = template.botUrl;
    }
    const listed = await listBotFromAgent(
      { shareUrl, intent: "refresh" },
      request
    );
    return {
      content: [{ type: "text", text: JSON.stringify(listed.body) }],
      isError: listed.status >= 400 && listed.status !== 409,
    };
  }

  const templates = await listTemplates();

  if (name === "list_categories") {
    return textResult(JSON.stringify(CATEGORIES));
  }
  if (name === "search_bots") {
    const limit = clamp(Number(args.limit) || 10, 1, 50);
    const hits = searchPublicBots(templates, {
      q: str(args.query),
      category: str(args.category),
      skill: str(args.skill),
      sort: str(args.sort),
    }).slice(0, limit);
    return textResult(JSON.stringify({ bots: hits, count: hits.length }));
  }
  if (name === "get_bot") {
    const slug = str(args.slug);
    const template = templates.find((item) => item.slug === slug);
    if (!template) {
      return {
        content: [{ type: "text", text: `No listing for slug "${slug}".` }],
        isError: true,
      };
    }
    return textResult(JSON.stringify(publicBot(template)));
  }
  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
}

function textResult(text: string) {
  return { content: [{ type: "text", text }] };
}

function ok(id: JsonRpcId, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: JsonRpcId, code: number, message: string) {
  return jsonWrite({ jsonrpc: "2.0", id, error: { code, message } });
}

function str(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}
