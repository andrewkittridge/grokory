import { jsonResponse } from "@/lib/agent-http";

export const dynamic = "force-dynamic";

export function GET() {
  return jsonResponse({ ok: true, service: "grokdex" });
}
