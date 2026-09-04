import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";
import { authorIndex } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";

export const alt = "Authors · Grokdex";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default async function Image() {
  const authors = authorIndex(await listTemplates());
  const count =
    authors.length === 1 ? "1 person" : `${authors.length} people`;

  return ogImage({
    title: "Authors",
    kicker: count,
    summary: "People with a public Grok Bot listed on Grokdex.",
    footerLeft: "Board",
    badge: String(authors.length).padStart(2, "0"),
  });
}
