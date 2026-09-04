"use client";

import { ViewTransition } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { SiteSearch } from "@/components/site-search";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/motion";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import { JOBS } from "@/lib/visual";

const NAV = [
  {
    href: "/templates",
    label: JOBS.board,
    match: (path: string) => path.startsWith("/templates"),
  },
  {
    href: "/catalog",
    label: "Catalog",
    match: (path: string) => path === "/catalog",
  },
  {
    href: "/commons",
    label: JOBS.commons,
    match: (path: string) => path.startsWith("/commons"),
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
        "site-header sticky top-0 z-40 border-b border-border bg-background",
        dense && "header-dense"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="group/mark flex min-w-0 shrink-0 items-center gap-2.5"
        >
          <BrandMark className="site-brand-mark size-6" />
          <span
            className={cn(
              "font-heading text-[1.05rem] tracking-tight",
              !catalog && "max-sm:sr-only"
            )}
          >
            {SITE_NAME}
          </span>
        </Link>
        {catalog ? (
          <div className="min-w-0 flex-1" />
        ) : (
          <HeaderSearch className="mx-1 min-w-0 flex-1 sm:mx-2" />
        )}
        <nav className="ml-auto hidden h-14 items-stretch gap-5 lg:flex">
          {NAV.map((item) => (
            <HeaderLink
              key={item.href}
              href={item.href}
              active={item.match(pathname)}
            >
              {item.label}
            </HeaderLink>
          ))}
          <span className="flex items-center">
            <Button
              size="sm"
              variant={pathname === "/" ? "outline" : "default"}
              nativeButton={false}
              render={<Link href="/upload" />}
            >
              {JOBS.share}
            </Button>
          </span>
        </nav>
        <details className="group relative ml-auto lg:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-none border border-pill-border px-3 py-1.5 text-sm text-foreground hover:bg-canvas-soft focus-visible:ring-1 focus-visible:ring-foreground [&::-webkit-details-marker]:hidden">
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
                {JOBS.share}
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
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center font-mono text-[11px] tracking-[0.12em] lowercase text-muted-foreground hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground",
        active && "text-foreground"
      )}
    >
      {children}
      {active ? (
        <ViewTransition name="nav-pip">
          <span className="nav-pip" aria-hidden="true" />
        </ViewTransition>
      ) : null}
    </Link>
  );
}
