import { BotRankRowSkeleton } from "@/components/bot-rank-row";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-16">
      <div className="h-10 w-48 animate-pulse bg-canvas-soft" />
      <div className="mt-4 h-4 w-96 max-w-full animate-pulse bg-canvas-soft" />
      <div className="mt-10 divide-y divide-border border-y border-border">
        {Array.from({ length: 8 }).map((_, index) => (
          <BotRankRowSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
