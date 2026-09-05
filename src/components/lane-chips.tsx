import Link from "next/link";
import {
  LANES,
  LANE_LABELS,
  boardSearchHref,
  type Lane,
} from "@/lib/lane";
import { cn } from "@/lib/utils";

export function LaneChips({
  q,
  tag,
  skill,
  sort,
  lane,
  total,
  counts,
}: {
  q: string;
  tag?: string;
  skill?: string;
  sort: string;
  lane?: Lane;
  total: number;
  counts: { lane: Lane; count: number }[];
}) {
  const byLane = new Map(counts.map((row) => [row.lane, row.count]));
  const chips = LANES.filter((item) => (byLane.get(item) ?? 0) > 0);
  const hrefBase = { q, tag, skill, sort };
  const chipHref = boardSearchHref;

  return (
    <nav
      aria-label="Filter by lane"
      className="lane-chips -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      <LaneChip
        href={chipHref(hrefBase)}
        label="All"
        count={total}
        active={!lane}
      />
      {chips.map((item) => (
        <LaneChip
          key={item}
          href={chipHref({ ...hrefBase, lane: item })}
          label={LANE_LABELS[item]}
          count={byLane.get(item) ?? 0}
          active={lane === item}
        />
      ))}
    </nav>
  );
}

function LaneChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "lane-chip inline-flex h-11 shrink-0 items-center gap-2 border px-3 font-mono text-[11px] tracking-[0.12em] uppercase focus-visible:ring-1 focus-visible:ring-foreground sm:h-9",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-pill-border text-muted-foreground hover:border-foreground hover:text-foreground"
      )}
    >
      <span>{label}</span>
      <span className={cn("tabular-nums", active ? "text-background/70" : "text-muted-foreground/80")}>
        {count}
      </span>
    </Link>
  );
}
