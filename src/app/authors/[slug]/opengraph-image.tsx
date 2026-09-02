import { authorSlug, xHandleLabel } from "@/lib/bot-url";
import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";
import { listTemplates } from "@/lib/templates-store";

export const alt = "Grokdex author";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listed = (await listTemplates()).filter(
    (template) => authorSlug(template.authorName) === slug
  );
  const name = listed[0]?.authorName ?? slug;
  const handles = [
    ...new Set(
      listed
        .map((template) => template.xHandle)
        .filter((handle): handle is string => Boolean(handle))
    ),
  ];
  const count = listed.length;
  const bots = count === 1 ? "1 bot on the board" : `${count} bots on the board`;

  return ogImage({
    title: name,
    kicker: handles.length
      ? handles.map((handle) => xHandleLabel(handle)).join("  ·  ")
      : "Author",
    summary:
      listed.length > 0
        ? bots
        : "People with a public Grok Bot listed on Grokdex.",
    footerLeft: "Authors",
    badge: listed.length > 0 ? String(count).padStart(2, "0") : undefined,
  });
}
