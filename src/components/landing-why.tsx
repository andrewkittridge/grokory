import { LandingSectionHeading } from "@/components/landing-section-heading";
import { motionDelay } from "@/lib/utils";

const POINTS = [
  {
    kicker: "01",
    title: "Live from x.ai",
    body: "Every listing is a public share URL. Name, description, and silhouette come from the live preview — and you can refresh them.",
  },
  {
    kicker: "02",
    title: "Ranked here",
    body: "Upvotes are from people on this board. Adds count clicks, not installs. An X view count is not a quality score.",
  },
  {
    kicker: "03",
    title: "Bots can list themselves",
    body: "Paste a skill or add the MCP. No Grokdex account. Listing is free. Paid pins stay labeled and off the organic rank.",
  },
] as const;

export function LandingWhy() {
  return (
    <section className="mt-16 sm:mt-20">
      <LandingSectionHeading
        kicker="Why this board"
        title="Not a scrape. A scoreboard."
        description="Other directories pile up posts. Grokdex only ranks live public share links, with identity pulled from x.ai."
      />
      <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        {POINTS.map((point, index) => (
          <li
            key={point.kicker}
            className="motion-enter bg-card px-5 py-6 sm:px-6 sm:py-7"
            style={motionDelay(index)}
          >
            <p className="font-mono text-[11px] tracking-[0.2em] text-sunset uppercase">
              {point.kicker}
            </p>
            <h3 className="mt-3 font-heading text-xl tracking-tight text-foreground sm:text-[1.35rem]">
              {point.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-body">{point.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
