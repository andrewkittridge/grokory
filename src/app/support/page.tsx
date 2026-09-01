import type { Metadata } from "next";
import { Frame } from "@/components/frame";
import { TipForm } from "@/components/tip-form";
import { isStripeConfigured } from "@/lib/stripe";
import { motionDelay } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Support Grokdex",
  description:
    "Optional tip to keep the Grokdex board up. Not tax-deductible. Listing a bot stays free.",
  alternates: { canonical: "/support" },
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ tipped?: string }>;
}) {
  const tipped = (await searchParams).tipped === "1";
  const enabled = isStripeConfigured();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-16">
      <p
        className="motion-enter font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
        style={motionDelay(0)}
      >
        Optional
      </p>
      <h1 className="display-page motion-enter mt-4" style={motionDelay(1)}>
        Keep the board up.
      </h1>
      <p
        className="motion-enter mt-5 text-body leading-7"
        style={motionDelay(2)}
      >
        Grokdex is free to browse and list. A tip is optional. It is not
        tax-deductible, and it does not feature a bot or change rank.
      </p>
      <div className="motion-enter mt-10" style={motionDelay(3)}>
        <Frame staticFrame matClassName="p-5 sm:p-8">
          {tipped ? (
            <p className="text-sm leading-6 text-body">
              Tip received. Thank you — the board stays public.
            </p>
          ) : null}
          {enabled ? (
            <div className={tipped ? "mt-6" : undefined}>
              <TipForm />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tips are not wired on this host yet.
            </p>
          )}
        </Frame>
      </div>
    </main>
  );
}
