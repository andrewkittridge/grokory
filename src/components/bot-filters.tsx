import { ViewTransition } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ScanField } from "@/components/scan-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

function hrefFor(params: {
  q?: string;
  category?: string;
  tag?: string;
  sort?: string;
}) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category && params.category !== "all") {
    search.set("category", params.category);
  }
  if (params.tag) search.set("tag", params.tag);
  if (params.sort && params.sort !== "hot") {
    search.set("sort", params.sort);
  }
  const qs = search.toString();
  return qs ? `/templates?${qs}` : "/templates";
}

export function BotFilters({
  q,
  category,
  tag,
  sort,
  jobs,
}: {
  q: string;
  category: string;
  tag?: string;
  sort: string;
  jobs: Category[];
}) {
  return (
    <div className="space-y-5">
      <form action="/templates" className="flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="category" value={category} />
        {tag ? <input type="hidden" name="tag" value={tag} /> : null}
        <input type="hidden" name="sort" value={sort} />
        <label className="sr-only" htmlFor="q">
          Search bots
        </label>
        <ScanField>
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search names, authors, jobs…"
            className="h-10 font-mono"
          />
        </ScanField>
        <Button type="submit" variant="outline" className="h-10 sm:w-auto">
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
            href={hrefFor({ q, category, tag, sort: item.value })}
            active={(sort || "hot") === item.value}
          >
            {item.label}
          </FilterTab>
        ))}
      </div>
      {jobs.length > 0 ? (
        <p className="text-sm leading-7 text-muted-foreground">
          <FilterText
            href={hrefFor({ q, sort, tag, category: "all" })}
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
                href={hrefFor({ q, sort, tag, category: item })}
                active={category === item}
              >
                {item}
              </FilterText>
            </span>
          ))}
        </p>
      ) : null}
      {tag ? (
        <p className="text-sm leading-7 text-muted-foreground">
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
            Tag
          </span>{" "}
          <span className="text-foreground">{tag}</span>
          <span className="text-border" aria-hidden="true">
            {" · "}
          </span>
          <FilterText href={hrefFor({ q, sort, category })} active={false}>
            Clear
          </FilterText>
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
        "relative -mb-px border-b px-3 py-2 font-mono text-xs tracking-[0.16em] uppercase focus-visible:ring-1 focus-visible:ring-foreground",
        active
          ? "border-transparent text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {active ? (
        <ViewTransition name="sort-pip">
          <span className="nav-pip" aria-hidden="true" />
        </ViewTransition>
      ) : null}
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
