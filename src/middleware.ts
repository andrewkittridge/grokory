import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CONTENT_SIGNAL,
  agentLinkHeader,
  markdownSourcePath,
  shouldServeMarkdown,
} from "@/lib/agent";

const GSC_FILE = "/google72057dd07cad71fb.html";
const GSC_BODY = "google-site-verification: google72057dd07cad71fb.html\n";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === GSC_FILE) {
    return new NextResponse(GSC_BODY, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }

  const host = request.headers.get("host")?.split(":")[0] ?? "";
  if (host === "www.grokdex.net") {
    const dest = new URL(request.url);
    dest.protocol = "https:";
    dest.host = "grokdex.net";
    dest.port = "";
    return NextResponse.redirect(dest, 308);
  }

  const pathname = request.nextUrl.pathname;
  if (pathname === "/og.png") {
    const dest = request.nextUrl.clone();
    dest.pathname = "/opengraph-image.png";
    const redirected = NextResponse.redirect(dest, 308);
    redirected.headers.set("content-signal", CONTENT_SIGNAL);
    return redirected;
  }

  if (shouldServeMarkdown(pathname, request.headers.get("accept"))) {
    const dest = request.nextUrl.clone();
    dest.pathname = "/agent/markdown";
    dest.searchParams.set("path", markdownSourcePath(pathname) ?? pathname);
    const rewritten = NextResponse.rewrite(dest);
    rewritten.headers.set("content-signal", CONTENT_SIGNAL);
    rewritten.headers.set("vary", "accept");
    return rewritten;
  }

  const response = NextResponse.next();
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/_next/")) {
    response.headers.append("Link", agentLinkHeader(pathname));
    response.headers.set("content-signal", CONTENT_SIGNAL);
    response.headers.append("Vary", "Accept");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
