import type { ReactNode } from "react";
import { motionDelay } from "@/lib/utils";

export function LegalDoc({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-16">
      <p
        className="motion-enter font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
        style={motionDelay(0)}
      >
        {kicker}
      </p>
      <h1
        className="display-page motion-enter mt-4"
        style={motionDelay(1)}
      >
        {title}
      </h1>
      <p
        className="motion-enter mt-3 text-sm text-muted-foreground"
        style={motionDelay(2)}
      >
        Last updated {updated}
      </p>
      <div className="mt-8 space-y-6 text-sm leading-7 text-body [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:hover:underline [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-normal [&_h2]:tracking-tight [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </main>
  );
}
