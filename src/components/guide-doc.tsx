import type { ReactNode } from "react";
import Link from "next/link";
import { LockTitle } from "@/components/lock-title";
import { Button } from "@/components/ui/button";
import type { Guide, GuideBlock } from "@/lib/guides";
import { motionDelay } from "@/lib/utils";

const TOKEN =
  /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*)/g;

export function GuideDoc({
  guide,
  extras,
}: {
  guide: Guide;
  extras?: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-16">
      {extras}
      <p
        className="motion-enter font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase"
        style={motionDelay(0)}
      >
        <Link
          href="/guides"
          className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
        >
          {guide.kicker}
        </Link>
      </p>
      <LockTitle delay={1} className="mt-4">
        {guide.title}
      </LockTitle>
      <div className="mt-8 space-y-6 text-sm leading-7 text-body [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:hover:underline">
        {guide.body.map((block, index) => (
          <GuideBlockView key={index} block={block} />
        ))}
      </div>
      <div className="motion-enter mt-10" style={motionDelay(8)}>
        <Button
          size="lg"
          className="min-h-12 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={guide.cta.href} />}
        >
          {guide.cta.label}
        </Button>
      </div>
      {guide.related.length > 0 ? (
        <nav className="mt-10 border-t border-border pt-6">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Related
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {guide.related.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-foreground underline-offset-4 hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </main>
  );
}

function GuideBlockView({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <GuideText text={block.text} />
        </p>
      );
    case "h2":
      return (
        <h2 className="pt-4 text-lg font-normal tracking-tight text-foreground">
          {block.text}
        </h2>
      );
    case "ol":
      return (
        <ol className="space-y-3">
          {block.items.map((item, index) => (
            <li
              key={index}
              className="flex gap-4 rounded-lg border border-border bg-card p-4 sm:p-5"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-sunset font-mono text-sm tabular-nums text-sunset">
                {index + 1}
              </span>
              <p className="min-w-0 pt-1">
                <GuideText text={item} />
              </p>
            </li>
          ))}
        </ol>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-5">
          {block.items.map((item, index) => (
            <li key={index}>
              <GuideText text={item} />
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {block.kicker}
          </p>
          <div className="mt-3 space-y-3">
            {block.paragraphs.map((paragraph, index) => (
              <p key={index}>
                <GuideText text={paragraph} />
              </p>
            ))}
          </div>
        </div>
      );
  }
}

export function GuideText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    if (match[2] && match[3]) {
      const href = match[3];
      const external = href.startsWith("http");
      parts.push(
        external ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[2]}
          </a>
        ) : (
          <Link key={key} href={href}>
            {match[2]}
          </Link>
        )
      );
    } else if (match[4]) {
      parts.push(
        <code key={key} className="font-mono text-[0.9em] text-foreground">
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      parts.push(
        <strong key={key} className="font-normal text-foreground">
          {match[5]}
        </strong>
      );
    }
    key += 1;
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
