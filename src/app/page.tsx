import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { LandingCta } from "@/components/landing-cta";
import {
  LandingBoard,
  LandingBoardSkeleton,
  LandingHero,
} from "@/components/landing-hero";
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
          <>
            <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
              <HomeFallback />
            </div>
            <LandingCta founding />
          </>
        }
      >
        <Home />
      </Suspense>
    </main>
  );
}

function HomeFallback() {
  return (
    <LandingHero founding>
      <LandingBoardSkeleton />
    </LandingHero>
  );
}

async function Home() {
  const templates = await listTemplates(await readVoterId());
  const founding = isFoundingBoard(templates.length);
  const { featured, organic } = partitionFeatured(templates);
  const ranked = sortTemplates(organic, "hot").slice(0, 5);
  const vacancies = boardVacancies(
    templates.length,
    ranked.length + featured.length,
    HOME_BOARD_SLOTS
  );
  const taglineDelay = templates.length === 0 ? 6 : 7 + ranked.length;

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <LandingHero founding={founding}>
          <JsonLd data={itemListJson([...featured, ...ranked], "/")} />
          <JsonLd data={faqJson()} />
          <LandingBoard
            ranked={ranked}
            featured={featured}
            count={templates.length}
            founding={founding}
            vacancies={vacancies}
          />
        </LandingHero>
        <p
          className="motion-enter mt-10 border-t border-border pt-6 text-sm leading-7 text-body sm:mt-12"
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
