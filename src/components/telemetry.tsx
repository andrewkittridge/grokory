"use client";

import { useEffect, useState } from "react";
import { useHydrated, usePrefersReducedMotion } from "@/lib/motion";

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
