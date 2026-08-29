import Link from "next/link";
import { Menu } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-baseline gap-2">
          <span className="font-heading text-xl tracking-tight">Grokory</span>
          <span className="hidden text-[11px] tracking-[0.18em] text-muted-foreground uppercase lg:inline">
            Grok Bot board
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/templates"
            className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium hover:bg-muted"
          >
            Browse
          </Link>
          <Link
            href="/upload"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Paste a share link
          </Link>
        </nav>
        <details className="group relative lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium hover:bg-muted [&::-webkit-details-marker]:hidden">
            <Menu className="size-4" aria-hidden="true" />
            Menu
          </summary>
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
            <nav className="flex flex-col p-1.5">
              <Link
                href="/templates"
                className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                Browse
              </Link>
              <Link
                href="/upload"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Paste a share link
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
