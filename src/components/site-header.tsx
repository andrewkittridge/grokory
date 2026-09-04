"use client";

import { ViewTransition } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { SiteSearch } from "@/components/site-search";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/motion";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/templates",
    label: "Board",
    match: (path: string) => path.startsWith("/templates"),
  },
  {
    href: "/catalog",
    label: "Catalog",
    match: (path: string) => path === "/catalog",
  },
  {
    href: "/authors",
    label: "Authors",
    match: (path: string) => path.startsWith("/authors"),
  },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const catalog = pathname === "/catalog";
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
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="group/mark flex min-w-0 shrink-0 items-center gap-2.5"
        >
          <BrandMark className="site-brand-mark size-[1.15rem] text-foreground" />
          <span className="font-heading text-[1.05rem] tracking-tight">
            Grokdex
          </span>
        </Link>
        {catalog ? (
          <div className="min-w-0 flex-1" />
        ) : (
          <HeaderSearch className="mx-1 min-w-0 flex-1 sm:mx-2" />
        )}
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <HeaderLink
              key={item.href}
              href={item.href}
              active={item.match(pathname)}
            >
              {item.label}
            </HeaderLink>
          ))}
          <HeaderLink
            href="/upload"
            active={pathname === "/upload"}
            primary={pathname !== "/"}
          >
            Share a bot
          </HeaderLink>
        </nav>
        <details className="group relative ml-auto lg:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-full border border-pill-border px-3 py-1.5 text-sm text-foreground hover:bg-canvas-soft focus-visible:ring-1 focus-visible:ring-foreground [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <div className="absolute right-0 z-50 mt-2 w-64 border border-border bg-background p-2">
            <nav className="flex flex-col">
              {NAV.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start"
                  nativeButton={false}
                  render={<Link href={item.href} />}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                className="w-full"
                variant={pathname === "/" ? "outline" : "default"}
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

function HeaderSearch({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const q = hydrated
    ? new URLSearchParams(window.location.search).get("q") ?? ""
    : "";
  return (
    <SiteSearch
      key={hydrated ? `q:${q}` : "ssr"}
      defaultValue={q}
      className={className}
    />
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
