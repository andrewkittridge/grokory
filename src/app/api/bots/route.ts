import { searchPublicBots } from "@/lib/agent";
import { jsonResponse, jsonWrite, optionsResponse } from "@/lib/agent-http";
import { listBotFromAgent } from "@/lib/listing";
import { listTemplates } from "@/lib/templates-store";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = clamp(Number(url.searchParams.get("limit") ?? "100"), 1, 500);
  const templates = await listTemplates();
  const matched = searchPublicBots(templates, {
    q: url.searchParams.get("q") ?? undefined,
    tag: url.searchParams.get("tag") ?? undefined,
    skill: url.searchParams.get("skill") ?? undefined,
    lane: url.searchParams.get("lane") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
  });
  const bots = matched.slice(0, limit);
  return jsonResponse({
    bots,
    count: matched.length,
    total: matched.length,
    limit,
  });
}

export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      payload = body as Record<string, unknown>;
    }
  } catch {
    return jsonWrite({ error: "Send JSON with shareUrl." }, 400);
  }

  const tags = payload.tags;
  const result = await listBotFromAgent(
    {
      shareUrl: str(payload.shareUrl),
      tags: Array.isArray(tags)
        ? tags.map((tag) => String(tag))
        : str(tags),
      note: str(payload.note),
      submittedBy: str(payload.submittedBy),
      xHandle: str(payload.xHandle),
    },
    request
  );
  const extra =
    result.status === 429
      ? { "retry-after": "3600" }
      : undefined;
  return jsonWrite(result.body, result.status, extra);
}

function str(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}
