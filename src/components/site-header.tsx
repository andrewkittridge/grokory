"use client";

import { ViewTransition } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [dense, setDense] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setDense(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm",
        dense && "header-dense"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group/mark flex min-w-0 items-center gap-2.5">
          <BrandMark className="site-brand-mark size-[1.15rem] text-foreground" />
          <span className="text-[15px] font-normal tracking-tight">
            Grokdex
          </span>
          <span className="hidden font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase lg:inline">
            Public Grok Bots
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <HeaderLink
            href="/templates"
            active={pathname.startsWith("/templates")}
          >
            Browse
          </HeaderLink>
          <HeaderLink href="/upload" active={pathname === "/upload"} primary>
            Share a bot
          </HeaderLink>
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

function HeaderLink({
  href,
  active,
  primary,
  children,
}: {
  href: string;
  active: boolean;
  primary?: boolean;
  children: string;
}) {
  return (
    <Button
      variant={primary ? "default" : "ghost"}
      size="sm"
      nativeButton={false}
      className="relative"
      render={<Link href={href} />}
    >
      {children}
      {active && !primary ? (
        <ViewTransition name="nav-pip">
          <span className="nav-pip" aria-hidden="true" />
        </ViewTransition>
      ) : null}
    </Button>
  );
}
