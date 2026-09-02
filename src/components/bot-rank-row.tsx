import type { CSSProperties } from "react";
import Link from "next/link";
import { RankTick } from "@/components/telemetry";
import { VoteButtons } from "@/components/vote-buttons";
import { BoostedMark, FeaturedMark } from "@/components/feature-cta";
import { OpenSlots } from "@/components/open-slots";
import { ShareListing } from "@/components/share-listing";
import {
  addHandleHref,
  formatAdds,
  xHandleLabel,
  xHandleUrl,
} from "@/lib/bot-url";
import { isBoostedActive } from "@/lib/boost";
import { isFeaturedActive } from "@/lib/featured";
import { absUrl } from "@/lib/site";
import { cn, motionDelay } from "@/lib/utils";
import type { BoardVacancy } from "@/lib/founding";
import type { ListedTemplate } from "@/lib/types";

export function BotRankRow({
  rank,
  template,
  showVote = false,
  size = "default",
  scramble = false,
  scoreMax,
  surface = "board",
}: {
  rank: number;
  template: ListedTemplate;
  showVote?: boolean;
  size?: "default" | "leader";
  scramble?: boolean;
  scoreMax?: number;
  surface?: "board" | "roster";
}) {
  const points =
    template.score === 1 ? "1 pt" : `${template.score} pts`;
  const leader = size === "leader";
  const roster = surface === "roster";
  const spark =
    scoreMax && scoreMax > 0
      ? Math.max(0, Math.min(1, template.score / scoreMax))
      : 0;
  const rowPad = leader
    ? roster
      ? "items-start px-3 py-5 sm:px-5 sm:py-6"
      : "items-start px-3 py-4 sm:px-4 sm:py-5"
    : roster
      ? "items-center px-3 py-3.5 sm:px-5 sm:py-4"
      : "items-center px-2 py-2.5";

  return (
    <div
      className={cn(
        "rank-row relative hover:bg-canvas-soft",
        roster
          ? "flex gap-x-2 sm:gap-x-3"
          : "grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-x-3",
        leader && "rank-row-leader",
        roster && "rank-row-roster",
        rowPad
      )}
    >
      {spark > 0 ? (
        <span
          className="rank-spark"
          style={{ "--spark": spark } as CSSProperties}
          aria-hidden="true"
        />
      ) : null}
      <Link
        href={`/templates/${template.slug}`}
        className="absolute inset-0 z-0 focus-visible:ring-1 focus-visible:ring-foreground"
        aria-label={template.title}
      />
      {scramble ? (
        <RankTick
          rank={rank}
          className={cn(
            "relative z-10 shrink-0",
            roster && "w-8",
            leader ? "pt-1" : undefined,
            rank === 1 ? "text-sunset" : "text-muted-foreground"
          )}
        />
      ) : (
        <span
          className={cn(
            "relative z-10 shrink-0 font-mono text-xs tabular-nums tracking-wide",
            roster && "w-8",
            leader ? "pt-1" : undefined,
            rank === 1 ? "text-sunset" : "text-muted-foreground"
          )}
        >
          {String(rank).padStart(2, "0")}
        </span>
      )}
      <span className="relative z-10 min-w-0 flex-1 overflow-hidden pointer-events-none">
        <span
          className={cn(
            "font-normal tracking-tight",
            leader
              ? roster
                ? "line-clamp-2 text-xl leading-tight sm:text-2xl"
                : "line-clamp-2 text-lg leading-tight sm:text-xl"
              : "block truncate text-[15px] leading-tight"
          )}
        >
          {template.title}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          {isFeaturedActive(template) ? (
            <FeaturedMark />
          ) : isBoostedActive(template) ? (
            <BoostedMark />
          ) : null}
          {template.xHandle ? (
            <>
              {isFeaturedActive(template) || isBoostedActive(template) ? (
                <span aria-hidden="true"> · </span>
              ) : null}
              <a
                href={xHandleUrl(template.xHandle)}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 pointer-events-auto hover:text-foreground"
              >
                {xHandleLabel(template.xHandle)}
              </a>
            </>
          ) : (
            <>
              {isFeaturedActive(template) || isBoostedActive(template) ? (
                <span aria-hidden="true"> · </span>
              ) : null}
              <Link
                href={addHandleHref(template.botUrl)}
                className="relative z-10 pointer-events-auto normal-case tracking-normal hover:text-foreground"
              >
                add @handle
              </Link>
            </>
          )}
          <span aria-hidden="true"> · </span>
          {formatAdds(template.adds)}
        </span>
        <span
          className={cn(
            "block",
            leader
              ? cn(
                  "mt-1.5 line-clamp-2 text-sm leading-6 sm:mt-2",
                  roster ? "max-w-2xl text-body" : "text-muted-foreground"
                )
              : "mt-0.5 line-clamp-1 text-xs text-muted-foreground"
          )}
        >
          {template.summary}
        </span>
      </span>
      <span
        className={cn(
          "relative z-10 flex shrink-0 items-center gap-1.5",
          leader ? "pt-1" : undefined
        )}
      >
        <ShareListing
          title={template.title}
          listingUrl={absUrl(`/templates/${template.slug}`)}
          xHandle={template.xHandle}
          summary={template.summary}
          compact="row"
        />
        {showVote ? (
          <VoteButtons
            templateId={template.id}
            score={template.score}
            userVote={template.userVote}
            layout="row"
            size="mat"
          />
        ) : (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {points}
          </span>
        )}
      </span>
    </div>
  );
}

export function BotRankList({
  templates,
  showVote = false,
  scramble = false,
  leader = false,
  vacant = false,
  vacancies,
  delay = 0,
  className,
  surface = "board",
}: {
  templates: ListedTemplate[];
  showVote?: boolean;
  scramble?: boolean;
  leader?: boolean;
  vacant?: boolean;
  vacancies?: BoardVacancy[];
  delay?: number;
  className?: string;
  surface?: "board" | "roster";
}) {
  const scoreMax = Math.max(1, ...templates.map((template) => template.score));
  const open =
    vacancies ?? (vacant ? [{ label: "Share a bot", href: "/upload" }] : []);

  return (
    <ol className={cn("divide-y divide-border", className)}>
      {templates.map((template, index) => (
        <li
          key={template.id}
          className="motion-row"
          style={
            {
              ...motionDelay(delay + index),
              viewTransitionName: `bot-${template.slug}`,
            } as CSSProperties
          }
        >
          <BotRankRow
            rank={index + 1}
            template={template}
            showVote={showVote}
            size={leader && index === 0 ? "leader" : "default"}
            scramble={scramble}
            scoreMax={scoreMax}
            surface={surface}
          />
        </li>
      ))}
      <OpenSlots
        slots={open}
        startRank={templates.length + 1}
        scramble={scramble}
        delay={delay + templates.length}
        surface={surface}
      />
    </ol>
  );
}

export function BotRankRowSkeleton({
  surface = "board",
}: {
  surface?: "board" | "roster";
}) {
  const roster = surface === "roster";
  return (
    <div
      className={cn(
        "grid grid-cols-[2.25rem_minmax(0,1fr)_4rem] items-center gap-x-3",
        roster ? "px-3 py-4 sm:px-5" : "px-2 py-3"
      )}
    >
      <div className="h-3 w-5 animate-pulse bg-canvas-soft" />
      <div className="space-y-2">
        <div className="h-3.5 w-2/5 max-w-56 animate-pulse bg-canvas-soft" />
        <div className="h-2.5 w-1/4 max-w-32 animate-pulse bg-canvas-soft" />
      </div>
      <div className="h-3 w-8 justify-self-end animate-pulse bg-canvas-soft" />
    </div>
  );
}
