import { BotCardSkeleton } from "@/components/bot-card";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-canvas-soft" />
      <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded-lg bg-canvas-soft" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <BotCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
