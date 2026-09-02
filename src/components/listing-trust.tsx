import type { ReactNode } from "react";
import Link from "next/link";
import { ShareListing } from "@/components/share-listing";
import {
  addHandleHref,
  authorSlug,
  formatCheckedAt,
  reportMailto,
  xHandleLabel,
  xHandleUrl,
} from "@/lib/bot-url";
import type { ListedTemplate } from "@/lib/types";

export function ListingTrust({
  template,
  listingUrl,
  refresh,
}: {
  template: ListedTemplate;
  listingUrl: string;
  refresh?: ReactNode;
}) {
  const report = reportMailto({
    title: template.title,
    slug: template.slug,
    botUrl: template.botUrl,
    listingUrl,
  });

  return (
    <div className="space-y-3 text-xs leading-5 text-muted-foreground">
      <p>
        <span
          className={
            template.live ? "text-foreground" : "text-destructive"
          }
        >
          {template.live ? "Live share link" : "Share link is down"}
        </span>
        {" · "}
        {formatCheckedAt(template.lastCheckedAt)}
      </p>
      <p>
        Adds count clicks, not confirmed installs.
      </p>
      <ShareListing
        title={template.title}
        listingUrl={listingUrl}
        xHandle={template.xHandle}
        summary={template.summary}
        compact
      />
      <p className="flex flex-wrap gap-x-3 gap-y-1">
        <a
          href={report}
          className="hover:text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
        >
          Report
        </a>
      </p>
      {refresh ? (
        <details className="pt-1">
          <summary className="cursor-pointer hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground">
            Refresh from x.ai
          </summary>
          <div className="mt-2">{refresh}</div>
        </details>
      ) : null}
    </div>
  );
}

export function WhatTravels({
  skills,
  routines,
}: {
  skills: string[];
  routines: string[];
}) {
  if (skills.length === 0 && routines.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        What gets copied
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        A template copies identity, description, skills, and routines onto your
        Grok account. It does not share the author’s computer, logins, or
        chats.
      </p>
      {skills.length > 0 ? (
        <LabeledList
          label="Skills"
          items={skills}
          hrefFor={(item) => `/templates?skill=${encodeURIComponent(item)}`}
        />
      ) : null}
      {routines.length > 0 ? (
        <LabeledList label="Routines" items={routines} />
      ) : null}
    </div>
  );
}

function LabeledList({
  label,
  items,
  hrefFor,
}: {
  label: string;
  items: string[];
  hrefFor?: (item: string) => string;
}) {
  return (
    <div className="mt-4">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li key={item}>
            {hrefFor ? (
              <Link
                href={hrefFor(item)}
                className="inline-flex rounded-full border border-pill-border px-2.5 py-1 font-mono text-[11px] text-foreground hover:bg-canvas-soft focus-visible:ring-1 focus-visible:ring-foreground"
              >
                {item}
              </Link>
            ) : (
              <span className="inline-flex rounded-full border border-pill-border px-2.5 py-1 font-mono text-[11px] text-foreground">
                {item}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AuthorLink({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <Link
      href={`/authors/${encodeURIComponent(authorSlug(name))}`}
      className={className}
    >
      {name}
    </Link>
  );
}

export function XHandleLink({
  handle,
  className,
}: {
  handle: string;
  className?: string;
}) {
  return (
    <a
      href={xHandleUrl(handle)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {xHandleLabel(handle)}
    </a>
  );
}

export function AuthorByline({
  name,
  xHandle,
  shareUrl,
  className,
}: {
  name: string;
  xHandle?: string;
  shareUrl?: string;
  className?: string;
}) {
  return (
    <p className={className}>
      by{" "}
      <AuthorLink
        name={name}
        className="hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
      />
      {xHandle ? (
        <>
          {" · "}
          <XHandleLink
            handle={xHandle}
            className="hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
          />
        </>
      ) : shareUrl ? (
        <>
          {" · "}
          <Link
            href={addHandleHref(shareUrl)}
            className="text-muted-foreground hover:text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
          >
            add @handle
          </Link>
        </>
      ) : null}
    </p>
  );
}
