import type { CSSProperties } from "react";
import Link from "next/link";
import { CatalogBot } from "@/components/catalog-bot";
import type { CatalogToken } from "@/lib/templates";
import { cn, motionDelay } from "@/lib/utils";

const DURATIONS = [36, 46, 40, 52, 38, 48, 42, 50, 44];

export function CatalogLane({
  id,
  tokens,
  index,
  query = "",
}: {
  id: string;
  tokens: CatalogToken[];
  index: number;
  query?: string;
}) {
  const listed = tokens.filter((token) => token.kind === "listed").length;
  const reverse = index % 2 === 1;
  const duration = `${DURATIONS[index % DURATIONS.length]}s`;

  return (
    <section
      id={id}
      className="catalog-lane motion-enter border-t border-border py-5 sm:py-6"
      style={motionDelay(Math.min(index + 2, 12))}
    >
      <div className="mx-auto flex w-full max-w-6xl items-baseline justify-end gap-3 px-4 sm:px-6">
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {listed > 0 ? (
            <>
              {listed === 1 ? "1 bot" : `${listed} bots`}
              <span aria-hidden="true"> · </span>
              <Link
                href="/templates"
                className="hover:text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
              >
                Board
              </Link>
            </>
          ) : (
            <>
              Open
              <span aria-hidden="true"> · </span>
              <Link
                href="/upload"
                className="text-sunset hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
              >
                Share
              </Link>
            </>
          )}
        </p>
      </div>
      <div className="catalog-lane-mask mt-3">
        <div
          className="catalog-lane-track"
          style={
            {
              "--catalog-duration": duration,
              "--catalog-dir": reverse ? "reverse" : "normal",
            } as CSSProperties
          }
        >
          <CatalogLaneSet tokens={tokens} query={query} />
          <CatalogLaneSet tokens={tokens} query={query} clone />
        </div>
      </div>
    </section>
  );
}

function CatalogLaneSet({
  tokens,
  clone = false,
  query = "",
}: {
  tokens: CatalogToken[];
  clone?: boolean;
  query?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-end gap-1 pr-1 sm:gap-2 sm:pr-2",
        clone && "catalog-lane-clone"
      )}
      aria-hidden={clone || undefined}
    >
      {tokens.map((token, tokenIndex) => (
        <CatalogBot
          key={`${token.key}-${clone ? "b" : "a"}`}
          token={token}
          index={tokenIndex}
          clone={clone}
          query={query}
        />
      ))}
    </div>
  );
}
