import type { Metadata } from "next";
import { BotFilters } from "@/components/bot-filters";
import { BotRankRow } from "@/components/bot-rank-row";
import { EmptyState } from "@/components/empty-state";
import { parseSort, sortTemplates } from "@/lib/rank";
import { filterTemplates, populatedCategories } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The board",
  description:
    "Ranked public Grok Bot share links. Upvote the ones worth adding, then open the share link on x.ai.",
  alternates: { canonical: "/templates" },
};

type Search = {
  q?: string;
  category?: string;
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
  const sort = parseSort(params.sort);
  const all = await listTemplates(await readVoterId());
  const jobs = populatedCategories(all);
  const templates = sortTemplates(
    filterTemplates(all, {
      q,
      category,
    }),
    sort
  );
  const emptyBoard = !q && (!category || category === "all");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
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
      <div className="motion-enter mt-8" style={motionDelay(2)}>
        <BotFilters q={q} category={category} sort={sort} jobs={jobs} />
      </div>
      <p className="mt-8 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {templates.length} {templates.length === 1 ? "bot" : "bots"} · {sort}
      </p>
      {templates.length === 0 ? (
        <div className="mt-6">
          {emptyBoard ? (
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
        <ol className="mt-3 divide-y divide-border border-y border-border">
          {templates.map((template, index) => (
            <li key={template.id}>
              <BotRankRow rank={index + 1} template={template} showVote />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
