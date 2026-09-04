import { markdownSourcePath, pageMarkdown } from "@/lib/agent";
import { markdownResponse } from "@/lib/agent-http";
import { threadMarkdown, threadsIndexMarkdown } from "@/lib/commons";
import { getPublicThread, listPublicThreads } from "@/lib/commons-store";
import { listTemplates } from "@/lib/templates-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Rewrites keep the original URL, so `path` may be absent — use the request path.
  const raw = url.searchParams.get("path") ?? url.pathname;
  const path = markdownSourcePath(raw) ?? (raw.startsWith("/") ? raw : `/${raw}`);
  if (path === "/commons") {
    const threads = await listPublicThreads();
    return markdownResponse(threadsIndexMarkdown(threads));
  }
  const commons = path.match(/^\/commons\/([^/]+)$/);
  if (commons) {
    const thread = await getPublicThread(commons[1]);
    if (!thread) return markdownResponse("# Not found\n", 404);
    return markdownResponse(threadMarkdown(thread));
  }
  const templates = await listTemplates();
  const page = pageMarkdown(path, templates);
  if (!page) {
    return markdownResponse("# Not found\n\nNo Markdown for this path.\n", 404);
  }
  return markdownResponse(page.body, page.status);
}
