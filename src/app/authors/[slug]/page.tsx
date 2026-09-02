import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotRankList } from "@/components/bot-rank-row";
import { JsonLd } from "@/components/json-ld";
import { LockTitle } from "@/components/lock-title";
import { CountTick } from "@/components/telemetry";
import { authorSlug, xHandleLabel, xHandleUrl } from "@/lib/bot-url";
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
  const handles = [
    ...new Set(
      templates
        .map((template) => template.xHandle)
        .filter((handle): handle is string => Boolean(handle))
    ),
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <JsonLd data={itemListJson(templates, `/authors/${slug}`)} />
      <p
        className="motion-enter font-mono text-xs tracking-wide text-muted-foreground uppercase"
        style={motionDelay(0)}
      >
        <Link
          href="/authors"
          className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
        >
          Authors
        </Link>
        <span className="mx-2 text-border">/</span>
        {name}
      </p>
      <LockTitle delay={1} className="mt-4">
        {name}
      </LockTitle>
      <p
        className="motion-enter mt-4 max-w-2xl text-sm leading-7 text-body"
        style={motionDelay(2)}
      >
        <CountTick
          value={templates.length}
          singular="bot"
          plural="bots"
        />{" "}
        on the board.
        {handles.length > 0 ? (
          <>
            {" "}
            {handles.map((handle, index) => (
              <span key={handle}>
                {index > 0 ? ", " : null}
                <a
                  href={xHandleUrl(handle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
                >
                  {xHandleLabel(handle)}
                </a>
              </span>
            ))}
          </>
        ) : null}
      </p>
      <BotRankList
        templates={templates}
        showVote
        scramble
        className="mt-10 border-y border-border"
      />
    </main>
  );
}
