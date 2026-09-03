"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankTick } from "@/components/telemetry";
import {
  LIST_AGENT_HREF,
  LIST_SKILL_PATH,
  isClaimSeat,
  isSeatsOpenInvite,
  type BoardVacancy,
} from "@/lib/founding";
import { useHydrated, usePrefersReducedMotion } from "@/lib/motion";
import { cn, motionDelay } from "@/lib/utils";

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
  inviteAgent = false,
}: {
  slots: BoardVacancy[];
  startRank: number;
  scramble?: boolean;
  delay?: number;
  surface?: "board" | "roster";
  inviteAgent?: boolean;
}) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const distinct = new Set(slots.map((slot) => slot.label)).size > 1;
  const cycle = hydrated && !reduced && distinct;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const liveIndex = slots.length === 0 ? 0 : active % slots.length;
  const showInvite =
    inviteAgent &&
    slots.some((slot) => isClaimSeat(slot) || isSeatsOpenInvite(slot));

  useEffect(() => {
    if (!cycle || paused) return;

    const count = slots.length;
    let id = 0;
    const start = () => {
      window.clearInterval(id);
      id = window.setInterval(() => {
        setActive((index) => (index + 1) % count);
      }, 2000);
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
          key={`${slot.href}-${slot.label}-${index}`}
          data-open-slot=""
          className="motion-row"
          style={motionDelay(delay + index)}
          onPointerEnter={() => lock(index)}
          onPointerLeave={release}
          onFocusCapture={() => lock(index)}
          onBlurCapture={release}
        >
          {isSeatsOpenInvite(slot) ? (
            <SeatsOpenRow href={slot.href} surface={surface} />
          ) : (
            <VacantRankRow
              rank={startRank + index}
              scramble={scramble}
              label={slot.label}
              hint={slot.hint}
              href={slot.href}
              live={cycle && index === liveIndex}
              surface={surface}
            />
          )}
        </li>
      ))}
      {showInvite ? (
        <li className="motion-row" style={motionDelay(delay + slots.length)}>
          <AgentInvite surface={surface} />
        </li>
      ) : null}
    </>
  );
}

function SeatsOpenRow({
  href,
  surface,
}: {
  href: string;
  surface: "board" | "roster";
}) {
  const roster = surface === "roster";

  return (
    <div
      className={cn(
        "rank-row rank-row-open relative items-center",
        roster ? "px-3 py-3 sm:px-5" : "px-2 py-3"
      )}
    >
      <Link
        href={href}
        className="absolute inset-0 z-0 focus-visible:ring-1 focus-visible:ring-foreground"
        aria-label="Seats open. Claim this seat."
      />
      <p className="relative z-10 text-xs leading-5 text-muted-foreground">
        <span className="text-foreground">Seats open</span>
        <span aria-hidden="true"> · </span>
        Claim this seat
      </p>
    </div>
  );
}

function AgentInvite({ surface }: { surface: "board" | "roster" }) {
  const roster = surface === "roster";

  return (
    <p
      className={cn(
        "text-xs leading-5 text-muted-foreground",
        roster ? "px-3 py-3 sm:px-5" : "px-2 py-3"
      )}
    >
      Or have your bot list it
      <span aria-hidden="true"> · </span>
      <Link
        href={LIST_SKILL_PATH}
        className="text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
      >
        Skill
      </Link>
      <span aria-hidden="true"> · </span>
      <Link
        href={LIST_AGENT_HREF}
        className="text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-foreground"
      >
        MCP
      </Link>
    </p>
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
  const go = hint ?? "Paste a share link";
  const roster = surface === "roster";

  return (
    <div
      className={cn(
        "rank-row rank-row-open relative items-center overflow-hidden hover:bg-canvas-soft",
        roster
          ? "flex gap-x-3 px-3 py-4 sm:px-5 sm:py-5"
          : "flex gap-x-3 px-2 py-3.5 sm:px-3 sm:py-4",
        live && "is-live"
      )}
    >
      {live ? (
        <span className="rank-open-scan" aria-hidden="true" />
      ) : null}
      <Link
        href={href}
        className="absolute inset-0 z-0 focus-visible:ring-1 focus-visible:ring-foreground"
        aria-label={hint ? `${label}. ${hint}` : label}
      />
      {scramble ? (
        <RankTick
          className={cn(
            "relative z-10 shrink-0 text-muted-foreground",
            roster && "w-8"
          )}
          rank={rank}
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
      <span className="bot-thumb-empty relative z-10" aria-hidden="true" />
      <span className="relative z-10 min-w-0 flex-1 overflow-hidden pointer-events-none">
        <span className="rank-open-label block truncate text-[15px] leading-tight">
          {label}
        </span>
        <span
          className={cn(
            "rank-open-go mt-0.5 block truncate text-xs leading-5",
            !roster && "text-muted-foreground"
          )}
        >
          {go}
        </span>
      </span>
    </div>
  );
}
