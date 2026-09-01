import { BotRankRowSkeleton } from "@/components/bot-rank-row";

export default function TemplatesLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="h-10 w-48 animate-pulse bg-canvas-soft sm:h-12" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse bg-canvas-soft" />
      <div className="mt-10 divide-y divide-border border-y border-border">
        {Array.from({ length: 8 }).map((_, index) => (
          <BotRankRowSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
