import { robotsTxt } from "@/lib/agent";
import { textResponse } from "@/lib/agent-http";

export const dynamic = "force-dynamic";

export function GET() {
  return textResponse(robotsTxt(), "text/plain; charset=utf-8");
}
