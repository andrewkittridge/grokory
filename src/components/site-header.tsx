import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group/mark flex min-w-0 items-center gap-2.5">
          <BrandMark className="size-[1.15rem] text-foreground" />
          <span className="text-[15px] font-normal tracking-tight">Grokdex</span>
          <span className="hidden font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase lg:inline">
            Ranked Grok Bots
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/templates" />}
          >
            Browse
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/upload" />}
          >
            Share a bot
          </Button>
        </nav>
        <details className="group relative lg:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-full border border-pill-border px-3 py-1.5 text-sm text-foreground hover:bg-canvas-soft focus-visible:ring-1 focus-visible:ring-foreground [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-border bg-popover p-1">
            <nav className="flex flex-col">
              <Button
                variant="ghost"
                className="w-full justify-start"
                nativeButton={false}
                render={<Link href="/templates" />}
              >
                Browse
              </Button>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/upload" />}
              >
                Share a bot
              </Button>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
