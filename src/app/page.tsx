import Link from "next/link";
import { BotCard } from "@/components/bot-card";
import { EmptyState } from "@/components/empty-state";
import { LandingCta } from "@/components/landing-cta";
import { LandingHero } from "@/components/landing-hero";
import { LandingSectionHeading } from "@/components/landing-section-heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <main className="landing-atmosphere">
      <div className="landing-hero-pad">
        <div className="landing-hero-grid" aria-hidden="true" />
        <div className="landing-hero-floor" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <LandingHero ranked={ranked} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section className="grid gap-3 sm:grid-cols-3">
          {FEATURES.map((item, index) => (
            <Card
              key={item.title}
              className="motion-enter rounded-md bg-card/70 py-5 backdrop-blur-sm"
              style={motionDelay(index + 2)}
            >
              <CardHeader className="gap-0">
                <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <CardTitle className="mt-3 text-xl font-normal tracking-tight">
                  {item.title}
                </CardTitle>
                <CardDescription className="mt-2 leading-6">
                  {item.body}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="motion-enter mt-24" style={motionDelay(5)}>
          <LandingSectionHeading
            kicker="Curated"
            title="Staff picks"
            description="Share links we verified by opening them on x.ai."
            action={
              featured.length > 1 ? (
                <Link
                  href="/templates?origin=curated"
                  className="shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground uppercase hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
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
            <div className="grid gap-6 sm:grid-cols-2">
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
          <section className="motion-enter mt-24" style={motionDelay(6)}>
            <LandingSectionHeading kicker="Catalog" title="Jobs" />
            <div className="-mt-2 flex flex-wrap items-center gap-2">
              {jobs.map((category) => (
                <Link
                  key={category}
                  href={`/templates?category=${encodeURIComponent(category)}`}
                  className="rounded-full border border-pill-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-white/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {category}
                </Link>
              ))}
              <Link
                href="/upload"
                className="text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                Share a bot in another job
              </Link>
            </div>
          </section>
        ) : null}

        <section className="motion-enter mt-24 mb-24" style={motionDelay(7)}>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {community.map((template, index) => (
                <BotCard key={template.id} template={template} delay={index} />
              ))}
            </div>
          )}
        </section>
      </div>

      <LandingCta />
    </main>
  );
}
