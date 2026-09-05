import { BoardStrip } from "@/components/board-strip";
import { BotFilters } from "@/components/bot-filters";
import { BotRankList } from "@/components/bot-rank-row";
import { EmptyState } from "@/components/empty-state";
import { JsonLd } from "@/components/json-ld";
import { LaneChips } from "@/components/lane-chips";
import { LockTitle } from "@/components/lock-title";
import { itemListJson } from "@/lib/json-ld";
import { partitionBoosted } from "@/lib/boost";
import { partitionFeatured } from "@/lib/featured";
import {
  boardVacancies,
  isFoundingBoard,
  showBoardSortTabs,
} from "@/lib/founding";
import { laneCounts, parseLane } from "@/lib/lane";
import { parseSort, sortTemplates } from "@/lib/rank";
import { filterTemplates } from "@/lib/templates";
import { pageMetadata } from "@/lib/site";
import { listTemplates } from "@/lib/templates-store";
import { motionDelay } from "@/lib/utils";
import { JOBS } from "@/lib/visual";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "The board",
  description:
    "The ranked public board of Grok Bot share links. Live from x.ai. Upvote the useful ones, then add a copy to your Grok account.",
  path: "/templates",
});

type Search = {
  q?: string;
  tag?: string;
  skill?: string;
  lane?: string;
  sort?: string;
};

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const tag = params.tag?.trim().toLowerCase() ?? "";
  const skill = params.skill?.trim().toLowerCase() ?? "";
  const lane = parseLane(params.lane);
  const sort = parseSort(params.sort);
  const all = await listTemplates(await readVoterId());
  const founding = isFoundingBoard(all.length);
  const scoped = filterTemplates(all, { q, tag, skill });
  const filtered = filterTemplates(scoped, { lane });
  const { featured, organic } = partitionFeatured(filtered);
  const { boosted, rest } = partitionBoosted(organic);
  const templates = sortTemplates(rest, sort);
  const emptyBoard = !q && !tag && !skill && !lane;
  const empty =
    templates.length === 0 && featured.length === 0 && boosted.length === 0;
  const vacancies = emptyBoard
    ? boardVacancies(
        all.length,
        featured.length + boosted.length + templates.length,
        Math.max(
          featured.length + boosted.length + templates.length + 1,
          6
        )
      )
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={itemListJson([...featured, ...templates], "/templates")} />
      <p className="cmd motion-enter" style={motionDelay(0)}>
        {founding ? "just opened" : "live"}
        <span className="mx-2 text-border" aria-hidden="true">
          ·
        </span>
        ranked
      </p>
      <LockTitle delay={1} className="mt-3">
        The board
      </LockTitle>
      <p
        className="motion-enter mt-4 max-w-2xl text-body leading-7"
        style={motionDelay(2)}
      >
        {founding
          ? "Just opened. Every listing is a public Grok Bot share URL. Add a copy, or list one of yours."
          : "Every listing is a live public Grok Bot share URL. Upvote the ones worth adding, then open the share on x.ai."}
      </p>
      <div className="motion-enter mt-8" style={motionDelay(3)}>
        <BotFilters
          q={q}
          tag={tag}
          skill={skill}
          lane={lane}
          sort={sort}
          sortTabs={showBoardSortTabs(all.length)}
        />
      </div>
      <div className="motion-enter mt-5" style={motionDelay(4)}>
        <LaneChips
          q={q}
          tag={tag}
          skill={skill}
          sort={sort}
          lane={lane}
          total={scoped.length}
          counts={laneCounts(scoped)}
        />
      </div>
      <BoardStrip sort={sort} count={filtered.length} founding={founding} />
      {empty ? (
        <div className="mt-4">
          {emptyBoard && vacancies.length > 0 ? (
            <div className="border-y border-border">
              <BotRankList
                templates={[]}
                vacancies={vacancies}
              />
            </div>
          ) : emptyBoard ? (
            <EmptyState
              title="Board just opened"
              body="Got a Grok Bot share link? Paste it and it shows up here for everyone else."
              actionHref="/upload"
              actionLabel={JOBS.share}
            />
          ) : (
            <EmptyState
              title="Nothing matches"
              body="Clear search, or be the one who lists this kind of bot."
              actionHref="/upload"
              actionLabel={JOBS.share}
            />
          )}
        </div>
      ) : (
        <div className="mt-4 border-y border-border">
          {featured.length > 0 ? (
            <div className="border-b border-border">
              <p className="cmd px-3 py-3 sm:px-5">featured</p>
              <BotRankList templates={featured} showVote />
            </div>
          ) : null}
          {boosted.length > 0 ? (
            <div className="border-b border-border">
              <p className="cmd px-3 py-3 sm:px-5">boosted</p>
              <BotRankList templates={boosted} showVote />
            </div>
          ) : null}
          {templates.length > 0 || vacancies.length > 0 ? (
            <BotRankList
              templates={templates}
              showVote
              leader
              vacancies={vacancies}
            />
          ) : null}
        </div>
      )}
    </main>
  );
}
