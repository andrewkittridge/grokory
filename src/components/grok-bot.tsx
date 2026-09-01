"use client";

import { useEffect, useId, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function GrokBot({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLButtonElement>(null);
  const rawId = useId();
  const id = `gb${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.46;
      const nx = Math.max(
        -1,
        Math.min(1, (event.clientX - cx) / (rect.width * 1.55))
      );
      const ny = Math.max(
        -1,
        Math.min(1, (event.clientY - cy) / (rect.height * 1.55))
      );
      el.style.setProperty("--gaze-x", nx.toFixed(3));
      el.style.setProperty("--gaze-y", ny.toFixed(3));
      el.style.setProperty("--yaw", (nx * 6).toFixed(2));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  const hop = () => {
    const el = rootRef.current;
    if (!el || reduced) return;
    el.classList.remove("grok-bot-hopping");
    void el.offsetWidth;
    el.classList.add("grok-bot-hopping");
  };

  return (
    <button
      ref={rootRef}
      type="button"
      aria-label="Grok Bot"
      onClick={hop}
      onAnimationEnd={(event) => {
        if (event.animationName === "bot-hop") {
          event.currentTarget.classList.remove("grok-bot-hopping");
        }
      }}
      className={cn(
        "grok-bot group/bot relative block w-full cursor-pointer touch-manipulation appearance-none overflow-visible border-0 bg-transparent p-0 outline-none select-none focus-visible:ring-1 focus-visible:ring-foreground",
        className
      )}
    >
      <span className="grok-bot-ground" aria-hidden="true" />
      <span className="grok-bot-motion block">
        <svg
          viewBox="0 0 200 220"
          fill="none"
          aria-hidden="true"
          className="block size-full overflow-visible"
        >
          <defs>
            <radialGradient
              id={`${id}-ball`}
              cx="36%"
              cy="30%"
              r="72%"
            >
              <stop offset="0%" stopColor="#fafafa" />
              <stop offset="48%" stopColor="#e4e4e7" />
              <stop offset="100%" stopColor="#71717a" />
            </radialGradient>
          </defs>
          <g className="grok-bot-yaw">
            <circle cx="100" cy="104" r="80" fill={`url(#${id}-ball)`} />
            <g className="grok-bot-eyes">
              <g transform="translate(86 102) rotate(24)">
                <rect
                  className="grok-bot-lid"
                  x="-12"
                  y="-26"
                  width="24"
                  height="52"
                  rx="12"
                  fill="#0a0a0a"
                />
              </g>
              <g transform="translate(124 86) rotate(30)">
                <rect
                  className="grok-bot-lid"
                  x="-9.5"
                  y="-23"
                  width="19"
                  height="46"
                  rx="9.5"
                  fill="#0a0a0a"
                />
              </g>
            </g>
          </g>
        </svg>
      </span>
    </button>
  );
}
