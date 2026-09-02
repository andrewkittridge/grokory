import type { Metadata } from "next";
import { BoardStrip } from "@/components/board-strip";
import { BotFilters } from "@/components/bot-filters";
import { BotRankList } from "@/components/bot-rank-row";
import { EmptyState } from "@/components/empty-state";
import { JsonLd } from "@/components/json-ld";
import { LockTitle } from "@/components/lock-title";
import { itemListJson } from "@/lib/json-ld";
import { partitionBoosted } from "@/lib/boost";
import { partitionFeatured } from "@/lib/featured";
import { boardVacancies, isFoundingBoard } from "@/lib/founding";
import { parseSort, sortTemplates } from "@/lib/rank";
import { filterTemplates, populatedCategories } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import { CATEGORIES } from "@/lib/types";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The board",
  description:
    "A public board of Grok Bot share links. List yours, upvote the useful ones, then add a copy on x.ai.",
  alternates: { canonical: "/templates" },
};

type Search = {
  q?: string;
  category?: string;
  tag?: string;
  skill?: string;
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
  const tag = params.tag?.trim().toLowerCase() ?? "";
  const skill = params.skill?.trim().toLowerCase() ?? "";
  const sort = parseSort(params.sort);
  const all = await listTemplates(await readVoterId());
  const founding = isFoundingBoard(all.length);
  const jobs = founding ? [...CATEGORIES] : populatedCategories(all);
  const filtered = filterTemplates(all, {
    q,
    category,
    tag,
    skill,
  });
  const { featured, organic } = partitionFeatured(filtered);
  const job =
    category && category !== "all" ? category : null;
  const { boosted, rest } = job
    ? partitionBoosted(organic, job)
    : { boosted: [] as typeof organic, rest: organic };
  const templates = sortTemplates(rest, sort);
  const emptyBoard = !q && !tag && !skill && (!category || category === "all");
  const empty =
    templates.length === 0 && featured.length === 0 && boosted.length === 0;
  const vacancies = emptyBoard
    ? boardVacancies(
        all,
        featured.length + templates.length,
        featured.length + templates.length + CATEGORIES.length
      )
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <JsonLd data={itemListJson([...featured, ...templates], "/templates")} />
      <LockTitle delay={0}>The board</LockTitle>
      <p
        className="motion-enter mt-4 max-w-2xl text-body leading-7"
        style={motionDelay(1)}
      >
        {founding
          ? "Just opened. Every listing is a public Grok Bot share URL. Add a copy, or list one of yours."
          : "Every listing is a public Grok Bot share URL. Upvote the ones worth adding, then open the share link on x.ai."}
      </p>
      <div className="motion-enter mt-8" style={motionDelay(2)}>
        <BotFilters
          q={q}
          category={category}
          tag={tag}
          skill={skill}
          sort={sort}
          jobs={jobs}
        />
      </div>
      <BoardStrip sort={sort} count={filtered.length} founding={founding} />
      {empty ? (
        <div className="mt-6">
          {emptyBoard && vacancies.length > 0 ? (
            <BotRankList
              templates={[]}
              vacancies={vacancies}
              scramble
              className="mt-0 border-y border-border"
            />
          ) : job ? (
            <BotRankList
              templates={[]}
              vacancies={[
                {
                  label: job,
                  hint: "Open",
                  href: `/upload?category=${encodeURIComponent(job)}`,
                },
              ]}
              scramble
              className="mt-0 border-y border-border"
            />
          ) : emptyBoard ? (
            <EmptyState
              title="Board just opened"
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
        <>
          {featured.length > 0 ? (
            <div className="mt-0 border-b border-border">
              <p className="px-2 py-3 font-mono text-[10px] tracking-[0.2em] text-sunset uppercase sm:px-0">
                Featured
              </p>
              <BotRankList templates={featured} showVote scramble />
            </div>
          ) : null}
          {boosted.length > 0 ? (
            <div className="mt-0 border-b border-border">
              <p className="px-2 py-3 font-mono text-[10px] tracking-[0.2em] text-foreground uppercase sm:px-0">
                Boosted in {job}
              </p>
              <BotRankList templates={boosted} showVote scramble />
            </div>
          ) : null}
          {templates.length > 0 || vacancies.length > 0 ? (
            <BotRankList
              templates={templates}
              showVote
              scramble
              vacancies={vacancies}
              className="mt-0 border-b border-border"
            />
          ) : null}
        </>
      )}
    </main>
  );
}
