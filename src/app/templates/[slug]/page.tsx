import Link from "next/link";
import { notFound } from "next/navigation";
import { AddBotButton } from "@/components/add-bot-button";
import { BotCard } from "@/components/bot-card";
import { BotCover } from "@/components/bot-cover";
import { CopyLinkButton } from "@/components/copy-link-button";
import { VoteButtons } from "@/components/vote-buttons";
import { Badge } from "@/components/ui/badge";
import { getTemplate, listTemplates } from "@/lib/templates-store";
import { relatedTemplates } from "@/lib/templates";
import { formatCount } from "@/lib/bot-url";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

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
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const voterId = await readVoterId();
  const template = await getTemplate(slug, voterId);
  if (!template) notFound();

  const related = relatedTemplates(await listTemplates(voterId), template);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm text-muted-foreground">
        <Link href="/templates" className="hover:text-foreground">
          Board
        </Link>
        <span className="mx-2">/</span>
        {template.title}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <article className="overflow-hidden rounded-2xl ring-1 ring-foreground/10">
          <BotCover
            botId={template.botId}
            title={template.title}
            ogImage={template.ogImage}
            className="h-52 sm:h-64"
          />
          <div className="bg-card px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={template.origin === "curated" ? "default" : "outline"}>
                {template.origin === "curated" ? "Staff pick" : "Community"}
              </Badge>
              <Badge variant="secondary">{template.category}</Badge>
              {template.tags.map((tag) => (
                <Badge key={tag} variant="ghost">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="font-heading mt-4 text-4xl tracking-tight sm:text-5xl">
              {template.title}
            </h1>
            <p className="mt-2 text-muted-foreground">by {template.authorName}</p>
            <p className="mt-5 max-w-2xl text-base leading-7">
              {template.description}
            </p>
            {template.note ? (
              <blockquote className="mt-6 border-l-2 border-primary pl-4 text-sm leading-6 text-muted-foreground italic">
                {template.note}
              </blockquote>
            ) : null}
            <p className="mt-6 text-xs leading-5 text-muted-foreground">
              This bot was created by a third-party user, not by SpaceXAI. Adding
              it creates a copy on your Grok Bot account. It does not share the
              author’s computer, logins, or conversation history.
            </p>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
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
              {template.score === 1 ? "1 point" : `${template.score} points`} ·{" "}
              {formatCount(template.adds)} adds
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
              Share link
            </p>
            <p className="mt-2 break-all font-mono text-xs text-foreground">
              {template.botUrl}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <AddBotButton slug={template.slug} botUrl={template.botUrl} size="lg" />
              <CopyLinkButton url={template.botUrl} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Listed by {template.submittedBy}
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-heading text-2xl tracking-tight">Same job</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <BotCard key={item.id} template={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
