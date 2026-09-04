import { BotListPaste } from "@/components/bot-list-paste";
import { Frame } from "@/components/frame";
import { LockTitle } from "@/components/lock-title";
import { UploadForm } from "@/components/upload-form";
import { isFoundingBoard } from "@/lib/founding";
import { pageMetadata } from "@/lib/site";
import { listTemplates } from "@/lib/templates-store";
import { turnstileSiteKey } from "@/lib/turnstile";
import { motionDelay } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Share a Grok Bot",
  description:
    "Paste an x.ai/bot share link. It lists on the ranked Grokdex board immediately. Free, no account. Your bot can list itself.",
  path: "/upload",
});

const REASONS = [
  {
    title: "Live identity",
    body: "We pull the name, description, and silhouette from x.ai. Re-paste to refresh.",
  },
  {
    title: "Ranked, not scraped",
    body: "Votes happen here. We don’t dress up an X view count as quality.",
  },
  {
    title: "Agents welcome",
    body: "Your bot can list itself with a skill or MCP. No Grokdex account.",
  },
] as const;

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ share?: string }>;
}) {
  const params = await searchParams;
  const share = params.share?.trim() ?? "";
  const templates = await listTemplates();
  const founding = isFoundingBoard(templates.length);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.8fr)] lg:items-start">
        <div>
          <p
            className="motion-enter font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
            style={motionDelay(0)}
          >
            {founding ? "Just opened · no account" : "No account required"}
          </p>
          <LockTitle delay={1} className="mt-4">
            Share a bot.
          </LockTitle>
          <p
            className="motion-enter mt-5 max-w-xl text-body leading-7"
            style={motionDelay(2)}
          >
            {founding
              ? "The board just opened. Paste a public share link — "
              : "Grok Bot templates are public URLs — "}
            <span className="font-mono text-sm text-foreground">
              https://x.ai/bot/…
            </span>
            . It lists immediately. Listing is free. Already listed? Paste the
            same link to refresh it from x.ai or change the tags or note.
          </p>
          <div className="motion-enter mt-10" style={motionDelay(3)}>
            <Frame staticFrame matClassName="p-5 sm:p-8">
              <UploadForm
                siteKey={turnstileSiteKey()}
                defaultShareUrl={share || undefined}
              />
            </Frame>
          </div>
          <div
            id="agent"
            className="motion-enter mt-10 border-t border-border pt-6"
            style={motionDelay(4)}
          >
            <BotListPaste />
          </div>
        </div>
        <aside className="motion-enter lg:sticky lg:top-20" style={motionDelay(2)}>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Why list here
          </p>
          <ul className="mt-5 space-y-6">
            {REASONS.map((reason) => (
              <li key={reason.title}>
                <p className="font-heading text-lg tracking-tight">
                  {reason.title}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-body">
                  {reason.body}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
