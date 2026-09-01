import { publicBot } from "@/lib/agent";
import { jsonResponse, optionsResponse } from "@/lib/agent-http";
import { getTemplate } from "@/lib/templates-store";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template || !template.live) {
    return jsonResponse({ error: "Not found" }, { "cache-control": "no-store" }, 404);
  }
  return jsonResponse(publicBot(template));
}
