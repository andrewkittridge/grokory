"use client";

import { useEffect, useState } from "react";
import { useHydrated, usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const GLYPHS = "0123456789";

export function RankTick({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}) {
  const label = String(rank).padStart(2, "0");
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const animate = hydrated && !reduced;
  const [text, setText] = useState(label);

  useEffect(() => {
    if (!animate) return;

    let frame = 0;
    let timer = 0;
    const frames = 11;
    const tick = () => {
      frame += 1;
      if (frame >= frames) {
        setText(label);
        return;
      }
      setText(
        `${GLYPHS[(Math.random() * 10) | 0]}${GLYPHS[(Math.random() * 10) | 0]}`
      );
      timer = window.setTimeout(tick, 28);
    };
    timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [animate, label]);

  return (
    <span
      aria-label={label}
      className={cn("font-mono text-xs tabular-nums tracking-wide", className)}
    >
      <span aria-hidden="true">{animate ? text : label}</span>
    </span>
  );
}

export function CountTick({
  value,
  singular,
  plural,
}: {
  value: number;
  singular: string;
  plural: string;
}) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const animate = hydrated && !reduced && value > 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animate) return;

    const start = performance.now();
    const duration = 640;
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [animate, value]);

  const display = animate ? count : value;
  const word = display === 1 ? singular : plural;

  return (
    <span aria-label={`${value} ${value === 1 ? singular : plural}`}>
      <span aria-hidden="true">
        {display} {word}
      </span>
    </span>
  );
}

export function MissionClock() {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!hydrated || reduced) return;
    const origin = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Date.now() - origin);
    }, 1000);
    return () => window.clearInterval(id);
  }, [hydrated, reduced]);

  const total = Math.floor(elapsed / 1000);
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");

  return (
    <span
      aria-hidden="true"
      className="font-mono text-xs tracking-[0.18em] text-muted-foreground tabular-nums"
    >
      T+ {hours}:{minutes}:{seconds}
    </span>
  );
}
