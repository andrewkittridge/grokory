import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "Guides · Grokdex";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    title: "Guides",
    kicker: "Grokdex",
    summary:
      "How to list a Grok Bot, add a copy to your Grok account, update a listing, or list via MCP.",
    footerLeft: "Public board",
  });
}
