import Link from "next/link";
import { authorSlug, formatCheckedAt, reportMailto } from "@/lib/bot-url";
import type { ListedTemplate } from "@/lib/types";

export function ListingTrust({
  template,
  listingUrl,
}: {
  template: ListedTemplate;
  listingUrl: string;
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
        Preview on x.ai before you add. Adds count clicks, not confirmed
        installs.
      </p>
      <p className="flex flex-wrap gap-x-3 gap-y-1">
        <a
          href={template.botUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
        >
          Preview on x.ai
        </a>
        <a
          href={report}
          className="hover:text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
        >
          Report
        </a>
      </p>
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
        <LabeledList label="Skills" items={skills} />
      ) : null}
      {routines.length > 0 ? (
        <LabeledList label="Routines" items={routines} />
      ) : null}
      {skills.length === 0 && routines.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          x.ai does not list skills or routines on the public share page.
          Preview the template there before you add.
        </p>
      ) : null}
    </div>
  );
}

function LabeledList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-pill-border px-2.5 py-1 font-mono text-[11px] text-foreground"
          >
            {item}
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
