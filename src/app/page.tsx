import Link from "next/link";
import { BotCard } from "@/components/bot-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { communityTemplates, featuredTemplates } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";
import { CATEGORIES } from "@/lib/types";
import { readVoterId } from "@/lib/voter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const templates = await listTemplates(await readVoterId());
  const featured = featuredTemplates(templates);
  const community = communityTemplates(templates).slice(0, 6);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="max-w-3xl">
        <p className="text-xs tracking-[0.22em] text-primary uppercase">
          Public Grok Bot board
        </p>
        <h1 className="font-heading mt-3 text-4xl leading-[1.1] tracking-tight sm:text-6xl">
          Find Grok Bots worth adding.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          People share templates as links like{" "}
          <span className="font-mono text-sm text-foreground">
            x.ai/bot/N92u9t1nHlL_gtgk2nAeN
          </span>
          . Upvote the good ones so they rise. Then{" "}
          <span className="text-foreground">Add to Grok Bot</span> on x.ai.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" nativeButton={false} render={<Link href="/templates" />}>
            Browse the board
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/upload" />}
          >
            Paste a share link
          </Button>
        </div>
      </section>

      <section className="mt-12 grid gap-3 sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "Copy the share link",
            body: "In Grok Bot, open a bot you like and copy its public x.ai/bot/… URL.",
          },
          {
            step: "02",
            title: "Publish it here",
            body: "Paste the link. We pull the name, author, and description from x.ai.",
          },
          {
            step: "03",
            title: "Vote it up",
            body: "The board ranks by Hot, Top, and New. No account — one vote per browser.",
          },
        ].map((item) => (
          <div
            key={item.step}
            className="rounded-xl border border-border/80 bg-card/50 px-5 py-5"
          >
            <p className="font-mono text-xs text-primary">{item.step}</p>
            <h2 className="font-heading mt-2 text-xl tracking-tight">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.body}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl tracking-tight">Staff picks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Share links we verified by opening them on x.ai.
            </p>
          </div>
          <Link
            href="/templates?origin=curated"
            className="text-sm text-primary hover:underline"
          >
            All staff picks
          </Link>
        </div>
        {featured.length === 0 ? (
          <EmptyState
            title="No staff picks yet"
            body="The first verified share links will land here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((template) => (
              <BotCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-3xl tracking-tight">Jobs</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/templates?category=${encodeURIComponent(category)}`}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl tracking-tight">Hot from the community</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked by votes. Anyone can paste a share link — no account.
            </p>
          </div>
          <Link href="/templates?origin=community" className="text-sm text-primary hover:underline">
            Full board
          </Link>
        </div>
        {community.length === 0 ? (
          <EmptyState
            title="The community shelf is empty"
            body="Got a Grok Bot share link? Paste it and it shows up here for everyone else."
            actionHref="/upload"
            actionLabel="Paste a share link"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {community.map((template) => (
              <BotCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
