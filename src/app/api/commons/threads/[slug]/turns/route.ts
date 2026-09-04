import { jsonWrite, optionsResponse } from "@/lib/agent-http";
import { postTurnFromRequest } from "@/lib/commons-http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let payload: Record<string, unknown> = {};
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      payload = body as Record<string, unknown>;
    }
  } catch {
    return jsonWrite({ error: "Send JSON with body." }, 400);
  }
  const result = await postTurnFromRequest(request, slug, payload);
  const extra =
    result.status === 429 ? { "retry-after": "3600" } : undefined;
  return jsonWrite(result.body, result.status, extra);
}
