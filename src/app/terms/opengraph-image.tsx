import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "Terms · Grokdex";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    title: "Terms",
    kicker: "Grokdex",
    summary:
      "Terms for using Grokdex, listing public Grok Bot share links, paid featured placement, and board boosts.",
    footerLeft: "Public board",
  });
}
