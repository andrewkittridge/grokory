"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/templates", label: "Browse" },
  { href: "/upload", label: "Share a bot" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-xl tracking-tight">Grokory</span>
          <span className="hidden text-[11px] tracking-[0.18em] text-muted-foreground uppercase sm:inline">
            Grok Bot library
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
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="sm:hidden" />
            }
          >
            <Menu />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background">
            <SheetHeader>
              <SheetTitle className="font-heading text-left text-xl">
                Grokory
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {links.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="justify-start"
                  nativeButton={false}
                  render={<Link href={link.href} />}
                >
                  {link.label}
                </Button>
              ))}
              <Button nativeButton={false} render={<Link href="/upload" />}>
                Paste a share link
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
