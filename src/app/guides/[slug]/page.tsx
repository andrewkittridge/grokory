import { notFound } from "next/navigation";
import { GuideDoc } from "@/components/guide-doc";
import { JsonLd } from "@/components/json-ld";
import { GUIDES, getGuide } from "@/lib/guides";
import { howToJson } from "@/lib/json-ld";
import { absUrl, pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found" };
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: guide.path,
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <GuideDoc
      guide={guide}
      extras={
        guide.howTo ? (
          <JsonLd
            data={howToJson({
              name: guide.title,
              description: guide.description,
              url: absUrl(guide.path),
              steps: guide.howTo,
            })}
          />
        ) : null
      }
    />
  );
}
