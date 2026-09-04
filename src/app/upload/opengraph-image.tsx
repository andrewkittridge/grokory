import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "Share a Grok Bot · Grokdex";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    title: "Share a bot",
    kicker: "List",
    summary:
      "Paste a public x.ai/bot share link. It lists on the ranked board. Free, no account.",
    footerLeft: "No account",
  });
}
