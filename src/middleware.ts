import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  if (host !== "www.grokdex.net") return NextResponse.next();
  const dest = new URL(request.url);
  dest.protocol = "https:";
  dest.host = "grokdex.net";
  dest.port = "";
  return NextResponse.redirect(dest, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
