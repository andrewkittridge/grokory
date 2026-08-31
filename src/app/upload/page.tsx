import { Frame } from "@/components/frame";
import { UploadForm } from "@/components/upload-form";
import { motionDelay } from "@/lib/utils";

export const metadata = {
  title: "Share a Grok Bot",
  description:
    "Paste an x.ai/bot share link to list your Grok Bot template on Grokdex.",
};

export default function UploadPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      <p
        className="motion-enter font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
        style={motionDelay(0)}
      >
        No account required
      </p>
      <h1
        className="motion-enter mt-4 text-4xl font-normal tracking-tight sm:text-5xl"
        style={motionDelay(1)}
      >
        Share a bot.
      </h1>
      <p
        className="motion-enter mt-5 text-muted-foreground leading-7"
        style={motionDelay(2)}
      >
        Grok Bot templates travel as public URLs —{" "}
        <span className="font-mono text-sm text-foreground">
          https://x.ai/bot/…
        </span>
        . Drop yours here, add a category, and it lands on the board.
      </p>
      <div className="motion-enter mt-10" style={motionDelay(3)}>
        <Frame staticFrame matClassName="p-5 sm:p-8">
          <UploadForm />
        </Frame>
      </div>
    </main>
  );
}
