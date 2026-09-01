import { CountTick } from "@/components/telemetry";

export function BoardStrip({
  sort,
  count,
  founding = false,
}: {
  sort: string;
  count: number;
  founding?: boolean;
}) {
  const label = sort ? sort.charAt(0).toUpperCase() + sort.slice(1) : "Hot";

  return (
    <p className="board-strip mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
      <span className="inline-flex items-center gap-2 text-foreground">
        <span className="live-dot" aria-hidden="true" />
        {founding ? "Just opened" : label}
      </span>
      {founding ? (
        <>
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <span>{label}</span>
        </>
      ) : null}
      <span className="text-border" aria-hidden="true">
        ·
      </span>
      <CountTick value={count} singular="bot" plural="bots" />
    </p>
  );
}
