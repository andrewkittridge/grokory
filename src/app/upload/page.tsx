import { BotListPaste } from "@/components/bot-list-paste";
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
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="cmd motion-enter" style={motionDelay(0)}>
        {founding ? "just opened · no account" : "no account"}
      </p>
      <LockTitle delay={1} className="mt-4">
        Paste a public link.
      </LockTitle>
      <p
        className="motion-enter mt-5 max-w-xl text-body leading-7"
        style={motionDelay(2)}
      >
        {founding ? "The board just opened. " : null}
        Drop a share URL. We pull the name, description, and silhouette from
        x.ai. It lists immediately. Free.
      </p>
      <p
        className="motion-enter mt-3 font-mono text-sm text-foreground"
        style={motionDelay(3)}
      >
        https://x.ai/bot/…
      </p>
      <div className="motion-enter mt-10" style={motionDelay(4)}>
        <UploadForm
          siteKey={turnstileSiteKey()}
          defaultShareUrl={share || undefined}
        />
      </div>
      <div
        className="motion-enter mt-10 border-t border-border pt-6"
        style={motionDelay(5)}
      >
        <BotListPaste compact />
      </div>
    </main>
  );
}
