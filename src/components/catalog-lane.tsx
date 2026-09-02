import type { CSSProperties } from "react";
import Link from "next/link";
import { CatalogBot } from "@/components/catalog-bot";
import { categoryAnchor, type CatalogToken } from "@/lib/templates";
import type { Category } from "@/lib/types";
import { cn, motionDelay } from "@/lib/utils";

const DURATIONS = [36, 46, 40, 52, 38, 48, 42, 50, 44];

export function CatalogLane({
  category,
  tokens,
  index,
}: {
  category: Category;
  tokens: CatalogToken[];
  index: number;
}) {
  const listed = tokens.filter((token) => token.kind === "listed").length;
  const reverse = index % 2 === 1;
  const duration = `${DURATIONS[index % DURATIONS.length]}s`;
  const anchor = categoryAnchor(category);

  return (
    <section
      id={anchor}
      className="catalog-lane motion-enter border-t border-border py-5 sm:py-6"
      style={motionDelay(Math.min(index + 2, 12))}
      aria-labelledby={`${anchor}-label`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between gap-3 px-4 sm:px-6">
        <h2
          id={`${anchor}-label`}
          className="font-mono text-[11px] tracking-[0.22em] text-foreground uppercase"
        >
          {category}
        </h2>
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {listed > 0 ? (
            <>
              {listed === 1 ? "1 bot" : `${listed} bots`}
              <span aria-hidden="true"> · </span>
              <Link
                href={`/templates?category=${encodeURIComponent(category)}`}
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
                href={`/upload?category=${encodeURIComponent(category)}`}
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
          <CatalogLaneSet tokens={tokens} />
          <CatalogLaneSet tokens={tokens} clone />
        </div>
      </div>
    </section>
  );
}

function CatalogLaneSet({
  tokens,
  clone = false,
}: {
  tokens: CatalogToken[];
  clone?: boolean;
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
        />
      ))}
    </div>
  );
}
