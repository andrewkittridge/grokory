import type { Metadata } from "next";
import Link from "next/link";
import { LandingCta } from "@/components/landing-cta";
import { LandingHero } from "@/components/landing-hero";
import { sortTemplates } from "@/lib/rank";
import { populatedCategories } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const templates = await listTemplates(await readVoterId());
  const ranked = sortTemplates(templates, "hot").slice(0, 5);
  const jobs = populatedCategories(templates);
  const taglineDelay = templates.length === 0 ? 6 : 7 + ranked.length;

  return (
    <main>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <LandingHero ranked={ranked} count={templates.length} />

        <p
          className="motion-enter mt-10 border-t border-border pt-6 text-sm leading-7 text-muted-foreground sm:mt-12"
          style={motionDelay(taglineDelay)}
        >
          Custom Grok agents
          <span aria-hidden="true"> · </span>
          Ranked in public
          <span aria-hidden="true"> · </span>
          Add copies your own
        </p>

        {jobs.length > 0 ? (
          <p
            className="motion-enter mt-6 text-sm leading-7 text-muted-foreground"
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
                  href={`/templates?category=${encodeURIComponent(category)}`}
                  className="text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
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
              Share a bot in another job
            </Link>
          </p>
        ) : null}
      </div>

      <LandingCta />
    </main>
  );
}
