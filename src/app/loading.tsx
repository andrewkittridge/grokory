import { BrandMark } from "@/components/brand-mark";
import { BotRankRowSkeleton } from "@/components/bot-rank-row";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-16">
      <div className="flex items-center gap-3">
        <BrandMark motion="spin" className="size-8 text-foreground" />
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          Acquiring
        </p>
      </div>
      <div className="mt-10 divide-y divide-border border-y border-border">
        {Array.from({ length: 8 }).map((_, index) => (
          <BotRankRowSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
