import type { ReactNode } from "react";
import Link from "next/link";
import { BotListPaste } from "@/components/bot-list-paste";
import {
  BotRankList,
  BotRankRowSkeleton,
} from "@/components/bot-rank-row";
import { GrokBot } from "@/components/grok-bot";
import { HeroWordmark } from "@/components/hero-wordmark";
import { LockTitle } from "@/components/lock-title";
import { CountTick } from "@/components/telemetry";
import { Button } from "@/components/ui/button";
import { motionDelay } from "@/lib/utils";
import type { BoardVacancy } from "@/lib/founding";
import type { ListedTemplate } from "@/lib/types";

export function LandingHero({
  founding = false,
  heading = true,
  children,
}: {
  founding?: boolean;
  heading?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="relative isolate">
      <div className="relative z-10">
        <div className="relative sm:grid sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-start sm:gap-5 md:grid-cols-[minmax(0,1fr)_9rem] md:items-center md:gap-8 lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-10">
          <div className="min-w-0">
            <div className="max-sm:flex max-sm:min-h-[4.75rem] max-sm:items-center max-sm:pr-[5.25rem]">
              <HeroWordmark as={heading ? "h1" : "p"} />
            </div>
            <LockTitle
              as="p"
              display="section"
              delay={8}
              className="mt-3 max-w-2xl text-balance sm:mt-4"
            >
              A ranked board of public Grok Bots.
            </LockTitle>
            <div
              className="motion-enter mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row"
              style={motionDelay(16)}
            >
              {founding ? (
                <>
                  <Button nativeButton={false} render={<Link href="/upload" />}>
                    Share a bot
                  </Button>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/templates" />}
                  >
                    Browse bots
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    nativeButton={false}
                    render={<Link href="/templates" />}
                  >
                    Browse bots
                  </Button>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/upload" />}
                  >
                    Share a bot
                  </Button>
                </>
              )}
            </div>
          </div>
          <div
            className="motion-enter absolute top-0 right-0 w-[4.75rem] sm:relative sm:top-auto sm:right-auto sm:mt-2 sm:w-full md:mt-0"
            style={motionDelay(2)}
          >
            <div className="relative">
              <span className="grok-bot-rim" aria-hidden="true" />
              <GrokBot />
            </div>
          </div>
        </div>
        <div
          className="motion-enter mt-5 border-y border-border py-3 sm:mt-6 sm:py-3.5"
          style={motionDelay(18)}
        >
          <BotListPaste compact />
        </div>
        {children}
      </div>
    </section>
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
    <div className="mt-5 sm:mt-6">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <p className="inline-flex min-w-0 items-baseline gap-x-2 overflow-hidden font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
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
          ) : null}
        </p>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          className="shrink-0"
          render={<Link href="/templates" aria-label="Open the board" />}
        >
          <span className="sm:hidden">Board</span>
          <span className="hidden sm:inline">Open the board</span>
          <span aria-hidden="true">→</span>
        </Button>
      </div>
      <div
        className="motion-board overflow-hidden rounded-lg border border-border bg-card"
        style={motionDelay(18)}
      >
        {featured.length > 0 ? (
          <div className="border-b border-border">
            <p className="px-3 pt-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:px-5">
              Featured
            </p>
            <BotRankList
              templates={featured}
              showVote
              scramble
              surface="roster"
              delay={18}
            />
          </div>
        ) : null}
        {empty ? (
          <div className="empty-scan relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 overflow-hidden px-4 py-10 sm:px-5 sm:py-12">
            <span className="pt-1 font-mono text-xs tabular-nums tracking-wide text-muted-foreground">
              01
            </span>
            <div className="min-w-0">
              <p className="text-xl leading-tight font-normal tracking-tight sm:text-2xl">
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
                Share a bot
              </Button>
            </div>
          </div>
        ) : (
          <BotRankList
            templates={ranked}
            showVote
            scramble
            leader
            surface="roster"
            vacancies={vacancies}
            delay={18}
          />
        )}
      </div>
    </div>
  );
}

export function LandingBoardSkeleton() {
  return (
    <div className="mt-5 sm:mt-6">
      <div className="mb-3 flex h-8 items-center justify-between sm:mb-4">
        <div className="h-3 w-36 animate-pulse bg-canvas-soft" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-canvas-soft" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {Array.from({ length: 6 }).map((_, index) => (
          <BotRankRowSkeleton key={index} surface="roster" />
        ))}
      </div>
    </div>
  );
}
