import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motionDelay } from "@/lib/utils";

export function LandingCta() {
  return (
    <section
      className="motion-enter border-y border-border"
      style={motionDelay(8)}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-12">
        <div className="max-w-xl">
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
            Next listing
          </p>
          <h2 className="mt-3 text-3xl font-normal tracking-tight">
            Share a Grok Bot.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Paste a public share link. It lands on the board for everyone else.
            No account.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
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
    </section>
  );
}
