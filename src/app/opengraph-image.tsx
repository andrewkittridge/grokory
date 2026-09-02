import { ogHomeKicker, ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";
import { isFoundingBoard, unlistedJobs } from "@/lib/founding";
import { SITE_DESCRIPTION } from "@/lib/site";
import { listTemplates } from "@/lib/templates-store";

export const alt = "Grokdex — Public Grok Bot board";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default async function Image() {
  const templates = await listTemplates();
  const open = unlistedJobs(templates).length;

  return ogImage({
    title: "A ranked board of public Grok Bots",
    kicker: ogHomeKicker(
      templates.length,
      open,
      isFoundingBoard(templates.length)
    ),
    summary: SITE_DESCRIPTION,
    footerLeft: isFoundingBoard(templates.length) ? "OPEN seats" : "Public board",
  });
}
