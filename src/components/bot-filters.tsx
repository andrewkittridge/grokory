import Link from "next/link";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

function hrefFor(params: {
  q?: string;
  category?: string;
  origin?: string;
  sort?: string;
}) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category && params.category !== "all") {
    search.set("category", params.category);
  }
  if (params.origin && params.origin !== "all") {
    search.set("origin", params.origin);
  }
  if (params.sort && params.sort !== "hot") {
    search.set("sort", params.sort);
  }
  const qs = search.toString();
  return qs ? `/templates?${qs}` : "/templates";
}

export function BotFilters({
  q,
  category,
  origin,
  sort,
  jobs,
  showOrigin,
}: {
  q: string;
  category: string;
  origin: string;
  sort: string;
  jobs: Category[];
  showOrigin: boolean;
}) {
  return (
    <div className="space-y-5">
      <form action="/templates" className="flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="origin" value={origin} />
        <input type="hidden" name="sort" value={sort} />
        <label className="sr-only" htmlFor="q">
          Search bots
        </label>
        <Input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search names, authors, jobs…"
          className="h-10 font-mono"
        />
        <Button type="submit" variant="outline" className="h-10 rounded-none sm:w-auto">
          Search
        </Button>
      </form>
      <div className="flex gap-0 border-b border-border">
        {[
          { value: "hot", label: "Hot" },
          { value: "top", label: "Top" },
          { value: "new", label: "New" },
        ].map((item) => (
          <FilterTab
            key={item.value}
            href={hrefFor({ q, category, origin, sort: item.value })}
            active={(sort || "hot") === item.value}
          >
            {item.label}
          </FilterTab>
        ))}
      </div>
      {jobs.length > 0 ? (
        <p className="text-sm leading-7 text-muted-foreground">
          <FilterText
            href={hrefFor({ q, origin, sort, category: "all" })}
            active={!category || category === "all"}
          >
            All jobs
          </FilterText>
          {jobs.map((item) => (
            <span key={item}>
              <span className="text-border" aria-hidden="true">
                {" · "}
              </span>
              <FilterText
                href={hrefFor({ q, origin, sort, category: item })}
                active={category === item}
              >
                {item}
              </FilterText>
            </span>
          ))}
        </p>
      ) : null}
      {showOrigin ? (
        <p className="text-sm leading-7 text-muted-foreground">
          {[
            { value: "all", label: "Everyone" },
            { value: "curated", label: "Staff picks" },
            { value: "community", label: "Community" },
          ].map((item, index) => (
            <span key={item.value}>
              {index > 0 ? (
                <span className="text-border" aria-hidden="true">
                  {" · "}
                </span>
              ) : null}
              <FilterText
                href={hrefFor({ q, category, sort, origin: item.value })}
                active={(origin || "all") === item.value}
              >
                {item.label}
              </FilterText>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

function FilterTab({
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
        "-mb-px border-b px-3 py-2 font-mono text-xs tracking-[0.16em] uppercase focus-visible:ring-1 focus-visible:ring-foreground",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

function FilterText({
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
        "focus-visible:ring-1 focus-visible:ring-foreground",
        active ? "text-foreground" : "hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
