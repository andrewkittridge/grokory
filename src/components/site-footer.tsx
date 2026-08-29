import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Grokory indexes public{" "}
          <a
            href="https://x.ai/bot"
            className="text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Grok Bot
          </a>{" "}
          share links. Adding a bot on x.ai copies the template, not the author’s
          computer or logins.
        </p>
        <Link href="/upload" className="text-foreground hover:underline">
          Share yours
        </Link>
      </div>
    </footer>
  );
}
