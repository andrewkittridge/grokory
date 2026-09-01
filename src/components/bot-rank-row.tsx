import type { CSSProperties } from "react";
import Link from "next/link";
import { RankTick } from "@/components/telemetry";
import { VoteButtons } from "@/components/vote-buttons";
import { BoostedMark, FeaturedMark } from "@/components/feature-cta";
import { OpenSlots } from "@/components/open-slots";
import { formatAdds } from "@/lib/bot-url";
import { isBoostedActive } from "@/lib/boost";
import { isFeaturedActive } from "@/lib/featured";
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
}: {
  rank: number;
  template: ListedTemplate;
  showVote?: boolean;
  size?: "default" | "leader";
  scramble?: boolean;
  scoreMax?: number;
}) {
  const points =
    template.score === 1 ? "1 pt" : `${template.score} pts`;
  const leader = size === "leader";
  const spark =
    scoreMax && scoreMax > 0
      ? Math.max(0, Math.min(1, template.score / scoreMax))
      : 0;

  return (
    <div
      className={cn(
        "rank-row relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-x-3 hover:bg-canvas-soft",
        leader && "rank-row-leader",
        leader
          ? "items-start px-3 py-4 sm:px-4 sm:py-5"
          : "items-center px-2 py-2.5"
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
            "relative z-10",
            leader ? "pt-1" : undefined,
            rank === 1 ? "text-sunset" : "text-muted-foreground"
          )}
        />
      ) : (
        <span
          className={cn(
            "relative z-10 font-mono text-xs tabular-nums tracking-wide",
            leader ? "pt-1" : undefined,
            rank === 1 ? "text-sunset" : "text-muted-foreground"
          )}
        >
          {String(rank).padStart(2, "0")}
        </span>
      )}
      <span className="relative z-10 min-w-0 pointer-events-none">
        <span
          className={cn(
            "font-normal tracking-tight",
            leader
              ? "line-clamp-2 text-lg leading-tight sm:text-xl"
              : "block truncate text-[15px] leading-tight"
          )}
        >
          {template.title}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          {isFeaturedActive(template) ? (
            <>
              <FeaturedMark />
              <span aria-hidden="true"> · </span>
            </>
          ) : isBoostedActive(template) ? (
            <>
              <BoostedMark />
              <span aria-hidden="true"> · </span>
            </>
          ) : null}
          {template.category}
          <span aria-hidden="true"> · </span>
          {formatAdds(template.adds)}
        </span>
        <span
          className={cn(
            "block text-muted-foreground",
            leader
              ? "mt-1.5 line-clamp-2 text-sm leading-6"
              : "mt-0.5 line-clamp-1 text-xs"
          )}
        >
          {template.summary}
        </span>
      </span>
      <span
        className={cn("relative z-10", leader ? "pt-1" : undefined)}
      >
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
}: {
  templates: ListedTemplate[];
  showVote?: boolean;
  scramble?: boolean;
  leader?: boolean;
  vacant?: boolean;
  vacancies?: BoardVacancy[];
  delay?: number;
  className?: string;
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
          />
        </li>
      ))}
      <OpenSlots
        slots={open}
        startRank={templates.length + 1}
        scramble={scramble}
        delay={delay + templates.length}
      />
    </ol>
  );
}

export function BotRankRowSkeleton() {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_4rem] items-center gap-x-3 px-2 py-3">
      <div className="h-3 w-5 animate-pulse bg-canvas-soft" />
      <div className="space-y-2">
        <div className="h-3.5 w-2/5 max-w-56 animate-pulse bg-canvas-soft" />
        <div className="h-2.5 w-1/4 max-w-32 animate-pulse bg-canvas-soft" />
      </div>
      <div className="h-3 w-8 justify-self-end animate-pulse bg-canvas-soft" />
    </div>
  );
}
