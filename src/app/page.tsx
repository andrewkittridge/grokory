import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { LandingCta } from "@/components/landing-cta";
import {
  LandingBoard,
  LandingBoardSkeleton,
  LandingCast,
  LandingHero,
} from "@/components/landing-hero";
import { LandingHow } from "@/components/landing-how";
import { LandingWhy } from "@/components/landing-why";
import { faqJson, itemListJson } from "@/lib/json-ld";
import { partitionFeatured } from "@/lib/featured";
import {
  HOME_BOARD_SLOTS,
  boardVacancies,
  isFoundingBoard,
} from "@/lib/founding";
import { sortTemplates } from "@/lib/rank";
import { listTemplates } from "@/lib/templates-store";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function HomePage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <LandingHero heading={false}>
              <LandingBoardSkeleton />
            </LandingHero>
          </div>
        }
      >
        <Home />
      </Suspense>
    </main>
  );
}

async function Home() {
  const templates = await listTemplates(await readVoterId());
  const founding = isFoundingBoard(templates.length);
  const { featured, organic } = partitionFeatured(templates);
  const ranked = sortTemplates(organic, "hot").slice(0, HOME_BOARD_SLOTS);
  const vacancies = boardVacancies(
    templates.length,
    ranked.length + featured.length,
    HOME_BOARD_SLOTS
  );
  const taglineDelay = templates.length === 0 ? 6 : 7 + ranked.length;

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <LandingHero founding={founding}>
          <JsonLd data={itemListJson([...featured, ...ranked], "/")} />
          <JsonLd data={faqJson()} />
          <LandingCast templates={[...featured, ...ranked]} />
          <LandingBoard
            ranked={ranked}
            featured={featured}
            count={templates.length}
            founding={founding}
            vacancies={vacancies}
          />
        </LandingHero>
        <LandingWhy />
        <LandingHow />
        <p
          className="motion-enter mt-12 border-t border-border pt-5 text-sm leading-7 text-body"
          style={motionDelay(taglineDelay)}
        >
          Public share links
          <span aria-hidden="true"> · </span>
          Ranked by votes
          <span aria-hidden="true"> · </span>
          Add copies the template
        </p>
      </div>
      <LandingCta founding={founding} />
    </>
  );
}
