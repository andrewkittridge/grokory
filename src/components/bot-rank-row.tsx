import type { CSSProperties } from "react";
import Link from "next/link";
import { BotIdentityThumb } from "@/components/bot-identity";
import { VoteButtons } from "@/components/vote-buttons";
import { BoostedMark, FeaturedMark } from "@/components/feature-cta";
import { OpenSlots } from "@/components/open-slots";
import {
  addHandleHref,
  formatAdds,
  xHandleLabel,
  xHandleUrl,
} from "@/lib/bot-url";
import { isBoostedActive } from "@/lib/boost";
import { isFeaturedActive } from "@/lib/featured";
import {
  isClaimSeat,
  isSeatsOpenInvite,
  type BoardVacancy,
} from "@/lib/founding";
import { cn, motionDelay } from "@/lib/utils";
import type { ListedTemplate } from "@/lib/types";

export function BotRankRow({
  rank,
  template,
  showVote = false,
  size = "default",
  surface = "board",
}: {
  rank: number;
  template: ListedTemplate;
  showVote?: boolean;
  size?: "default" | "leader";
  surface?: "board" | "roster";
}) {
  const points =
    template.score === 1 ? "1 pt" : `${template.score} pts`;
  const leader = size === "leader";
  const roster = surface === "roster";
  const rowPad = leader
    ? roster
      ? "px-3 py-5 sm:px-5 sm:py-6"
      : "px-3 py-5 sm:px-4 sm:py-6"
    : roster
      ? "px-3 py-4 sm:px-5 sm:py-5"
      : "px-2 py-3.5 sm:px-3 sm:py-4";

  return (
    <div
      className={cn(
        "rank-row relative flex items-start gap-x-3 hover:bg-canvas-soft",
        leader && "rank-row-leader",
        rank === 1 && "rank-row-first",
        roster && "rank-row-roster",
        rowPad
      )}
    >
      <Link
        href={`/templates/${template.slug}`}
        className="absolute inset-0 z-0 focus-visible:ring-1 focus-visible:ring-foreground"
        aria-label={template.title}
      />
      <span className="relative z-10 pointer-events-none">
        <BotIdentityThumb
          mark={template.mark}
          size={leader ? "lg" : "md"}
        />
      </span>
      <span
        className={cn(
          "relative z-10 shrink-0 pt-1 font-mono text-xs tabular-nums tracking-wide",
          roster && "w-8",
          rank === 1 ? "rank-num-first text-sunset" : "rank-num text-muted-foreground"
        )}
      >
        {String(rank).padStart(2, "0")}
      </span>
      <span className="relative z-10 min-w-0 flex-1 overflow-hidden pointer-events-none">
        <span
          className={cn(
            "inline-flex max-w-full items-baseline gap-2",
            leader
              ? roster
                ? "font-heading text-xl leading-tight tracking-tight sm:text-2xl"
                : "font-heading text-lg leading-tight tracking-tight sm:text-xl"
              : "font-heading text-[1.05rem] leading-tight tracking-tight"
          )}
        >
          <span className={leader ? "line-clamp-2" : "truncate"}>
            {template.title}
          </span>
          {template.live ? (
            <span className="live-dot shrink-0" title="Live share link" />
          ) : null}
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
          "relative z-10 ml-auto flex shrink-0 items-center self-center",
          leader && "self-start pt-1"
        )}
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
  leader = false,
  vacant = false,
  vacancies,
  delay = 0,
  className,
  surface = "board",
}: {
  templates: ListedTemplate[];
  showVote?: boolean;
  leader?: boolean;
  vacant?: boolean;
  vacancies?: BoardVacancy[];
  delay?: number;
  className?: string;
  surface?: "board" | "roster";
}) {
  const open =
    vacancies ?? (vacant ? [{ label: "Share a bot", href: "/upload" }] : []);

  return (
    <ol className={cn("rank-list", className)}>
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
            surface={surface}
          />
        </li>
      ))}
      <OpenSlots
        slots={open}
        startRank={templates.length + 1}
        delay={delay + templates.length}
        surface={surface}
        inviteAgent={
          surface === "board" &&
          open.some((slot) => isClaimSeat(slot) || isSeatsOpenInvite(slot))
        }
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
        "rank-row relative flex items-center gap-x-3",
        roster ? "px-3 py-5 sm:px-5" : "px-2 py-4"
      )}
    >
      <BotIdentityThumb className="is-ghost" />
      <span className="w-8 shrink-0 font-mono text-xs tabular-nums tracking-wide text-muted-foreground">
        ··
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="block h-3 w-28 border-b border-border" />
        <span className="mt-2 block h-2 w-16 border-b border-border/70" />
      </span>
    </div>
  );
}
