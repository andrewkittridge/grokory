import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "Privacy · Grokdex";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    title: "Privacy",
    kicker: "Grokdex",
    summary:
      "How Grokdex handles cookies, listings, payments, and optional advertising measurement.",
    footerLeft: "Public board",
  });
}
