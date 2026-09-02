import { formatAdds } from "@/lib/bot-url";
import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";
import { isFirstInJob, jobRank } from "@/lib/templates";
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

  const firstInJob = isFirstInJob(listings, template);
  const rank = jobRank(listings, template);
  const handle = template.xHandle ? `  ·  @${template.xHandle}` : "";
  const points = template.score === 1 ? "1 pt" : `${template.score} pts`;

  return ogImage({
    title: template.title,
    kicker: firstInJob
      ? `first ${template.category} bot`
      : `${template.category}  ·  ${template.authorName}${handle}`,
    summary: template.summary,
    footerLeft: `${points}  ·  ${formatAdds(template.adds)}`,
    badge: firstInJob
      ? "FIRST"
      : rank > 0
        ? String(rank).padStart(2, "0")
        : undefined,
  });
}
