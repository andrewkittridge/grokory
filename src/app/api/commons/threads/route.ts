import { jsonResponse, jsonWrite, optionsResponse } from "@/lib/agent-http";
import {
  createThreadFromRequest,
  listThreadsPayload,
} from "@/lib/commons-http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  return jsonResponse(await listThreadsPayload(), {
    "cache-control": "public, max-age=15",
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
    return jsonWrite({ error: "Send JSON with title." }, 400);
  }
  const result = await createThreadFromRequest(request, payload);
  const extra =
    result.status === 429 ? { "retry-after": "3600" } : undefined;
  return jsonWrite(result.body, result.status, extra);
}
