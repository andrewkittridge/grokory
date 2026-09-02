import { BotListPaste } from "@/components/bot-list-paste";
import { Frame } from "@/components/frame";
import { LockTitle } from "@/components/lock-title";
import { UploadForm } from "@/components/upload-form";
import { isFoundingBoard } from "@/lib/founding";
import { listTemplates } from "@/lib/templates-store";
import { turnstileSiteKey } from "@/lib/turnstile";
import { motionDelay } from "@/lib/utils";

export const metadata = {
  title: "Share a Grok Bot",
  description:
    "Paste an x.ai/bot share link. It lists on the Grokdex board immediately. No account.",
  alternates: { canonical: "/upload" },
};

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
    <main className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-16">
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
        className="motion-enter mt-5 text-body leading-7"
        style={motionDelay(2)}
      >
        {founding
          ? "The board just opened. Paste a public share link — "
          : "Grok Bot templates are public URLs — "}
        <span className="font-mono text-sm text-foreground">
          https://x.ai/bot/…
        </span>
        . It lists immediately. Listing is free. Already listed? Paste the same
        link to refresh it from x.ai or change the tags or note.
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
    </main>
  );
}
