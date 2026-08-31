import Link from "next/link";
import { BotCard } from "@/components/bot-card";
import { BotRankRow } from "@/components/bot-rank-row";
import { EmptyState } from "@/components/empty-state";
import { LandingCta } from "@/components/landing-cta";
import { LandingHero } from "@/components/landing-hero";
import { LandingSectionHeading } from "@/components/landing-section-heading";
import { sortTemplates } from "@/lib/rank";
import {
  communityTemplates,
  featuredTemplates,
  populatedCategories,
} from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import { motionDelay } from "@/lib/utils";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    title: "Custom Grok agents",
    body: "Specialist bots people already built on x.ai.",
  },
  {
    title: "Ranked in public",
    body: "Hot / Top / New. One vote per browser, no account.",
  },
  {
    title: "Add copies your own",
    body: "Opening Add on x.ai copies the template. It does not share logins or chats.",
  },
] as const;

export default async function HomePage() {
  const templates = await listTemplates(await readVoterId());
  const ranked = sortTemplates(templates, "hot").slice(0, 5);
  const featured = featuredTemplates(templates);
  const community = communityTemplates(templates).slice(0, 6);
  const jobs = populatedCategories(templates);

  return (
    <main>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <LandingHero ranked={ranked} />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section
          className="motion-enter grid gap-8 border-y border-border py-8 sm:grid-cols-3 sm:gap-0"
          style={motionDelay(2)}
        >
          {FEATURES.map((item, index) => (
            <div
              key={item.title}
              className={
                index === 0
                  ? "sm:pr-8"
                  : index === 1
                    ? "sm:border-x sm:border-border sm:px-8"
                    : "sm:pl-8"
              }
            >
              <h2 className="text-lg font-normal tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className="motion-enter mt-20" style={motionDelay(5)}>
          <LandingSectionHeading
            kicker="Curated"
            title="Staff picks"
            description="Share links we verified by opening them on x.ai."
            action={
              featured.length > 1 ? (
                <Link
                  href="/templates?origin=curated"
                  className="shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground uppercase hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                >
                  All staff picks
                </Link>
              ) : null
            }
          />
          {featured.length === 0 ? (
            <EmptyState
              title="No staff picks yet"
              body="The first verified share links will land here."
            />
          ) : featured.length === 1 && featured[0] ? (
            <div className="max-w-2xl">
              <BotCard template={featured[0]} size="lg" rank={1} />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {featured.map((template, index) => (
                <BotCard
                  key={template.id}
                  template={template}
                  size="lg"
                  delay={index}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </section>

        {jobs.length > 0 ? (
          <section className="motion-enter mt-20" style={motionDelay(6)}>
            <LandingSectionHeading kicker="Catalog" title="Jobs" />
            <p className="-mt-2 text-sm leading-7 text-muted-foreground">
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
          </section>
        ) : null}

        <section className="motion-enter mt-20 mb-20" style={motionDelay(7)}>
          <LandingSectionHeading
            kicker="Public board"
            title={
              community.length > 0 ? "Hot from the community" : "The next listing"
            }
            description={
              community.length > 0
                ? "Ranked by votes. Anyone can paste a share link — no account."
                : "Anyone can paste a share link. No account."
            }
          />
          {community.length === 0 ? (
            <EmptyState
              title="The next listing lands here"
              body="Got a Grok Bot share link? Paste it and it shows up on the board for everyone else."
              actionHref="/upload"
              actionLabel="Share a bot"
            />
          ) : (
            <ol className="divide-y divide-border border-y border-border">
              {community.map((template, index) => (
                <li key={template.id}>
                  <BotRankRow
                    rank={index + 1}
                    template={template}
                    showVote
                  />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <LandingCta />
    </main>
  );
}
