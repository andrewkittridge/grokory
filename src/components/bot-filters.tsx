import Link from "next/link";
import type { ReactNode } from "react";
import { CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

function hrefFor(params: {
  q?: string;
  category?: string;
  origin?: string;
}) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category && params.category !== "all") {
    search.set("category", params.category);
  }
  if (params.origin && params.origin !== "all") {
    search.set("origin", params.origin);
  }
  const qs = search.toString();
  return qs ? `/templates?${qs}` : "/templates";
}

export function BotFilters({
  q,
  category,
  origin,
}: {
  q: string;
  category: string;
  origin: string;
}) {
  return (
    <div className="space-y-4">
      <form action="/templates" className="flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="origin" value={origin} />
        <label className="sr-only" htmlFor="q">
          Search bots
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search names, authors, jobs…"
          className="h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Search
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          href={hrefFor({ q, origin, category: "all" })}
          active={!category || category === "all"}
        >
          All jobs
        </FilterChip>
        {CATEGORIES.map((item) => (
          <FilterChip
            key={item}
            href={hrefFor({ q, origin, category: item })}
            active={category === item}
          >
            {item}
          </FilterChip>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[
          { value: "all", label: "Everyone" },
          { value: "curated", label: "Staff picks" },
          { value: "community", label: "Community" },
        ].map((item) => (
          <FilterChip
            key={item.value}
            href={hrefFor({ q, category, origin: item.value })}
            active={(origin || "all") === item.value}
          >
            {item.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1 text-xs tracking-wide transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
