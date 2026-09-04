"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHydrated, usePrefersReducedMotion } from "@/lib/motion";

const HINTS = [
  "Whistle for a bot…",
  "Call a name…",
  "Find @handle…",
  "Who researches?",
  "Who writes copy?",
];

export function CatalogSearch({
  q,
  hits,
  searching,
  onQuery,
  onWhistle,
}: {
  q: string;
  hits: number;
  searching: boolean;
  onQuery: (value: string) => void;
  onWhistle: () => void;
}) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const [focused, setFocused] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    if (!hydrated || reduced || q || focused) return;
    const id = window.setInterval(() => {
      setHintIndex((index) => (index + 1) % HINTS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [focused, hydrated, q, reduced]);

  const status = searching
    ? hits === 0
      ? "Nobody hopped"
      : hits === 1
        ? "1 hopped"
        : `${hits} hopped`
    : "";

  return (
    <form
      action="/catalog"
      role="search"
      className="flex min-w-0 flex-1 items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onWhistle();
      }}
    >
      <label className="sr-only" htmlFor="catalog-q">
        Whistle for a bot
      </label>
      <div className="relative min-w-0 flex-1">
        <Input
          id="catalog-q"
          name="q"
          value={q}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={HINTS[hydrated ? hintIndex : 0]}
          className="h-8 font-mono text-sm"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => onQuery(event.target.value)}
        />
      </div>
      <Button type="submit" size="sm" variant="ghost" className="shrink-0">
        Whistle
      </Button>
      {q ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="hidden shrink-0 sm:inline-flex"
          onClick={() => onQuery("")}
        >
          Clear
        </Button>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      {status ? (
        <p
          aria-hidden="true"
          className="hidden shrink-0 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase sm:block"
        >
          {status}
        </p>
      ) : null}
    </form>
  );
}
