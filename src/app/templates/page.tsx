import { BotCard } from "@/components/bot-card";
import { BotFilters } from "@/components/bot-filters";
import { EmptyState } from "@/components/empty-state";
import { filterTemplates, sortByNewest } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import type { TemplateOrigin } from "@/lib/types";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  category?: string;
  origin?: string;
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
  const templates = sortByNewest(
    filterTemplates(await listTemplates(), { q, category, origin })
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">
        The library
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every listing is a public Grok Bot share URL. Open one, then Add to Grok
        Bot on x.ai.
      </p>
      <div className="mt-8">
        <BotFilters q={q} category={category} origin={origin} />
      </div>
      <p className="mt-6 text-xs tracking-wide text-muted-foreground uppercase">
        {templates.length} {templates.length === 1 ? "bot" : "bots"}
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
