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
  surface = "board",
}: {
  slots: BoardVacancy[];
  startRank: number;
  scramble?: boolean;
  delay?: number;
  surface?: "board" | "roster";
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
            surface={surface}
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
  surface = "board",
}: {
  rank: number;
  scramble?: boolean;
  live?: boolean;
  surface?: "board" | "roster";
} & Partial<BoardVacancy>) {
  const listing = Boolean(hint);
  const roster = surface === "roster";
  const go = listing ? `List the first ${label} bot` : "Paste a share link";

  return (
    <div
      className={cn(
        "rank-row rank-row-open relative items-center overflow-hidden hover:bg-canvas-soft",
        roster
          ? "rank-row-roster flex gap-x-2 px-3 py-3.5 sm:gap-x-3 sm:px-5 sm:py-4"
          : "grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-x-3 px-2 py-2.5",
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
        <RankTick
          rank={rank}
          className={cn(
            "relative z-10 shrink-0 text-muted-foreground",
            roster && "w-8"
          )}
        />
      ) : (
        <span
          className={cn(
            "relative z-10 shrink-0 font-mono text-xs tabular-nums tracking-wide text-muted-foreground",
            roster && "w-8"
          )}
        >
          {String(rank).padStart(2, "0")}
        </span>
      )}
      <span className="relative z-10 min-w-0 flex-1 overflow-hidden pointer-events-none">
        <span className="rank-open-label block truncate text-[15px] leading-tight">
          {label}
        </span>
        {roster ? (
          <span
            className="rank-open-go mt-0.5 block truncate text-xs leading-5"
            aria-hidden="true"
          >
            {go}
            <span> →</span>
          </span>
        ) : hint ? (
          <span className="rank-open-hint mt-0.5 block truncate font-mono text-[10px] tracking-[0.14em] uppercase">
            {hint}
          </span>
        ) : null}
      </span>
      {roster && listing ? (
        <span className="rank-open-status relative z-10 shrink-0 self-center pl-2 text-right font-mono text-[11px] tracking-[0.16em] uppercase sm:pl-3 sm:text-[10px] sm:tracking-[0.18em]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
