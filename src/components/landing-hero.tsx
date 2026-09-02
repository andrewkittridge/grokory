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
  children,
}: {
  founding?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="relative isolate">
      <div className="relative z-10">
        <div className="relative sm:grid sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-start sm:gap-6 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center md:gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            <div className="max-sm:pr-[7.6rem]">
              <HeroWordmark />
              <LockTitle
                as="p"
                display="section"
                delay={8}
                className="mt-5 max-w-3xl text-balance"
              >
                A ranked board of public Grok Bots.
              </LockTitle>
            </div>
            <p
              className="motion-enter mt-6 max-w-xl text-base leading-7 text-body sm:text-lg sm:leading-8"
              style={motionDelay(14)}
            >
              List a public share link — it shows up immediately. Add copies
              the template onto your Grok account.
            </p>
            <div
              className="motion-enter mt-8 flex flex-col gap-3 sm:flex-row"
              style={motionDelay(16)}
            >
              {founding ? (
                <>
                  <Button
                    size="lg"
                    nativeButton={false}
                    render={<Link href="/upload" />}
                  >
                    Share a bot
                  </Button>
                  <Button
                    size="lg"
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
                </>
              )}
            </div>
          </div>
          <div
            className="motion-enter absolute top-0 right-0 w-[7rem] sm:relative sm:top-auto sm:right-auto sm:mt-6 sm:w-full md:mt-0"
            style={motionDelay(2)}
          >
            <div className="relative">
              <span className="grok-bot-rim" aria-hidden="true" />
              <GrokBot />
            </div>
          </div>
        </div>
        <div
          className="motion-enter mt-8 border-y border-border py-4 sm:mt-10"
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
    <div className="mt-8 sm:mt-10">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <p className="inline-flex min-w-0 items-baseline gap-x-2.5 overflow-hidden font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          <span className="inline-flex items-center gap-2 text-foreground">
            <span className="live-dot" aria-hidden="true" />
            {founding ? (
              `${count} listed`
            ) : (
              <CountTick value={count} singular="bot" plural="bots" />
            )}
          </span>
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <span className="truncate">
            {founding ? "seats open" : "Hot"}
          </span>
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
    <div className="mt-10 sm:mt-12">
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
