import Link from "next/link";
import { BotIdentityThumb } from "@/components/bot-identity";
import { CountTick } from "@/components/telemetry";
import { LockTitle } from "@/components/lock-title";
import { xHandleLabel } from "@/lib/bot-url";
import { pageMetadata } from "@/lib/site";
import { authorIndex } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import { motionDelay } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Authors",
  description: "People with a public Grok Bot listed on Grokdex.",
  path: "/authors",
});

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
        <ol className="board-panel mt-10 divide-y divide-border">
          {authors.map((author, index) => (
            <li key={author.slug}>
              <Link
                href={`/authors/${encodeURIComponent(author.slug)}`}
                className="flex items-center justify-between gap-4 px-3 py-3.5 hover:bg-canvas-soft focus-visible:ring-1 focus-visible:ring-foreground sm:px-5"
                style={motionDelay(3 + index)}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <BotIdentityThumb mark={author.mark} />
                  <span className="min-w-0">
                    <span className="block truncate font-heading text-[1.05rem] tracking-tight">
                      {author.name}
                    </span>
                    {author.handles.some(
                      (handle) => xHandleLabel(handle) !== author.name
                    ) ? (
                      <span className="mt-0.5 block truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                        {author.handles
                          .filter((handle) => xHandleLabel(handle) !== author.name)
                          .map((handle) => xHandleLabel(handle))
                          .join(" · ")}
                      </span>
                    ) : null}
                  </span>
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
