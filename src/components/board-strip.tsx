import { CountTick, MissionClock } from "@/components/telemetry";

export function BoardStrip({
  sort,
  count,
}: {
  sort: string;
  count: number;
}) {
  return (
    <p className="board-strip mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
      <span className="inline-flex items-center gap-2 text-foreground">
        <span className="live-dot" aria-hidden="true" />
        Mode {sort}
      </span>
      <span className="text-border" aria-hidden="true">
        ·
      </span>
      <CountTick value={count} singular="bot" plural="bots" />
      <span className="text-border" aria-hidden="true">
        ·
      </span>
      <MissionClock />
    </p>
  );
}
