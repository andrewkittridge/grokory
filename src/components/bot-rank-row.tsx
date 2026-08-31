import Link from "next/link";
import { VoteButtons } from "@/components/vote-buttons";
import { cn } from "@/lib/utils";
import type { ListedTemplate } from "@/lib/types";

export function BotRankRow({
  rank,
  template,
  showVote = false,
}: {
  rank: number;
  template: ListedTemplate;
  showVote?: boolean;
}) {
  const origin = template.origin === "curated" ? "Staff pick" : "Community";
  const points =
    template.score === 1 ? "1 pt" : `${template.score} pts`;

  return (
    <div className="relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 px-2 py-2.5 hover:bg-white/5">
      <Link
        href={`/templates/${template.slug}`}
        className="absolute inset-0 z-0 focus-visible:ring-1 focus-visible:ring-foreground"
        aria-label={template.title}
      />
      <span
        className={cn(
          "relative z-10 font-mono text-xs tabular-nums tracking-wide",
          rank === 1 ? "text-sunset" : "text-muted-foreground"
        )}
      >
        {String(rank).padStart(2, "0")}
      </span>
      <span className="relative z-10 min-w-0 pointer-events-none">
        <span className="truncate text-[15px] leading-tight font-normal tracking-tight">
          {template.title}
        </span>
        {showVote ? (
          <span className="mt-0.5 block truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            {template.category}
            <span className="text-border" aria-hidden="true">
              {" · "}
            </span>
            {origin}
          </span>
        ) : (
          <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
            {template.summary}
          </span>
        )}
      </span>
      <span className="relative z-10">
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
