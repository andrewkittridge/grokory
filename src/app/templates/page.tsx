import { BotCard } from "@/components/bot-card";
import { BotFilters } from "@/components/bot-filters";
import { EmptyState } from "@/components/empty-state";
import { parseSort, sortTemplates } from "@/lib/rank";
import {
  filterTemplates,
  hasBothOrigins,
  populatedCategories,
} from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import type { TemplateOrigin } from "@/lib/types";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  category?: string;
  origin?: string;
  sort?: string;
};

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category ?? "all";
  const origin = (params.origin ?? "all") as "all" | TemplateOrigin;
  const sort = parseSort(params.sort);
  const all = await listTemplates(await readVoterId());
  const jobs = populatedCategories(all);
  const showOrigin = hasBothOrigins(all);
  const templates = sortTemplates(
    filterTemplates(all, {
      q,
      category,
      origin,
    }),
    sort
  );
  const dense = templates.length >= 3;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h1
        className="motion-enter text-4xl font-normal tracking-tight sm:text-5xl"
        style={motionDelay(0)}
      >
        The board
      </h1>
      <p
        className="motion-enter mt-4 max-w-2xl text-muted-foreground leading-7"
        style={motionDelay(1)}
      >
        Every listing is a public Grok Bot share URL. Upvote the ones worth
        adding, then open the share link on x.ai.
      </p>
      <div className="motion-enter mt-10" style={motionDelay(2)}>
        <BotFilters
          q={q}
          category={category}
          origin={origin}
          sort={sort}
          jobs={jobs}
          showOrigin={showOrigin}
        />
      </div>
      <p className="mt-8 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {templates.length} {templates.length === 1 ? "bot" : "bots"} · {sort}
      </p>
      {templates.length === 0 ? (
        <div className="mt-6">
          {origin === "community" && !q && (!category || category === "all") ? (
            <EmptyState
              title="The next listing lands here"
              body="Got a Grok Bot share link? Paste it and it shows up here for everyone else."
              actionHref="/upload"
              actionLabel="Share a bot"
            />
          ) : (
            <EmptyState
              title="Nothing matches"
              body="Try another job, clear search, or be the one who lists this kind of bot."
              actionHref="/upload"
              actionLabel="Share a bot"
            />
          )}
        </div>
      ) : (
        <div
          className={
            dense
              ? "mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "mt-5 max-w-2xl"
          }
        >
          {templates.map((template, index) => (
            <BotCard
              key={template.id}
              template={template}
              delay={index}
              size={dense ? "default" : "lg"}
              rank={index + 1}
            />
          ))}
        </div>
      )}
    </main>
  );
}
