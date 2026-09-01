import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCta({ founding = false }: { founding?: boolean }) {
  return (
    <section className="motion-view relative border-y border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-20">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
            <span className="live-dot" aria-hidden="true" />
            {founding ? "Just opened" : "Share"}
          </p>
          <h2 className="display-section mt-3">Share a Grok Bot.</h2>
          <p className="mt-2 text-sm leading-6 text-body">
            {founding
              ? "The board is new. Paste a public share link and it lists immediately. No account."
              : "Paste a public share link. It shows up on the board. No account."}
          </p>
        </div>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/upload" />}
        >
          Share a bot
        </Button>
      </div>
    </section>
  );
}
