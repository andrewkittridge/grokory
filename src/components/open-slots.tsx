"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankTick } from "@/components/telemetry";
import { useHydrated, usePrefersReducedMotion } from "@/lib/motion";
import { cn, motionDelay } from "@/lib/utils";
import type { BoardVacancy } from "@/lib/founding";

const DWELL_MS = 2000;

function isOpenSlot(target: EventTarget | null) {
  if (!(target instanceof Node)) return false;
  const el = target instanceof Element ? target : target.parentElement;
  return Boolean(el?.closest("[data-open-slot]"));
}

export function OpenSlots({
  slots,
  startRank,
  scramble = false,
  delay = 0,
}: {
  slots: BoardVacancy[];
  startRank: number;
  scramble?: boolean;
  delay?: number;
}) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const cycle = hydrated && !reduced && slots.length > 1;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const liveIndex = slots.length === 0 ? 0 : active % slots.length;

  useEffect(() => {
    if (!cycle || paused) return;

    const count = slots.length;
    let id = 0;
    const start = () => {
      window.clearInterval(id);
      id = window.setInterval(() => {
        setActive((index) => (index + 1) % count);
      }, DWELL_MS);
    };
    const stop = () => window.clearInterval(id);
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [cycle, paused, slots.length]);

  if (slots.length === 0) return null;

  const lock = (index: number) => {
    setPaused(true);
    setActive(index);
  };

  const release = (event: { relatedTarget: EventTarget | null }) => {
    if (isOpenSlot(event.relatedTarget)) return;
    setPaused(false);
  };

  return (
    <>
      {slots.map((slot, index) => (
        <li
          key={`${slot.href}-${slot.label}`}
          data-open-slot=""
          className="motion-row"
          style={motionDelay(delay + index)}
          onPointerEnter={() => lock(index)}
          onPointerLeave={release}
          onFocusCapture={() => lock(index)}
          onBlurCapture={release}
        >
          <VacantRankRow
            rank={startRank + index}
            scramble={scramble}
            label={slot.label}
            hint={slot.hint}
            href={slot.href}
            live={cycle && index === liveIndex}
          />
        </li>
      ))}
    </>
  );
}

function VacantRankRow({
  rank,
  scramble = false,
  label = "Share a bot",
  hint,
  href = "/upload",
  live = false,
}: {
  rank: number;
  scramble?: boolean;
  live?: boolean;
} & Partial<BoardVacancy>) {
  const listing = Boolean(hint);
  return (
    <div
      className={cn(
        "rank-row rank-row-open relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 overflow-hidden px-2 py-2.5 hover:bg-canvas-soft",
        live && "is-live"
      )}
    >
      {live ? (
        <span className="rank-open-scan" aria-hidden="true" />
      ) : null}
      <Link
        href={href}
        className="absolute inset-0 z-0 focus-visible:ring-1 focus-visible:ring-foreground"
        aria-label={listing ? `List the first ${label} bot` : label}
      />
      {scramble ? (
        <RankTick rank={rank} className="relative z-10 text-muted-foreground" />
      ) : (
        <span className="relative z-10 font-mono text-xs tabular-nums tracking-wide text-muted-foreground">
          {String(rank).padStart(2, "0")}
        </span>
      )}
      <span className="relative z-10 min-w-0 pointer-events-none">
        <span className="rank-open-label block truncate text-[15px] leading-tight">
          {label}
        </span>
        {hint ? (
          <span className="rank-open-hint mt-0.5 block truncate font-mono text-[10px] tracking-[0.14em] uppercase">
            {hint}
          </span>
        ) : null}
      </span>
    </div>
  );
}
