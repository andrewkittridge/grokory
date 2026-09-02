import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "FAQ · Grokdex";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    title: "FAQ",
    kicker: "Grokdex",
    summary:
      "What Grokdex is, how to list a public Grok Bot, and how Add copies a template onto your Grok account.",
    footerLeft: "Public board",
  });
}
