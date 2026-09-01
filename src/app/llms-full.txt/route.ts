import { llmsFullTxt } from "@/lib/agent";
import { textResponse } from "@/lib/agent-http";
import { listTemplates } from "@/lib/templates-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await listTemplates();
  return textResponse(llmsFullTxt(templates), "text/plain; charset=utf-8");
}
