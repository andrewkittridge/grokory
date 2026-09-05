import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "Support Grokdex";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default function Image() {
  return ogImage({
    title: "Support Grokdex",
    kicker: "Grokdex",
    summary: "Optional tip. Not tax-deductible. Listing a bot stays free.",
    footerLeft: "Public board",
  });
}
