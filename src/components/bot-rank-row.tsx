import Link from "next/link";
import { VoteButtons } from "@/components/vote-buttons";
import { cn } from "@/lib/utils";
import type { ListedTemplate } from "@/lib/types";

function jobLine(template: ListedTemplate) {
  return template.origin === "curated"
    ? `Staff pick · ${template.category}`
    : template.category;
}

export function BotRankRow({
  rank,
  template,
  showVote = false,
  size = "default",
  detail,
}: {
  rank: number;
  template: ListedTemplate;
  showVote?: boolean;
  size?: "default" | "leader";
  detail?: "summary" | "job";
}) {
  const points =
    template.score === 1 ? "1 pt" : `${template.score} pts`;
  const subtitle = detail ?? (showVote ? "job" : "summary");
  const leader = size === "leader";

  return (
    <div
      className={cn(
        "rank-row relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-x-3 hover:bg-white/5",
        leader
          ? "items-start px-3 py-4 sm:px-4 sm:py-5"
          : "items-center px-2 py-2.5"
      )}
    >
      <Link
        href={`/templates/${template.slug}`}
        className="absolute inset-0 z-0 focus-visible:ring-1 focus-visible:ring-foreground"
        aria-label={template.title}
      />
      <span
        className={cn(
          "relative z-10 font-mono text-xs tabular-nums tracking-wide",
          leader ? "pt-1" : undefined,
          rank === 1 ? "text-sunset" : "text-muted-foreground"
        )}
      >
        {String(rank).padStart(2, "0")}
      </span>
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
        {leader ? (
          <>
            <span className="mt-1 block truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              {jobLine(template)}
            </span>
            <span className="mt-1.5 line-clamp-2 block text-sm leading-6 text-muted-foreground">
              {template.summary}
            </span>
          </>
        ) : subtitle === "job" ? (
          <span className="mt-0.5 block truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            {jobLine(template)}
          </span>
        ) : (
          <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
            {template.summary}
          </span>
        )}
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

export function VacantRankRow({ rank }: { rank: number }) {
  return (
    <div className="rank-row relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 px-2 py-2.5 hover:bg-white/5">
      <Link
        href="/upload"
        className="absolute inset-0 z-0 focus-visible:ring-1 focus-visible:ring-foreground"
        aria-label="Share a bot"
      />
      <span className="relative z-10 font-mono text-xs tabular-nums tracking-wide text-muted-foreground">
        {String(rank).padStart(2, "0")}
      </span>
      <span className="relative z-10 min-w-0 pointer-events-none truncate text-[15px] leading-tight text-muted-foreground">
        Next listing
      </span>
      <span className="relative z-10 font-mono text-[11px] tracking-wide text-foreground uppercase">
        Share
      </span>
    </div>
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
