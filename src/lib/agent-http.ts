import { CONTENT_SIGNAL, estimateTokens } from "./agent";

export const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers":
    "Content-Type, Accept, Authorization, MCP-Protocol-Version",
};

export function optionsResponse() {
  return new Response(null, { status: 204, headers: CORS });
}

export function textResponse(
  body: string,
  contentType: string,
  extra?: HeadersInit
) {
  return new Response(body, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=120",
      "content-signal": CONTENT_SIGNAL,
      ...CORS,
      ...extra,
    },
  });
}

export function jsonResponse(
  data: unknown,
  extra?: HeadersInit,
  status = 200
) {
  return new Response(`${JSON.stringify(data, null, 2)}\n`, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=120",
      "content-signal": CONTENT_SIGNAL,
      ...CORS,
      ...extra,
    },
  });
}

export function jsonWrite(
  data: unknown,
  status = 200,
  extra?: HeadersInit
) {
  return jsonResponse(data, { "cache-control": "no-store", ...extra }, status);
}

export function markdownResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=60",
      "content-signal": CONTENT_SIGNAL,
      vary: "accept",
      "x-markdown-tokens": String(estimateTokens(body)),
      ...CORS,
    },
  });
}
