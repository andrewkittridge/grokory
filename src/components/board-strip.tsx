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
    <p className="board-strip mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase sm:mt-6">
      <span className="inline-flex items-center gap-2 text-foreground">
        {founding ? (
          `${count} listed`
        ) : (
          <>
            <span className="live-dot" aria-hidden="true" />
            {label}
          </>
        )}
      </span>
      {founding ? (
        <>
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <span>seats open</span>
        </>
      ) : (
        <>
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <CountTick value={count} singular="bot" plural="bots" />
        </>
      )}
    </p>
  );
}
