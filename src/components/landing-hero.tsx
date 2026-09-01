import type { ReactNode } from "react";
import Link from "next/link";
import {
  BotRankList,
  BotRankRowSkeleton,
} from "@/components/bot-rank-row";
import { GrokBot } from "@/components/grok-bot";
import { LockTitle } from "@/components/lock-title";
import { CountTick } from "@/components/telemetry";
import { Button } from "@/components/ui/button";
import { motionDelay } from "@/lib/utils";
import type { ListedTemplate } from "@/lib/types";

export function LandingHero({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate">
      <div className="relative z-10">
        <div className="relative sm:grid sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-start sm:gap-6 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center md:gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            <div className="max-sm:pr-[7.6rem]">
              <p
                className="motion-enter inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
                style={motionDelay(0)}
              >
                <span className="inline-flex items-center gap-2.5">
                  <span className="live-dot" aria-hidden="true" />
                  Public Grok Bots
                </span>
              </p>
              <LockTitle
                display="hero"
                delay={1}
                className="mt-6 max-w-4xl text-balance"
              >
                A ranked board of public Grok Bots.
              </LockTitle>
            </div>
            <p
              className="motion-enter mt-6 max-w-xl text-base leading-7 text-body sm:text-lg sm:leading-8"
              style={motionDelay(2)}
            >
              Grok Bots are custom agents on x.ai. Grokdex ranks the public
              ones. Upvote the useful ones, then Add — it copies the template
              onto your Grok account, not the author’s computer.
            </p>
            <div
              className="motion-enter mt-8 flex flex-col gap-3 sm:flex-row"
              style={motionDelay(3)}
            >
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/templates" />}
              >
                Browse bots
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/upload" />}
              >
                Share a bot
              </Button>
            </div>
          </div>
          <div
            className="motion-enter absolute top-5 right-0 w-[7rem] sm:relative sm:top-auto sm:right-auto sm:mt-6 sm:w-full md:mt-0"
            style={motionDelay(1)}
          >
            <div className="relative">
              <span className="grok-bot-rim" aria-hidden="true" />
              <GrokBot />
            </div>
          </div>
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
}: {
  ranked: ListedTemplate[];
  featured?: ListedTemplate[];
  count: number;
}) {
  const empty = count === 0;

  return (
    <div className="motion-board mt-10 sm:mt-12" style={motionDelay(4)}>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border px-4 py-3">
          <p className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            <span className="inline-flex items-center gap-2">
              <span className="live-dot" aria-hidden="true" />
              <CountTick value={count} singular="bot" plural="bots" />
            </span>
            <span className="text-border" aria-hidden="true">
              ·
            </span>
            <span>Hot</span>
          </p>
          <Link
            href="/templates"
            className="shrink-0 font-mono text-[10px] tracking-wide text-muted-foreground uppercase sm:text-[11px] hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
          >
            <span className="sm:hidden">Board</span>
            <span className="hidden sm:inline">Open the full board</span>
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="border-b border-border">
            <p className="px-4 pt-3 font-mono text-[10px] tracking-[0.2em] text-sunset uppercase">
              Featured
            </p>
            <BotRankList templates={featured} showVote scramble delay={5} />
          </div>
        ) : null}
        {empty ? (
          <div className="empty-scan relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 overflow-hidden px-4 py-8 sm:px-5 sm:py-10">
            <span className="pt-1 font-mono text-xs tabular-nums tracking-wide text-muted-foreground">
              01
            </span>
            <div className="min-w-0">
              <p className="text-lg leading-tight font-normal tracking-tight sm:text-xl">
                No bots listed yet.
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Paste a public share link to list the first Grok Bot.
              </p>
              <Button
                className="mt-5"
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
            vacant
            delay={5}
          />
        )}
      </div>
    </div>
  );
}

export function LandingBoardSkeleton() {
  return (
    <div className="mt-10 overflow-hidden rounded-lg border border-border bg-card sm:mt-12">
      <div className="flex h-11 items-center border-b border-border px-4">
        <div className="h-3 w-28 animate-pulse bg-canvas-soft" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <BotRankRowSkeleton key={index} />
      ))}
    </div>
  );
}
