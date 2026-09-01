import { markdownSourcePath, pageMarkdown } from "@/lib/agent";
import { markdownResponse } from "@/lib/agent-http";
import { listTemplates } from "@/lib/templates-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Rewrites keep the original URL, so `path` may be absent — use the request path.
  const raw = url.searchParams.get("path") ?? url.pathname;
  const path = markdownSourcePath(raw) ?? (raw.startsWith("/") ? raw : `/${raw}`);
  const templates = await listTemplates();
  const page = pageMarkdown(path, templates);
  if (!page) {
    return markdownResponse("# Not found\n\nNo Markdown for this path.\n", 404);
  }
  return markdownResponse(page.body, page.status);
}
