import Link from "next/link";
import { BotRankRow, VacantRankRow } from "@/components/bot-rank-row";
import { HeroField } from "@/components/hero-field";
import { CountTick, MissionClock, RankTick } from "@/components/telemetry";
import { Button } from "@/components/ui/button";
import { motionDelay } from "@/lib/utils";
import type { ListedTemplate } from "@/lib/types";

export function LandingHero({
  ranked,
  count,
}: {
  ranked: ListedTemplate[];
  count: number;
}) {
  const empty = count === 0;

  return (
    <section className="relative isolate">
      <HeroField />
      <div className="relative z-10">
        <p
          className="motion-enter inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
          style={motionDelay(0)}
        >
          <span className="inline-flex items-center gap-2.5">
            <span className="live-dot" aria-hidden="true" />
            Ranked Grok Bot catalog
          </span>
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <MissionClock />
        </p>
        <h1
          className="motion-lock mt-5 max-w-4xl overflow-hidden text-4xl leading-[1.05] font-normal tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl"
          style={motionDelay(1)}
        >
          Ready-made Grok Bots you can add.
          <span className="motion-lock-scan" aria-hidden="true" />
        </h1>
        <p
          className="motion-enter mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg"
          style={motionDelay(2)}
        >
          Grok Bots are custom agents on x.ai. Grokdex ranks the public ones.
          Upvote the useful ones, then Add — it copies the template onto your
          Grok account, not the author’s computer.
        </p>
        <div
          className="motion-enter mt-8 flex flex-col gap-3 sm:flex-row"
          style={motionDelay(3)}
        >
          {empty ? (
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

        <div className="motion-board mt-10 sm:mt-12" style={motionDelay(4)}>
          <div className="border border-border bg-card">
            <div className="flex flex-row items-baseline justify-between gap-3 border-b border-border px-4 py-3">
              <p className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                <span className="inline-flex items-center gap-2">
                  <span className="live-dot" aria-hidden="true" />
                  Live
                </span>
                <span className="text-border" aria-hidden="true">
                  ·
                </span>
                <CountTick value={count} singular="bot" plural="bots" />
              </p>
              <Link
                href="/templates"
                className="shrink-0 font-mono text-[10px] tracking-wide text-muted-foreground uppercase sm:text-[11px] hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
              >
                Open the full board
              </Link>
            </div>
            {empty ? (
              <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 px-4 py-8 sm:px-5 sm:py-10">
                <RankTick
                  rank={1}
                  className="pt-1 text-muted-foreground"
                />
                <div className="min-w-0">
                  <p className="text-lg leading-tight font-normal tracking-tight sm:text-xl">
                    The board is open.
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
              <ol className="divide-y divide-border">
                {ranked.map((template, index) => (
                  <li
                    key={template.id}
                    className="motion-row"
                    style={motionDelay(5 + index)}
                  >
                    <BotRankRow
                      rank={index + 1}
                      template={template}
                      size={index === 0 ? "leader" : "default"}
                      detail="job"
                      scramble
                    />
                  </li>
                ))}
                <li
                  className="motion-row"
                  style={motionDelay(5 + ranked.length)}
                >
                  <VacantRankRow rank={ranked.length + 1} scramble />
                </li>
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
