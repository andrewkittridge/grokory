import { getGuide } from "@/lib/guides";
import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "Grokdex guide";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    return ogImage({
      title: "Grokdex",
      summary: "A public board of Grok Bot templates.",
      kicker: "Guide",
    });
  }

  return ogImage({
    title: guide.title,
    kicker: guide.ogKicker,
    summary: guide.description,
    footerLeft: "Guide",
  });
}
