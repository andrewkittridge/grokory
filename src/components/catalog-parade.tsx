"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CatalogLane } from "@/components/catalog-lane";
import { CatalogSearch } from "@/components/catalog-search";
import { clearGrokBotGaze, gazeGrokBot, hopGrokBot } from "@/components/grok-bot";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/lib/motion";
import {
  catalogListedHitCount,
  catalogTokenMatches,
  type CatalogToken,
} from "@/lib/templates";

export type CatalogLaneData = {
  id: string;
  tokens: CatalogToken[];
};

export function CatalogParade({
  lanes,
  initialQuery = "",
}: {
  lanes: CatalogLaneData[];
  initialQuery?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [q, setQ] = useState(initialQuery);
  const [hopNonce, setHopNonce] = useState(0);
  const searching = q.trim().length > 0;
  const hits = useMemo(
    () =>
      lanes.reduce(
        (total, lane) => total + catalogListedHitCount(lane.tokens, q),
        0
      ),
    [lanes, q]
  );
  const hitKey = useMemo(
    () =>
      lanes
        .flatMap((lane) => lane.tokens)
        .filter(
          (token) => token.kind === "listed" && catalogTokenMatches(token, q)
        )
        .map((token) => token.key)
        .join("|"),
    [lanes, q]
  );

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const current = url.searchParams.get("q") ?? "";
    if (q === current) return;
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(null, "", next);
  }, [q]);

  useEffect(() => {
    if (reduced) return;
    if (!searching && hopNonce === 0) return;
    const timeouts: number[] = [];
    const frame = window.requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const bots = root.querySelectorAll<HTMLElement>(
        searching
          ? '[data-catalog-hit="true"] .catalog-bot-figure'
          : ".catalog-bot-figure"
      );
      bots.forEach((el, index) => {
        timeouts.push(
          window.setTimeout(() => hopGrokBot(el, reduced), index * 55)
        );
      });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      for (const id of timeouts) window.clearTimeout(id);
    };
  }, [hitKey, hopNonce, reduced, searching]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let current: HTMLElement | null = null;
    const botOf = (token: HTMLElement | null) =>
      token?.querySelector<HTMLElement>(".grok-bot") ?? null;

    const onMove = (event: PointerEvent) => {
      const token = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-catalog-token]"
      );
      if (!token || !root.contains(token)) {
        if (current) {
          clearGrokBotGaze(botOf(current));
          current = null;
        }
        return;
      }
      if (current && current !== token) {
        clearGrokBotGaze(botOf(current));
      }
      current = token;
      gazeGrokBot(botOf(token), event.clientX, event.clientY);
    };

    const onLeave = () => {
      if (!current) return;
      clearGrokBotGaze(botOf(current));
      current = null;
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="catalog-parade"
      data-paused={paused ? "true" : "false"}
      data-hidden={hidden ? "true" : "false"}
      data-query={searching ? "true" : "false"}
    >
      {lanes[0] ? (
        <CatalogLane
          key={lanes[0].id}
          id={lanes[0].id}
          tokens={lanes[0].tokens}
          index={0}
          query={q}
        />
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <CatalogSearch
          q={q}
          hits={hits}
          searching={searching}
          onQuery={setQ}
          onWhistle={() => setHopNonce((value) => value + 1)}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="shrink-0"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Play" : "Pause"}
        </Button>
      </div>
      {lanes.slice(1).map((lane, index) => (
        <CatalogLane
          key={lane.id}
          id={lane.id}
          tokens={lane.tokens}
          index={index + 1}
          query={q}
        />
      ))}
    </div>
  );
}
