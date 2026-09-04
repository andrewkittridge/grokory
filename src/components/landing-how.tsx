import Link from "next/link";
import { BotListPaste } from "@/components/bot-list-paste";
import { LandingSectionHeading } from "@/components/landing-section-heading";
import { Button } from "@/components/ui/button";
import { cn, motionDelay } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "Find a public bot",
    body: "Browse Hot, Top, or New. Open a listing to read the job before you add it.",
    href: "/templates",
    action: "Board",
  },
  {
    n: "02",
    title: "Preview, then Add",
    body: "Preview opens the share on x.ai. Add copies the template onto your Grok account. Not the author’s computer or logins.",
    href: "/templates",
    action: "Add",
  },
  {
    n: "03",
    title: "List yours",
    body: "Paste a public x.ai/bot link. It ranks immediately. No account. Same URL later refreshes the listing.",
    href: "/upload",
    action: "Share",
  },
] as const;

export function LandingHow() {
  return (
    <section className="mt-16 sm:mt-20">
      <LandingSectionHeading
        kicker="How it works"
        title="Three moves."
        description="Browse like a board. Add like x.ai. List like an agent."
        action={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/guides" />}
          >
            Guides
          </Button>
        }
      />
      <ol className="border-y border-border">
        {STEPS.map((step, index) => (
          <li
            key={step.n}
            className="motion-enter relative flex items-start gap-3 border-b border-border py-5 last:border-b-0 hover:bg-canvas-soft sm:gap-4"
            style={motionDelay(index)}
          >
            <Link
              href={step.href}
              className="absolute inset-0 z-0 focus-visible:ring-1 focus-visible:ring-foreground"
              aria-label={step.title}
            />
            <span
              className={cn(
                "relative z-10 w-8 shrink-0 pt-1 font-mono text-xs tabular-nums tracking-wide",
                index === 0 ? "text-sunset" : "text-muted-foreground"
              )}
            >
              {step.n}
            </span>
            <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
              <h3 className="font-heading text-xl tracking-tight">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-body">{step.body}</p>
            </div>
            <span className="pointer-events-none relative z-10 hidden shrink-0 self-center font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase sm:inline">
              {step.action}
              <span aria-hidden="true"> →</span>
            </span>
          </li>
        ))}
      </ol>
      <div
        className="motion-enter mt-10 border-t border-border pt-6"
        style={motionDelay(4)}
      >
        <BotListPaste compact />
      </div>
    </section>
  );
}
