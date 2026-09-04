"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import Link from "next/link";
import { BoostedMark, FeaturedMark } from "@/components/feature-cta";
import { GrokBotIdentityMark, GrokBotMark, hopGrokBot } from "@/components/grok-bot";
import {
  addHandleHref,
  xHandleLabel,
  xHandleUrl,
} from "@/lib/bot-url";
import { usePrefersReducedMotion } from "@/lib/motion";
import {
  catalogTokenMatches,
  type CatalogToken,
} from "@/lib/templates";
import { cn } from "@/lib/utils";

export function CatalogBot({
  token,
  index,
  clone = false,
  query = "",
}: {
  token: CatalogToken;
  index: number;
  clone?: boolean;
  query?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const botRef = useRef<HTMLSpanElement>(null);
  const featured = token.kind === "listed" && token.featured;
  const searching = query.trim().length > 0;
  const hit = catalogTokenMatches(token, query);
  const inert = clone || (searching && !hit);
  const href =
    token.kind === "listed"
      ? `/templates/${token.template.slug}`
      : token.vacancy.href;
  const heading =
    token.kind === "listed" ? token.template.title : token.vacancy.label;
  const summary =
    token.kind === "listed"
      ? token.template.summary
      : (token.vacancy.hint ?? "Paste a public share link");
  const handle =
    token.kind === "listed" && token.template.xHandle
      ? xHandleLabel(token.template.xHandle)
      : "";
  const label =
    token.kind === "listed"
      ? `${token.template.title}${handle ? ` by ${handle}` : ""}. ${token.template.summary}`
      : summary;

  return (
    <div
      data-catalog-token=""
      data-catalog-hit={searching ? (hit ? "true" : "false") : undefined}
      aria-hidden={clone || undefined}
      className={cn(
        "catalog-bot group/bot relative flex w-[8.25rem] shrink-0 flex-col items-center px-1 py-2 sm:w-[9.25rem]",
        featured && "w-[9.5rem] sm:w-[10.5rem]",
        searching && hit && "is-hit",
        searching && !hit && "is-miss"
      )}
      onPointerDown={() => hopGrokBot(botRef.current, reduced)}
      onAnimationEnd={(event) => {
        if (event.animationName === "bot-hop") {
          botRef.current?.classList.remove("grok-bot-hopping");
        }
      }}
    >
      <Link
        href={href}
        tabIndex={inert ? -1 : undefined}
        aria-hidden={inert || undefined}
        aria-label={inert ? undefined : label}
        className="flex w-full flex-col items-center focus-visible:ring-1 focus-visible:ring-foreground"
      >
        <span className="relative flex min-h-[7.5rem] w-full items-end justify-center sm:min-h-[8.5rem]">
          {featured ? <span className="grok-bot-rim" aria-hidden="true" /> : null}
          <span
            ref={botRef}
            className={cn(
              "grok-bot catalog-bot-figure relative block",
              featured
                ? "w-[6.6rem] sm:w-[7.4rem]"
                : "w-[5.6rem] sm:w-[6.4rem]",
              token.kind === "open" && "is-ghost",
              token.kind === "listed" && token.template.mark && "is-identity"
            )}
            style={
              {
                "--bob-delay": `${(index % 5) * 0.35}s`,
                "--blink-delay": `${1.05 + (index % 7) * 0.41}s`,
                "--wake-delay": `${0.06 + (index % 4) * 0.08}s`,
              } as CSSProperties
            }
          >
            {token.kind === "listed" && token.template.mark ? (
              <GrokBotIdentityMark mark={token.template.mark} />
            ) : (
              <GrokBotMark />
            )}
          </span>
        </span>
        <span className="mt-1 flex min-w-0 flex-col items-center text-center">
          {token.kind === "listed" && token.featured ? (
            <FeaturedMark className="mb-0.5" />
          ) : token.kind === "listed" && token.boosted ? (
            <BoostedMark className="mb-0.5" />
          ) : token.kind === "open" ? (
            <span className="mb-0.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              Open seat
            </span>
          ) : null}
          <span className="catalog-bot-name w-full truncate text-[13px] leading-tight tracking-tight">
            {heading}
          </span>
        </span>
      </Link>
      {token.kind === "listed" ? (
        token.template.xHandle ? (
          <a
            href={xHandleUrl(token.template.xHandle)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={inert ? -1 : undefined}
            title={xHandleLabel(token.template.xHandle)}
            className="catalog-bot-handle relative z-10 mt-0.5 w-full truncate text-center font-mono text-[11px] leading-4 text-body hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
          >
            {xHandleLabel(token.template.xHandle)}
          </a>
        ) : (
          <Link
            href={addHandleHref(token.template.botUrl)}
            tabIndex={inert ? -1 : undefined}
            className="catalog-bot-handle relative z-10 mt-0.5 w-full truncate text-center font-mono text-[11px] leading-4 text-muted-foreground hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
          >
            add @handle
          </Link>
        )
      ) : (
        <span
          className="catalog-bot-handle mt-0.5 w-full text-[11px] leading-4"
          aria-hidden="true"
        >
          &nbsp;
        </span>
      )}
      <span className="catalog-bot-summary mt-0.5 w-full text-center text-[11px] leading-4 text-muted-foreground">
        {summary}
      </span>
    </div>
  );
}
