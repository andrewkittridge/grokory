"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [{ href: "/templates", label: "Browse" }];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setMenuOpen(false)}>
          <span className="font-heading text-xl tracking-tight">Grokory</span>
          <span className="hidden text-[11px] tracking-[0.18em] text-muted-foreground uppercase sm:inline">
            Grok Bot board
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
          <Button size="sm" nativeButton={false} render={<Link href="/upload" />}>
            Paste a share link
          </Button>
        </nav>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg text-foreground sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      {menuOpen ? (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-14 z-50 border-b border-border bg-background shadow-lg sm:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <Link
              href="/templates"
              className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              href="/upload"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => setMenuOpen(false)}
            >
              Paste a share link
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
