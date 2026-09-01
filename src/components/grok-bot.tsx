"use client";

import { useEffect, useId, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const BODY = "M100 28 176 110 100 192 24 110 100 28Z";
const INNER = "M100 138 128 154 100 170 72 154 100 138Z";

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
      el.style.setProperty("--yaw", (nx * 7.5).toFixed(2));
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
      aria-label="Grokdex bot"
      onClick={hop}
      onAnimationEnd={(event) => {
        if (event.animationName === "bot-hop") {
          event.currentTarget.classList.remove("grok-bot-hopping");
        }
      }}
      className={cn(
        "grok-bot group/bot relative block w-full cursor-pointer touch-manipulation appearance-none overflow-visible border-0 bg-transparent p-0 text-foreground outline-none select-none focus-visible:ring-1 focus-visible:ring-foreground",
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
            <clipPath id={`${id}-body`}>
              <path d={BODY} />
            </clipPath>
          </defs>
          <g className="grok-bot-yaw">
            <g clipPath={`url(#${id}-body)`}>
              <path d={BODY} fill="#0a0a0a" />
              <path d="M100 28 176 110 100 110Z" fill="white" fillOpacity="0.28" />
              <path d="M100 110 176 110 100 192Z" fill="white" fillOpacity="0.1" />
              <path d="M100 28 100 110 24 110Z" fill="white" fillOpacity="0.06" />
              <path d="M100 110 24 110 100 192Z" fill="black" fillOpacity="0.55" />
              <path
                className="grok-bot-inner"
                d={INNER}
                stroke="currentColor"
                strokeWidth="1.15"
                strokeLinejoin="miter"
                opacity="0.4"
              />
              <g className="grok-bot-eyes">
                <Eye cx={76} cy={98} />
                <Eye cx={124} cy={98} />
              </g>
              <circle
                className="grok-bot-core-halo"
                cx="100"
                cy="154"
                r="14"
                fill="var(--sunset)"
                fillOpacity="0.22"
              />
              <circle
                className="grok-bot-core"
                cx="100"
                cy="154"
                r="6.6"
                fill="var(--sunset)"
              />
              <rect
                className="grok-bot-scan grok-bot-scan-enter"
                x="24"
                y="28"
                width="2.4"
                height="164"
                fill="var(--sunset)"
              />
              <rect
                className="grok-bot-scan grok-bot-scan-hum"
                x="24"
                y="28"
                width="2.4"
                height="164"
                fill="var(--sunset)"
              />
            </g>
            <path
              d={BODY}
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinejoin="miter"
            />
            <g className="grok-bot-sparks" fill="var(--sunset)">
              <path
                className="grok-bot-spark grok-bot-spark-a"
                d="M100 132 106 138 100 144 94 138Z"
              />
              <path
                className="grok-bot-spark grok-bot-spark-b"
                d="M100 132 106 138 100 144 94 138Z"
              />
              <path
                className="grok-bot-spark grok-bot-spark-c"
                d="M100 132 106 138 100 144 94 138Z"
              />
            </g>
          </g>
        </svg>
      </span>
    </button>
  );
}

function Eye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g className="grok-bot-eye" transform={`translate(${cx} ${cy})`}>
      <ellipse rx="20" ry="25.5" fill="white" />
      <g className="grok-bot-pupils">
        <circle r="9.2" fill="#0a0a0a" />
        <circle
          r="9.2"
          fill="none"
          stroke="var(--sunset)"
          strokeWidth="1.35"
          strokeOpacity="0.92"
        />
        <circle cx="3.1" cy="-3.5" r="2.7" fill="white" />
        <circle cx="-3.9" cy="2.3" r="1.1" fill="white" fillOpacity="0.72" />
      </g>
      <ellipse className="grok-bot-lid" rx="20" ry="25.5" fill="#0a0a0a" />
    </g>
  );
}
