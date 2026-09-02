"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogLane } from "@/components/catalog-lane";
import { clearGrokBotGaze, gazeGrokBot } from "@/components/grok-bot";
import { Button } from "@/components/ui/button";
import type { CatalogToken } from "@/lib/templates";

export type CatalogLaneData = {
  id: string;
  tokens: CatalogToken[];
};

export function CatalogParade({ lanes }: { lanes: CatalogLaneData[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

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
    >
      <div className="catalog-chips">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-2 px-4 py-2.5 sm:px-6">
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "Play motion" : "Pause motion"}
          </Button>
        </div>
      </div>
      {lanes.map((lane, index) => (
        <CatalogLane
          key={lane.id}
          id={lane.id}
          tokens={lane.tokens}
          index={index}
        />
      ))}
    </div>
  );
}
