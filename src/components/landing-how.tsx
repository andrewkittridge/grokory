import Link from "next/link";
import { BotListPaste } from "@/components/bot-list-paste";
import { LandingSectionHeading } from "@/components/landing-section-heading";
import { Button } from "@/components/ui/button";
import { motionDelay } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "Find a public bot",
    body: "Browse Hot, Top, or New. Open a listing to read the job before you add it.",
  },
  {
    n: "02",
    title: "Preview, then Add",
    body: "Preview opens the share on x.ai. Add copies the template onto your Grok account. Not the author’s computer or logins.",
  },
  {
    n: "03",
    title: "List yours",
    body: "Paste a public x.ai/bot link. It ranks immediately. No account. Same URL later refreshes the listing.",
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
      <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
        {STEPS.map((step, index) => (
          <li
            key={step.n}
            className="procedure-step motion-enter"
            data-step={step.n}
            style={motionDelay(index)}
          >
            <h3 className="font-heading text-xl tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-body">{step.body}</p>
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
