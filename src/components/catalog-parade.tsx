"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogLane } from "@/components/catalog-lane";
import { clearGrokBotGaze, gazeGrokBot } from "@/components/grok-bot";
import { Button } from "@/components/ui/button";
import { categoryAnchor, type CatalogToken } from "@/lib/templates";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export type CatalogLaneData = {
  category: Category;
  tokens: CatalogToken[];
};

export function CatalogParade({ lanes }: { lanes: CatalogLaneData[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<Category | null>(
    lanes[0]?.category ?? null
  );

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

  useEffect(() => {
    const sections = lanes
      .map((lane) => document.getElementById(categoryAnchor(lane.category)))
      .filter((node): node is HTMLElement => Boolean(node));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.id;
        const lane = lanes.find(
          (item) => categoryAnchor(item.category) === id
        );
        if (lane) setActive(lane.category);
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0.12, 0.3, 0.55] }
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [lanes]);

  return (
    <div
      ref={rootRef}
      className="catalog-parade"
      data-paused={paused ? "true" : "false"}
      data-hidden={hidden ? "true" : "false"}
    >
      <div className="catalog-chips">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2.5 sm:px-6">
          <nav
            aria-label="Jobs"
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
          >
            {lanes.map((lane) => {
              const listed = lane.tokens.some((token) => token.kind === "listed");
              const isActive = active === lane.category;
              return (
                <a
                  key={lane.category}
                  href={`#${categoryAnchor(lane.category)}`}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.14em] uppercase focus-visible:ring-1 focus-visible:ring-foreground",
                    isActive
                      ? "bg-canvas-soft text-foreground"
                      : listed
                        ? "text-foreground hover:bg-canvas-soft"
                        : "text-muted-foreground hover:bg-canvas-soft hover:text-foreground"
                  )}
                  onClick={() => setActive(lane.category)}
                >
                  {lane.category}
                </a>
              );
            })}
          </nav>
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
          key={lane.category}
          category={lane.category}
          tokens={lane.tokens}
          index={index}
        />
      ))}
    </div>
  );
}
