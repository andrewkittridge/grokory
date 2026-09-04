import Link from "next/link";
import { GrokBot } from "@/components/grok-bot";
import { LockTitle } from "@/components/lock-title";
import { Button } from "@/components/ui/button";
import { motionDelay } from "@/lib/utils";

export function LockLost({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-24 text-center">
      <div
        className="motion-enter relative mx-auto w-[7.5rem]"
        style={motionDelay(0)}
      >
        <GrokBot className="is-ghost" />
      </div>
      <p
        className="motion-enter mt-6 font-mono text-sm tracking-[0.18em] text-muted-foreground"
        style={motionDelay(1)}
      >
        Not found
      </p>
      <LockTitle delay={2} className="mt-4">
        {title}
      </LockTitle>
      <p
        className="motion-enter mt-4 text-muted-foreground"
        style={motionDelay(3)}
      >
        {body}
      </p>
      <div
        className="motion-enter mt-8 flex flex-wrap justify-center gap-3"
        style={motionDelay(4)}
      >
        <Button nativeButton={false} render={<Link href="/templates" />}>
          Browse bots
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/upload" />}
        >
          Share a bot
        </Button>
      </div>
    </main>
  );
}
