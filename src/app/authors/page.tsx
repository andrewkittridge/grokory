import Link from "next/link";
import { BotIdentityThumb } from "@/components/bot-identity";
import { EmptyState } from "@/components/empty-state";
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
        <div className="mt-10">
          <EmptyState
            title="Nobody listed yet"
            body="Paste a public share link and you show up here with the bot."
            actionHref="/upload"
            actionLabel="Share a bot"
          />
        </div>
      ) : (
        <ol className="mt-10 space-y-3">
          {authors.map((author, index) => (
            <li
              key={author.slug}
              className="author-kennel motion-enter border-b border-border py-6 first:border-t sm:py-7"
              style={motionDelay(3 + index)}
            >
              <div className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/authors/${encodeURIComponent(author.slug)}`}
                  className="min-w-0 truncate font-heading text-xl tracking-tight hover:underline focus-visible:ring-1 focus-visible:ring-foreground sm:text-[1.35rem]"
                >
                  {author.name}
                </Link>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {author.count === 1 ? "1 bot" : `${author.count} bots`}
                </span>
              </div>
              {author.handles.some(
                (handle) => xHandleLabel(handle) !== author.name
              ) ? (
                <p className="mt-1 truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  {author.handles
                    .filter((handle) => xHandleLabel(handle) !== author.name)
                    .map((handle) => xHandleLabel(handle))
                    .join(" · ")}
                </p>
              ) : null}
              <div className="author-kennel-cast">
                {author.templates.slice(0, 8).map((template) => (
                  <Link
                    key={template.slug}
                    href={`/templates/${template.slug}`}
                    className="author-kennel-bot"
                    aria-label={template.title}
                  >
                    <BotIdentityThumb mark={template.mark} size="lg" />
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
