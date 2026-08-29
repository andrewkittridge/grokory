import { UploadForm } from "@/components/upload-form";

export const metadata = {
  title: "Share a Grok Bot",
  description:
    "Paste an x.ai/bot share link to list your Grok Bot template on Grokory.",
};

export default function UploadPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs tracking-[0.22em] text-primary uppercase">
        No account required
      </p>
      <h1 className="font-heading mt-3 text-4xl tracking-tight sm:text-5xl">
        Paste the share link.
      </h1>
      <p className="mt-4 text-muted-foreground leading-7">
        Grok Bot templates travel as public URLs —{" "}
        <span className="font-mono text-sm text-foreground">
          https://x.ai/bot/…
        </span>
        . Drop yours here, add a category, and it lands in the community shelf.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card/70 p-5 sm:p-7">
        <UploadForm />
      </div>
    </main>
  );
}
