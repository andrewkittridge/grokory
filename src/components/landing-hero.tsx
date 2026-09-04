import type { ReactNode } from "react";
import Link from "next/link";
import { BotIdentityThumb } from "@/components/bot-identity";
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
        <div className="mt-1">
          <HeroWordmark as={heading ? "h1" : "p"} />
        </div>
        <p
          className="promise-serif motion-enter mt-4 max-w-2xl text-[1.65rem] leading-snug tracking-tight text-foreground sm:mt-5 sm:text-[2.15rem]"
          style={motionDelay(8)}
        >
          The ranked board of public Grok Bots.
        </p>
        <p
          className="motion-enter mt-3 max-w-xl text-sm leading-6 text-body sm:text-[15px]"
          style={motionDelay(10)}
        >
          Identity from x.ai. Votes on this board. Add copies the template
          onto your Grok account.
        </p>
        {lead}
        <div
          className="motion-enter mt-7 flex flex-row flex-wrap gap-2"
          style={motionDelay(14)}
        >
          {founding ? (
            <>
              <Button
                className="min-w-0 flex-1 sm:flex-none"
                nativeButton={false}
                render={<Link href="/upload" />}
              >
                Share a bot
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
                Share a bot
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
    <div className="live-cast motion-enter" style={motionDelay(17)}>
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
        <span aria-hidden="true">→</span>
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
          ) : (
            <>
              <span className="text-border" aria-hidden="true">
                ·
              </span>
              <span className="truncate">Hot</span>
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
          <span className="sm:hidden">Board</span>
          <span className="hidden sm:inline">Full board</span>
          <span aria-hidden="true">→</span>
        </Button>
      </div>
      <div className="motion-board border-y border-border" style={motionDelay(18)}>
        {featured.length > 0 ? (
          <div className="border-b border-border">
            <p className="px-3 pt-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:px-5">
              Featured
            </p>
            <BotRankList
              templates={featured}
              showVote
              surface="roster"
              delay={18}
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
                Share a bot
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
            delay={18}
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
