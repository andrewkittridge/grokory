import type { ReactNode } from "react";
import Link from "next/link";
import { BotIdentityThumb } from "@/components/bot-identity";
import { GrokBot } from "@/components/grok-bot";
import {
  BotRankList,
  BotRankRowSkeleton,
} from "@/components/bot-rank-row";
import { HeroWordmark } from "@/components/hero-wordmark";
import { CountTick } from "@/components/telemetry";
import { Button } from "@/components/ui/button";
import { motionDelay } from "@/lib/utils";
import type { BoardVacancy } from "@/lib/founding";
import type { ListedTemplate } from "@/lib/types";
import { JOBS } from "@/lib/visual";

export function LandingHero({
  founding = false,
  heading = true,
  lead,
  children,
}: {
  founding?: boolean;
  heading?: boolean;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="relative isolate">
      <div className="relative z-10">
        <div className="flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="cmd motion-enter" style={motionDelay(0)}>
              {founding ? "just opened" : "live"}
              <span className="mx-2 text-border" aria-hidden="true">
                ·
              </span>
              ranked public grok bots
            </p>
            <div className="mt-3">
              <HeroWordmark as={heading ? "h1" : "p"} />
            </div>
            <p
              className="motion-enter mt-4 max-w-xl text-[1.05rem] leading-7 text-body sm:mt-5 sm:text-[1.15rem]"
              style={motionDelay(1)}
            >
              Identity from x.ai. Add copies the template onto your Grok
              account.
            </p>
          </div>
          <div className="landing-mascot motion-enter" style={motionDelay(0)}>
            <GrokBot enterOnMount />
          </div>
        </div>
        {lead}
        <div
          className="motion-enter mt-7 flex flex-row flex-wrap gap-2"
          style={motionDelay(2)}
        >
          {founding ? (
            <>
              <Button
                className="min-w-0 flex-1 sm:flex-none"
                nativeButton={false}
                render={<Link href="/upload" />}
              >
                {JOBS.share}
              </Button>
              <Button
                variant="outline"
                className="min-w-0 flex-1 sm:flex-none"
                nativeButton={false}
                render={<Link href="/templates" />}
              >
                Browse the board
              </Button>
            </>
          ) : (
            <>
              <Button
                className="min-w-0 flex-1 sm:flex-none"
                nativeButton={false}
                render={<Link href="/templates" />}
              >
                Open the board
              </Button>
              <Button
                variant="outline"
                className="min-w-0 flex-1 sm:flex-none"
                nativeButton={false}
                render={<Link href="/upload" />}
              >
                {JOBS.share}
              </Button>
            </>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function LandingCast({
  templates,
}: {
  templates: ListedTemplate[];
}) {
  const cast = templates.slice(0, 10);
  if (cast.length === 0) return null;

  return (
    <div className="live-cast motion-enter" style={motionDelay(3)}>
      {cast.map((template) => (
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
      <Link href="/catalog" className="live-cast-more">
        Parade
      </Link>
    </div>
  );
}

export function LandingBoard({
  ranked,
  featured = [],
  count,
  founding = false,
  vacancies = [],
}: {
  ranked: ListedTemplate[];
  featured?: ListedTemplate[];
  count: number;
  founding?: boolean;
  vacancies?: BoardVacancy[];
}) {
  const empty = count === 0 && vacancies.length === 0;

  return (
    <div className="mt-10 sm:mt-12">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <p className="inline-flex min-w-0 items-baseline gap-x-2 overflow-hidden font-mono text-[11px] tracking-[0.14em] text-muted-foreground lowercase">
          <span className="inline-flex items-center gap-2 text-foreground">
            {founding ? (
              `${count} listed`
            ) : (
              <>
                <span className="live-dot" aria-hidden="true" />
                <CountTick value={count} singular="bot" plural="bots" />
              </>
            )}
          </span>
          {founding ? (
            <>
              <span className="text-border" aria-hidden="true">
                ·
              </span>
              <span className="truncate">seats open</span>
            </>
          ) : (
            <>
              <span className="text-border" aria-hidden="true">
                ·
              </span>
              <span className="truncate">hot</span>
            </>
          )}
        </p>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          className="shrink-0"
          render={<Link href="/templates" aria-label="Open the board" />}
        >
          <span className="sm:hidden">{JOBS.board}</span>
          <span className="hidden sm:inline">Full board</span>
        </Button>
      </div>
      <div className="motion-board border-y border-border" style={motionDelay(3)}>
        {featured.length > 0 ? (
          <div className="border-b border-border">
            <p className="cmd px-3 pt-4 sm:px-5">featured</p>
            <BotRankList
              templates={featured}
              showVote
              surface="roster"
              delay={3}
            />
          </div>
        ) : null}
        {empty ? (
          <div className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 px-4 py-10 sm:px-5 sm:py-12">
            <span className="pt-1 font-mono text-xs tabular-nums tracking-wide text-muted-foreground">
              01
            </span>
            <div className="min-w-0">
              <p className="font-heading text-xl leading-tight sm:text-2xl">
                Board just opened.
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-body">
                Paste a public share link to list the first Grok Bot.
              </p>
              <Button
                className="mt-6"
                nativeButton={false}
                render={<Link href="/upload" />}
              >
                {JOBS.share}
              </Button>
            </div>
          </div>
        ) : (
          <BotRankList
            templates={ranked}
            showVote
            leader
            surface="roster"
            vacancies={vacancies}
            delay={3}
          />
        )}
      </div>
    </div>
  );
}

export function LandingBoardSkeleton() {
  return (
    <div className="mt-10 border-y border-border sm:mt-12">
      {Array.from({ length: 6 }).map((_, index) => (
        <BotRankRowSkeleton key={index} surface="roster" />
      ))}
    </div>
  );
}
