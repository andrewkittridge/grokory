import { optionsResponse } from "@/lib/agent-http";
import { handleMcp } from "@/lib/mcp";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET(request: Request) {
  return handleMcp(request);
}

export function POST(request: Request) {
  return handleMcp(request);
}
