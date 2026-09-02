import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AddProcedure } from "@/components/add-procedure";
import { BotCover } from "@/components/bot-cover";
import { BotRankList } from "@/components/bot-rank-row";
import {
  BoostCta,
  BoostedMark,
  FeatureCta,
  FeaturedMark,
} from "@/components/feature-cta";
import { Frame } from "@/components/frame";
import { LockTitle } from "@/components/lock-title";
import { JsonLd } from "@/components/json-ld";
import { ListedBanner } from "@/components/listed-banner";
import { ListedConversion } from "@/components/listed-conversion";
import { AuthorByline, WhatTravels } from "@/components/listing-trust";
import { VoteButtons } from "@/components/vote-buttons";
import { Badge } from "@/components/ui/badge";
import { isBoostedActive } from "@/lib/boost";
import { isFeaturedActive } from "@/lib/featured";
import { isFoundingBoard } from "@/lib/founding";
import { getTemplate, listTemplates } from "@/lib/templates-store";
import { relatedTemplates } from "@/lib/templates";
import { softwareJson } from "@/lib/json-ld";
import { formatCount } from "@/lib/bot-url";
import { isStripeConfigured } from "@/lib/stripe";
import { turnstileSiteKey } from "@/lib/turnstile";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";
import { RefreshListing } from "@/components/refresh-listing";

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
    },
    twitter: {
      card: "summary_large_image",
      title: template.title,
      description: template.summary,
    },
  };
}

export default async function TemplateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    listed?: string;
    linked?: string;
    updated?: string;
    featured?: string;
    boosted?: string;
  }>;
}) {
  const { slug } = await params;
  const paramsSearch = await searchParams;
  const listed = paramsSearch.listed === "1";
  const linked = paramsSearch.linked === "1";
  const updated = paramsSearch.updated === "1";
  const justFeatured = paramsSearch.featured === "1";
  const justBoosted = paramsSearch.boosted === "1";
  const voterId = await readVoterId();
  const template = await getTemplate(slug, voterId);
  if (!template) notFound();

  const listings = await listTemplates(voterId);
  const related = relatedTemplates(listings, template);
  const listingHref = await listingUrl(template.slug);
  const payments = isStripeConfigured();
  const featured = isFeaturedActive(template);
  const boosted = isBoostedActive(template);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <JsonLd data={softwareJson(template, listingHref)} />
      <ListedConversion listed={listed} />
      {listed || linked || updated ? (
        <div className="motion-enter mb-10" style={motionDelay(0)}>
          <ListedBanner
            title={template.title}
            listingUrl={listingHref}
            featureHref={payments ? "#feature" : undefined}
            shareUrl={template.botUrl}
            xHandle={template.xHandle}
            summary={template.summary}
            justLinked={linked && !updated}
            justUpdated={updated}
            founding={isFoundingBoard(listings.length)}
          />
        </div>
      ) : null}
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

      <div className="motion-enter mt-8 lg:hidden" style={motionDelay(1)}>
        <LockTitle>{template.title}</LockTitle>
        <AuthorByline
          name={template.authorName}
          xHandle={template.xHandle}
          shareUrl={template.botUrl}
          className="mt-2 text-muted-foreground"
        />
      </div>

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-16 lg:self-start">
          <div className="motion-enter" style={motionDelay(1)}>
            <AddProcedure
              template={template}
              listingUrl={listingHref}
              refresh={
                <RefreshListing
                  shareUrl={template.botUrl}
                  siteKey={turnstileSiteKey()}
                />
              }
            />
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
          <div className="motion-enter" style={motionDelay(3)}>
            <FeatureCta
              template={template}
              listings={listings}
              enabled={payments}
            />
          </div>
          <div className="motion-enter" style={motionDelay(4)}>
            <BoostCta
              template={template}
              listings={listings}
              enabled={payments}
            />
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
                acquire
              />
              <div className="px-5 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-wrap gap-1.5">
                  {featured ? <FeaturedMark /> : null}
                  {justFeatured && !featured ? (
                    <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                      Featured pending
                    </span>
                  ) : null}
                  {boosted ? <BoostedMark /> : null}
                  {justBoosted && !boosted ? (
                    <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                      Boost pending
                    </span>
                  ) : null}
                  {template.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="ghost"
                      render={
                        <Link href={`/templates?tag=${encodeURIComponent(tag)}`} />
                      }
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <LockTitle className="mt-5 hidden lg:block">
                  {template.title}
                </LockTitle>
                <AuthorByline
                  name={template.authorName}
                  xHandle={template.xHandle}
                  shareUrl={template.botUrl}
                  className="mt-2 hidden text-muted-foreground lg:block"
                />
                <p className="mt-5 max-w-2xl text-base leading-7 text-body">
                  {template.description}
                </p>
                {template.note ? (
                  <blockquote className="mt-6 border-l border-border pl-4 text-sm leading-6 text-muted-foreground">
                    {template.note}
                  </blockquote>
                ) : null}
                <WhatTravels
                  skills={template.skills}
                  routines={template.routines}
                />
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
          <h2 className="display-section">Related</h2>
          <BotRankList
            templates={related}
            showVote
            scramble
            className="mt-5 border-y border-border"
          />
        </section>
      ) : null}
    </main>
  );
}
