import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotRankRow } from "@/components/bot-rank-row";
import { JsonLd } from "@/components/json-ld";
import { authorSlug } from "@/lib/bot-url";
import { itemListJson } from "@/lib/json-ld";
import { sortTemplates } from "@/lib/rank";
import { listTemplates } from "@/lib/templates-store";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const templates = await listTemplates();
  const listed = templates.filter(
    (template) => authorSlug(template.authorName) === slug
  );
  const name = listed[0]?.authorName ?? slug;
  return {
    title: name,
    description: `Public Grok Bot templates by ${name} on Grokdex.`,
    alternates: { canonical: `/authors/${slug}` },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const templates = sortTemplates(
    (await listTemplates(await readVoterId())).filter(
      (template) => authorSlug(template.authorName) === slug
    ),
    "hot"
  );
  if (templates.length === 0) notFound();
  const name = templates[0].authorName;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <JsonLd data={itemListJson(templates, `/authors/${slug}`)} />
      <p
        className="motion-enter font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
        style={motionDelay(0)}
      >
        Author
      </p>
      <h1
        className="display-page motion-enter mt-4"
        style={motionDelay(1)}
      >
        {name}
      </h1>
      <p
        className="motion-enter mt-4 max-w-2xl text-sm leading-7 text-body"
        style={motionDelay(2)}
      >
        {templates.length} {templates.length === 1 ? "bot" : "bots"} on the
        board.
      </p>
      <ol className="mt-10 divide-y divide-border border-y border-border">
        {templates.map((template, index) => (
          <li key={template.id}>
            <BotRankRow rank={index + 1} template={template} showVote />
          </li>
        ))}
      </ol>
    </main>
  );
}
