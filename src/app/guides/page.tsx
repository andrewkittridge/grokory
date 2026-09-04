import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { LockTitle } from "@/components/lock-title";
import { Button } from "@/components/ui/button";
import { GUIDES } from "@/lib/guides";
import { breadcrumbListJson, guideListJson } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/site";
import { motionDelay } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Guides",
  description:
    "How to list a Grok Bot on Grokdex, add a copy to your Grok account, update a listing, add an X handle, or list via MCP.",
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-16">
      <JsonLd
        data={guideListJson(
          GUIDES.map((guide) => ({ name: guide.title, path: guide.path }))
        )}
      />
      <JsonLd
        data={breadcrumbListJson([
          { name: "Grokdex", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
      <p
        className="motion-enter font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
        style={motionDelay(0)}
      >
        Guides
      </p>
      <LockTitle delay={1} className="mt-4">
        Guides
      </LockTitle>
      <p
        className="motion-enter mt-5 text-sm leading-7 text-body"
        style={motionDelay(2)}
      >
        How to list a public share link, add a copy on x.ai, and keep a listing
        accurate. Grokdex is independent. It is not affiliated with xAI.
      </p>
      <ol className="mt-10 space-y-3">
        {GUIDES.map((guide, index) => (
          <li key={guide.slug}>
            <Link
              href={guide.path}
              className="motion-enter block rounded-lg border border-border bg-card p-5 hover:bg-canvas-soft focus-visible:ring-1 focus-visible:ring-foreground sm:p-6"
              style={motionDelay(3 + index)}
            >
              <span className="block font-heading text-lg tracking-tight text-foreground">
                {guide.title}
              </span>
              <span className="mt-2 block text-sm leading-6 text-body">
                {guide.description}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="motion-enter mt-10" style={motionDelay(10)}>
        <Button
          size="lg"
          className="min-h-12 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href="/guides/how-to-list" />}
        >
          How to list
        </Button>
      </div>
    </main>
  );
}
