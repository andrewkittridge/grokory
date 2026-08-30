import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motionDelay } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-24 text-center">
      <p
        className="motion-enter font-mono text-sm tracking-[0.18em] text-muted-foreground"
        style={motionDelay(0)}
      >
        404
      </p>
      <h1
        className="motion-enter mt-4 text-4xl font-normal tracking-tight"
        style={motionDelay(1)}
      >
        That bot is not in the library.
      </h1>
      <p
        className="motion-enter mt-4 text-muted-foreground"
        style={motionDelay(2)}
      >
        The listing may have been removed, or the link is wrong.
      </p>
      <div
        className="motion-enter mt-8 flex justify-center gap-3"
        style={motionDelay(3)}
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
