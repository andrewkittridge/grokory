"use client";

import { ViewTransition } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { boardSearchHref } from "@/lib/lane";
import { cn } from "@/lib/utils";

function hrefFor(params: {
  q?: string;
  tag?: string;
  skill?: string;
  sort?: string;
  lane?: string;
}) {
  return boardSearchHref(params);
}

export function BotFilters({
  q,
  tag,
  skill,
  sort,
  lane,
  sortTabs = true,
}: {
  q: string;
  tag?: string;
  skill?: string;
  sort: string;
  lane?: string;
  sortTabs?: boolean;
}) {
  if (!sortTabs && !tag && !skill) return null;

  return (
    <div className="space-y-5">
      {sortTabs ? (
        <div className="flex gap-0 border-b border-border/80">
          {[
            { value: "hot", label: "Hot" },
            { value: "top", label: "Top" },
            { value: "new", label: "New" },
          ].map((item) => (
            <FilterTab
              key={item.value}
              href={hrefFor({ q, tag, skill, lane, sort: item.value })}
              active={(sort || "hot") === item.value}
            >
              {item.label}
            </FilterTab>
          ))}
        </div>
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
          <FilterText href={hrefFor({ q, sort, skill, lane })} active={false}>
            Clear
          </FilterText>
        </p>
      ) : null}
      {skill ? (
        <p className="text-sm leading-7 text-muted-foreground">
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
            Skill
          </span>{" "}
          <span className="text-foreground">{skill}</span>
          <span className="text-border" aria-hidden="true">
            {" · "}
          </span>
          <FilterText href={hrefFor({ q, sort, tag, lane })} active={false}>
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
        "relative -mb-px border-b px-2.5 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase focus-visible:ring-1 focus-visible:ring-foreground",
        active
          ? "border-transparent text-foreground"
          : "border-transparent text-muted-foreground/80 hover:text-foreground"
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
