import { authMarkdown } from "@/lib/agent";
import { markdownResponse } from "@/lib/agent-http";

export const dynamic = "force-static";

export function GET() {
  return markdownResponse(authMarkdown());
}
