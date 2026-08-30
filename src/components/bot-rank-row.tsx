import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ListedTemplate } from "@/lib/types";

export function BotRankRow({
  rank,
  template,
}: {
  rank: number;
  template: ListedTemplate;
}) {
  const points =
    template.score === 1 ? "1 pt" : `${template.score} pts`;

  return (
    <Link
      href={`/templates/${template.slug}`}
      className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-md px-2 py-2.5 transition-colors hover:bg-white/5 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        className={cn(
          "font-mono text-xs tabular-nums tracking-wide",
          rank === 1 ? "text-sunset" : "text-muted-foreground"
        )}
      >
        {String(rank).padStart(2, "0")}
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-[15px] leading-tight font-normal tracking-tight">
            {template.title}
          </span>
          <span className="hidden shrink-0 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase sm:inline">
            {template.category}
          </span>
        </span>
        <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
          {template.summary}
        </span>
      </span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {points}
      </span>
    </Link>
  );
}
