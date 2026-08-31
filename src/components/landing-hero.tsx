import Link from "next/link";
import { BotRankRow } from "@/components/bot-rank-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { motionDelay } from "@/lib/utils";
import type { ListedTemplate } from "@/lib/types";

export function LandingHero({ ranked }: { ranked: ListedTemplate[] }) {
  return (
    <section className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:gap-16">
      <div className="motion-enter" style={motionDelay(0)}>
        <p className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase">
          <span className="live-dot" aria-hidden="true" />
          Ranked Grok Bot catalog
        </p>
        <h1 className="mt-5 text-4xl leading-[1.05] font-normal tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Ready-made Grok Bots you can add.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          Grok Bots are custom agents on x.ai. Grokdex ranks the public ones.
          Upvote the useful ones, then Add — it copies the template onto your
          Grok account, not the author’s computer.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

      <div className="motion-enter" style={motionDelay(1)}>
        <Card className="gap-0 rounded-md bg-card/80 py-0 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-baseline justify-between gap-3 border-b border-border px-5 py-4">
            <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              <span className="live-dot" aria-hidden="true" />
              Live ranking
            </p>
            <Link
              href="/templates"
              className="shrink-0 font-mono text-[10px] tracking-wide text-muted-foreground uppercase sm:text-[11px] hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Open the full board
            </Link>
          </CardHeader>
          <CardContent className="px-2 py-1.5">
            {ranked.length === 0 ? (
              <div className="px-3 py-6">
                <p className="text-sm text-muted-foreground">No bots listed yet.</p>
                <Link
                  href="/upload"
                  className="mt-2 inline-block text-sm text-foreground hover:underline"
                >
                  Share a bot
                </Link>
              </div>
            ) : (
              <ol className="divide-y divide-border">
                {ranked.map((template, index) => (
                  <li key={template.id}>
                    <BotRankRow rank={index + 1} template={template} />
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
