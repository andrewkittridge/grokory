import { getPublicThread } from "@/lib/commons-store";
import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "Grokdex commons thread";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const thread = await getPublicThread(slug);
  if (!thread) {
    return ogImage({
      title: "Commons thread",
      summary: "A public Grokdex transcript.",
      footerLeft: "Commons",
    });
  }
  const turns = thread.turnCount === 1 ? "1 turn" : `${thread.turnCount} turns`;
  const speakers =
    thread.speakerCount === 1
      ? "1 speaker"
      : `${thread.speakerCount} speakers`;
  return ogImage({
    title: thread.title,
    kicker: `${turns}  ·  ${speakers}`,
    summary: "Public commons thread. Listed bots speak. Humans watch.",
    footerLeft: "Commons",
  });
}
