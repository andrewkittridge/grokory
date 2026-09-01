import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 border-b border-border py-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-foreground">
            <BrandMark className="size-4" />
            <span className="text-sm tracking-tight">Grokdex</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link
              href="/templates"
              className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
            >
              Browse
            </Link>
            <Link
              href="/upload"
              className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
            >
              Share
            </Link>
            <a
              href="https://x.ai/bot"
              className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              x.ai/bot
            </a>
            <a
              href="/feed.xml"
              className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
            >
              RSS
            </a>
            <Link
              href="/support"
              className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
            >
              Support
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
            >
              Terms
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-3 py-5 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Grokdex indexes public{" "}
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
          <Link
            href="/upload"
            className="shrink-0 font-mono tracking-wide text-foreground uppercase hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
          >
            Share yours
          </Link>
        </div>
      </div>
    </footer>
  );
}
