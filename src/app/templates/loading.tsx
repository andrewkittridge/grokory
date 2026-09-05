import { BotRankRowSkeleton } from "@/components/bot-rank-row";

export default function TemplatesLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="relative mt-10 border-y border-border">
        {Array.from({ length: 8 }).map((_, index) => (
          <BotRankRowSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
