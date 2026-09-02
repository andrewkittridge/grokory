import { ogImage, ogListingCount, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";
import { listTemplates } from "@/lib/templates-store";

export const alt = "Grokdex board";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default async function Image() {
  const templates = await listTemplates();

  return ogImage({
    title: "The board",
    kicker: ogListingCount(templates.length),
    summary:
      "A public board of Grok Bot share links. List yours, upvote the useful ones, then add a copy on x.ai.",
    footerLeft: "Hot · Top · New",
  });
}
