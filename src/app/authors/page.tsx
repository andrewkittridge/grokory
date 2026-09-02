import type { Metadata } from "next";
import Link from "next/link";
import { CountTick } from "@/components/telemetry";
import { LockTitle } from "@/components/lock-title";
import { xHandleLabel } from "@/lib/bot-url";
import { authorIndex } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import { motionDelay } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Authors",
  description: "People with a public Grok Bot listed on Grokdex.",
  alternates: { canonical: "/authors" },
};

export default async function AuthorsPage() {
  const authors = authorIndex(await listTemplates());

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <p
        className="motion-enter font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
        style={motionDelay(0)}
      >
        Authors
      </p>
      <LockTitle delay={1} className="mt-4">
        Authors
      </LockTitle>
      <p
        className="motion-enter mt-4 max-w-2xl text-sm leading-7 text-body"
        style={motionDelay(2)}
      >
        <CountTick
          value={authors.length}
          singular="person"
          plural="people"
        />{" "}
        with a public Grok Bot on the board.
      </p>
      {authors.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          Nobody listed yet.{" "}
          <Link href="/upload" className="text-foreground hover:underline">
            Share a bot
          </Link>
          .
        </p>
      ) : (
        <ol className="mt-10 divide-y divide-border border-y border-border">
          {authors.map((author, index) => (
            <li key={author.slug}>
              <Link
                href={`/authors/${encodeURIComponent(author.slug)}`}
                className="flex items-baseline justify-between gap-4 px-2 py-3 hover:bg-canvas-soft focus-visible:ring-1 focus-visible:ring-foreground sm:px-0"
                style={motionDelay(3 + index)}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px] tracking-tight">
                    {author.name}
                  </span>
                  {author.handles.length > 0 ? (
                    <span className="mt-0.5 block truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                      {author.handles.map((handle) => xHandleLabel(handle)).join(" · ")}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {author.count === 1 ? "1 bot" : `${author.count} bots`}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
