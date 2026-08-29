import { BotCard } from "@/components/bot-card";
import { BotFilters } from "@/components/bot-filters";
import { EmptyState } from "@/components/empty-state";
import { parseSort, sortTemplates } from "@/lib/rank";
import { filterTemplates } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import type { TemplateOrigin } from "@/lib/types";
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
  const templates = sortTemplates(
    filterTemplates(await listTemplates(await readVoterId()), {
      q,
      category,
      origin,
    }),
    sort
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">
        The board
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every listing is a public Grok Bot share URL. Upvote the ones worth
        adding, then open the share link on x.ai.
      </p>
      <div className="mt-8">
        <BotFilters q={q} category={category} origin={origin} sort={sort} />
      </div>
      <p className="mt-6 text-xs tracking-wide text-muted-foreground uppercase">
        {templates.length} {templates.length === 1 ? "bot" : "bots"} · {sort}
      </p>
      {templates.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing matches"
            body="Try another job, clear search, or be the one who lists this kind of bot."
            actionHref="/upload"
            actionLabel="Share a bot"
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <BotCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </main>
  );
}
