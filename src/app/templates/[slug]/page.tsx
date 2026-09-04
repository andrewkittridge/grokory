import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AddProcedure } from "@/components/add-procedure";
import { BotIdentityStage } from "@/components/bot-identity";
import { BotRankList } from "@/components/bot-rank-row";
import {
  BoostCta,
  BoostedMark,
  FeatureCta,
  FeaturedMark,
} from "@/components/feature-cta";
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
import { breadcrumbListJson, softwareJson } from "@/lib/json-ld";
import { authorIdentity, formatCount, preferredAuthorName } from "@/lib/bot-url";
import { pageMetadata } from "@/lib/site";
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
  return pageMetadata({
    title: template.title,
    description: template.summary,
    path: `/templates/${slug}`,
  });
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
  const authorSlugKey = authorIdentity(template).slug;
  const authorName = preferredAuthorName(
    listings.filter((item) => authorIdentity(item).slug === authorSlugKey)
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={softwareJson(template, listingHref)} />
      <JsonLd
        data={breadcrumbListJson([
          { name: "Board", path: "/templates" },
          { name: template.title, path: `/templates/${template.slug}` },
        ])}
      />
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

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <article>
          <div className="motion-enter" style={motionDelay(1)}>
            <BotIdentityStage
              mark={template.mark}
              title={template.title}
              ogImage={template.ogImage}
            />
            <div className="pt-6 sm:pt-8">
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
              <LockTitle className="mt-5">{template.title}</LockTitle>
              <AuthorByline
                name={authorName}
                xHandle={template.xHandle}
                shareUrl={template.botUrl}
                className="mt-2 text-muted-foreground"
              />
              <p className="mt-5 max-w-2xl text-base leading-7 text-body">
                {template.description}
              </p>
              {template.note ? (
                <blockquote className="mt-6 border-l border-sunset/40 pl-4 text-sm leading-6 text-muted-foreground">
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
          </div>
        </article>
        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <div className="motion-enter" style={motionDelay(2)}>
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
          <div className="motion-enter border-t border-border pt-5" style={motionDelay(3)}>
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
              {" · "}
              {template.live ? "Live on x.ai" : "Share link down"}
            </p>
          </div>
          <div className="motion-enter" style={motionDelay(4)}>
            <FeatureCta
              template={template}
              listings={listings}
              enabled={payments}
            />
          </div>
          <div className="motion-enter" style={motionDelay(5)}>
            <BoostCta
              template={template}
              listings={listings}
              enabled={payments}
            />
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="display-section">Related</h2>
          <div className="mt-5 border-y border-border">
            <BotRankList templates={related} showVote scramble />
          </div>
        </section>
      ) : null}
    </main>
  );
}
