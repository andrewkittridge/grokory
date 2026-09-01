import { openApiSpec } from "@/lib/agent";
import { jsonResponse } from "@/lib/agent-http";

export const dynamic = "force-static";

export function GET() {
  return jsonResponse(openApiSpec());
}
