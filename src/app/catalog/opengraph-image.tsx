import { ogImage, ogListingCount, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";
import { listTemplates } from "@/lib/templates-store";

export const alt = "Catalog · Grokdex";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default async function Image() {
  const templates = await listTemplates();

  return ogImage({
    title: "Catalog",
    kicker: ogListingCount(templates.length),
    summary:
      "Public Grok Bots as a moving parade of live silhouettes. Open a bot to add a copy on x.ai.",
    footerLeft: "Parade",
  });
}
