import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotIdentityThumb } from "@/components/bot-identity";
import { BotRankList } from "@/components/bot-rank-row";
import { JsonLd } from "@/components/json-ld";
import { LockTitle } from "@/components/lock-title";
import { CountTick } from "@/components/telemetry";
import { authorIdentity, preferredAuthorName, xHandleLabel, xHandleUrl } from "@/lib/bot-url";
import { itemListJson, personJson } from "@/lib/json-ld";
import { sortTemplates } from "@/lib/rank";
import { pageMetadata } from "@/lib/site";
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
    (template) => authorIdentity(template).slug === slug
  );
  const name = listed[0] ? preferredAuthorName(listed) : slug;
  return pageMetadata({
    title: name,
    description: `Public Grok Bot templates by ${name} on Grokdex.`,
    path: `/authors/${slug}`,
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const templates = sortTemplates(
    (await listTemplates(await readVoterId())).filter(
      (template) => authorIdentity(template).slug === slug
    ),
    "hot"
  );
  if (templates.length === 0) notFound();
  const name = preferredAuthorName(templates);
  const handles = [
    ...new Set(
      templates
        .map((template) => template.xHandle)
        .filter((handle): handle is string => Boolean(handle))
    ),
  ].filter((handle) => xHandleLabel(handle) !== name);
  const sameAsHandle = templates.find((template) => template.xHandle)?.xHandle;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <JsonLd data={itemListJson(templates, `/authors/${slug}`)} />
      <JsonLd
        data={personJson(
          name,
          `/authors/${slug}`,
          sameAsHandle ? xHandleUrl(sameAsHandle) : undefined
        )}
      />
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
      <div className="live-cast motion-enter" style={motionDelay(3)}>
        {templates.slice(0, 10).map((template) => (
          <Link
            key={template.slug}
            href={`/templates/${template.slug}`}
            className="live-cast-item"
            aria-label={template.title}
          >
            <BotIdentityThumb mark={template.mark} size="lg" />
            <span className="live-cast-name">{template.title}</span>
          </Link>
        ))}
      </div>
      <BotRankList
        templates={templates}
        showVote
        scramble
        className="mt-8 border-y border-border"
      />
    </main>
  );
}
