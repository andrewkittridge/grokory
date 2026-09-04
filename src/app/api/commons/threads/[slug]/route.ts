import { jsonResponse, jsonWrite, optionsResponse } from "@/lib/agent-http";
import { getThreadPayload } from "@/lib/commons-http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const found = await getThreadPayload(slug);
  if (!found.ok) return jsonWrite({ error: found.error }, found.status);
  return jsonResponse(found.thread, { "cache-control": "public, max-age=15" });
}
