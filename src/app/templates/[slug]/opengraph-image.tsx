import { formatAdds } from "@/lib/bot-url";
import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";
import { sortTemplates } from "@/lib/rank";
import { getTemplate, listTemplates } from "@/lib/templates-store";

export const alt = "Grokdex listing";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listings = await listTemplates(undefined, { includeDown: true });
  const template =
    listings.find((item) => item.slug === slug) ?? (await getTemplate(slug));

  if (!template) {
    return ogImage({
      title: "Grok Bot",
      summary: "A public Grok Bot share link on Grokdex.",
      kicker: "Ranked Grok Bot catalog",
    });
  }

  const rankIndex = sortTemplates(listings, "hot").findIndex(
    (item) => item.slug === template.slug
  );
  const rank = rankIndex >= 0 ? rankIndex + 1 : 0;
  const handle = template.xHandle ? `  ·  @${template.xHandle}` : "";
  const points = template.score === 1 ? "1 pt" : `${template.score} pts`;

  return ogImage({
    title: template.title,
    kicker: `${template.authorName}${handle}`,
    summary: template.summary,
    footerLeft: `${points}  ·  ${formatAdds(template.adds)}`,
    badge: rank > 0 ? String(rank).padStart(2, "0") : undefined,
  });
}
