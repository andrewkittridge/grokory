import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AddBotButton } from "@/components/add-bot-button";
import { BotCover } from "@/components/bot-cover";
import { BotRankRow } from "@/components/bot-rank-row";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Frame } from "@/components/frame";
import { ListedConversion } from "@/components/listed-conversion";
import { VoteButtons } from "@/components/vote-buttons";
import { Badge } from "@/components/ui/badge";
import { getTemplate, listTemplates } from "@/lib/templates-store";
import { relatedTemplates } from "@/lib/templates";
import { formatCount } from "@/lib/bot-url";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

async function listingUrl(slug: string) {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "127.0.0.1:43127";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}/templates/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) return { title: "Bot not found" };
  return {
    title: template.title,
    description: template.summary,
    alternates: { canonical: `/templates/${slug}` },
    openGraph: {
      title: template.title,
      description: template.summary,
      url: `/templates/${slug}`,
      images: template.ogImage ? [{ url: template.ogImage }] : undefined,
    },
  };
}

export default async function TemplateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ listed?: string }>;
}) {
  const { slug } = await params;
  const listed = (await searchParams).listed === "1";
  const voterId = await readVoterId();
  const template = await getTemplate(slug, voterId);
  if (!template) notFound();

  const related = relatedTemplates(await listTemplates(voterId), template);
  const listingHref = await listingUrl(template.slug);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <ListedConversion listed={listed} />
      <p
        className="motion-enter font-mono text-xs tracking-wide text-muted-foreground uppercase"
        style={motionDelay(0)}
      >
        <Link
          href="/templates"
          className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
        >
          Board
        </Link>
        <span className="mx-2 text-border">/</span>
        {template.title}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-16 lg:self-start">
          <div className="motion-enter" style={motionDelay(1)}>
            <Frame staticFrame matClassName="p-5">
              <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Add
              </p>
              <p className="mt-2 break-all font-mono text-xs text-foreground">
                {template.botUrl}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <AddBotButton
                  slug={template.slug}
                  botUrl={template.botUrl}
                  size="lg"
                />
                <CopyLinkButton url={template.botUrl} />
                <CopyLinkButton url={listingHref} label="Copy listing link" />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Listed by {template.submittedBy}
              </p>
            </Frame>
          </div>
          <div className="motion-enter" style={motionDelay(2)}>
            <Frame staticFrame matClassName="p-5">
              <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Rank
              </p>
              <div className="mt-3">
                <VoteButtons
                  templateId={template.id}
                  score={template.score}
                  userVote={template.userVote}
                  layout="row"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-mono tabular-nums text-foreground">
                  {template.score === 1 ? "1 point" : `${template.score} points`}
                </span>
                {" · "}
                {formatCount(template.adds)} adds
              </p>
            </Frame>
          </div>
        </aside>

        <article className="order-2 lg:order-1">
          <div className="motion-enter" style={motionDelay(3)}>
            <Frame staticFrame>
              <BotCover
                botId={template.botId}
                title={template.title}
                ogImage={template.ogImage}
                className="h-36 sm:h-44"
              />
              <div className="px-5 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{template.category}</Badge>
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="ghost">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="mt-5 text-4xl font-normal tracking-tight sm:text-5xl">
                  {template.title}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  by {template.authorName}
                </p>
                <p className="mt-5 max-w-2xl text-base leading-7 text-secondary-foreground">
                  {template.description}
                </p>
                {template.note ? (
                  <blockquote className="mt-6 border-l border-border pl-4 text-sm leading-6 text-muted-foreground">
                    {template.note}
                  </blockquote>
                ) : null}
                <p className="mt-6 text-xs leading-5 text-muted-foreground">
                  This bot was created by a third-party user, not by SpaceXAI.
                  Adding it creates a copy on your Grok Bot account. It does
                  not share the author’s computer, logins, or conversation
                  history.
                </p>
              </div>
            </Frame>
          </div>
        </article>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-2xl font-normal tracking-tight">Same job</h2>
          <ol className="mt-5 divide-y divide-border border-y border-border">
            {related.map((item, index) => (
              <li key={item.id}>
                <BotRankRow rank={index + 1} template={item} showVote />
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  );
}
