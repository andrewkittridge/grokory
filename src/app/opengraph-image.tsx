import { ogHomeKicker, ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";
import { isFoundingBoard } from "@/lib/founding";
import { SITE_DESCRIPTION } from "@/lib/site";
import { listTemplates } from "@/lib/templates-store";

export const alt = "Grokdex — Public Grok Bot board";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default async function Image() {
  const templates = await listTemplates();
  const founding = isFoundingBoard(templates.length);

  return ogImage({
    title: "A ranked board of public Grok Bots",
    kicker: ogHomeKicker(templates.length, founding),
    summary: SITE_DESCRIPTION,
    footerLeft: founding ? "Just opened" : "Public board",
  });
}
