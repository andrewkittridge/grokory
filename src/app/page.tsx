import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
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
import { populatedCategories } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import { CATEGORIES } from "@/lib/types";
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
  const jobs = founding ? [...CATEGORIES] : populatedCategories(templates);
  const vacancies = boardVacancies(
    templates,
    ranked.length + featured.length,
    HOME_BOARD_SLOTS
  );
  const taglineDelay = templates.length === 0 ? 6 : 7 + ranked.length;
  const listed = new Set(populatedCategories(templates));

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
        {jobs.length > 0 ? (
          <p
            className="motion-enter mt-6 text-sm leading-7 text-body"
            style={motionDelay(taglineDelay + 1)}
          >
            <span className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
              Jobs
            </span>{" "}
            {jobs.map((category, index) => (
              <span key={category}>
                {index > 0 ? (
                  <span className="text-border" aria-hidden="true">
                    {" · "}
                  </span>
                ) : null}
                <Link
                  href={
                    listed.has(category)
                      ? `/templates?category=${encodeURIComponent(category)}`
                      : `/upload?category=${encodeURIComponent(category)}`
                  }
                  className={
                    listed.has(category)
                      ? "text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
                      : "text-muted-foreground hover:text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
                  }
                >
                  {category}
                </Link>
              </span>
            ))}
            <span className="text-border" aria-hidden="true">
              {" · "}
            </span>
            <Link
              href="/upload"
              className="hover:text-foreground hover:underline"
            >
              Share a bot
            </Link>
          </p>
        ) : null}
      </div>
      <LandingCta founding={founding} />
    </>
  );
}
