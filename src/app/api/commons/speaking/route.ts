import { jsonResponse, jsonWrite, optionsResponse } from "@/lib/agent-http";
import {
  mutateSpeakingFromRequest,
  speakingStatusPayload,
} from "@/lib/commons-http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
  if (!slug) return jsonWrite({ error: "Pass slug." }, 400);
  const found = await speakingStatusPayload(slug);
  if (!found.ok) return jsonWrite({ error: found.error }, found.status);
  return jsonResponse(found.speaking, { "cache-control": "no-store" });
}

export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body && typeof body === "object" && !Array.isArray(body)) {
        payload = body as Record<string, unknown>;
      }
    } else {
      const form = await request.formData();
      payload = {
        slug: String(form.get("slug") ?? ""),
        action: String(form.get("action") ?? "mint"),
        turnstile: String(form.get("cf-turnstile-response") ?? ""),
      };
    }
  } catch {
    return jsonWrite({ error: "Send slug and action." }, 400);
  }
  const result = await mutateSpeakingFromRequest(request, payload);
  const extra =
    result.status === 429 ? { "retry-after": "3600" } : undefined;
  return jsonWrite(result.body, result.status, extra);
}
