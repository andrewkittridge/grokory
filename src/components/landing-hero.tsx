import Link from "next/link";
import { BotRankRow, VacantRankRow } from "@/components/bot-rank-row";
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
  const botLabel = count === 1 ? "1 bot" : `${count} bots`;

  return (
    <section>
      <div className="motion-enter" style={motionDelay(0)}>
        <p className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase">
          <span className="live-dot" aria-hidden="true" />
          Ranked Grok Bot catalog
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl leading-[1.05] font-normal tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
          Ready-made Grok Bots you can add.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          Grok Bots are custom agents on x.ai. Grokdex ranks the public ones.
          Upvote the useful ones, then Add — it copies the template onto your
          Grok account, not the author’s computer.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
      </div>

      <div className="motion-enter mt-12 sm:mt-16" style={motionDelay(1)}>
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
              <span>{botLabel}</span>
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
              <span className="pt-1 font-mono text-xs tabular-nums tracking-wide text-muted-foreground">
                01
              </span>
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
                <li key={template.id}>
                  <BotRankRow
                    rank={index + 1}
                    template={template}
                    size={index === 0 ? "leader" : "default"}
                    detail="job"
                  />
                </li>
              ))}
              <li>
                <VacantRankRow rank={ranked.length + 1} />
              </li>
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
