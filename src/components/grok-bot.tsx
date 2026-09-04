"use client";

import { useEffect, useId, useRef } from "react";
import { resolveBotMark } from "@/lib/bot-mark";
import {
  GROK_BOT_EYE_L,
  GROK_BOT_EYE_R,
  GROK_BOT_MARK_VIEWBOX,
} from "@/lib/grok-bot-shapes";
import { usePrefersReducedMotion } from "@/lib/motion";
import type { BotMark } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GrokBotMark({ className }: { className?: string }) {
  const rawId = useId();
  const id = `gb${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <>
      <span className="grok-bot-ground" aria-hidden="true" />
      <span className={cn("grok-bot-motion block", className)}>
        <svg
          viewBox="0 0 200 220"
          fill="none"
          aria-hidden="true"
          className="block size-full overflow-visible"
        >
          <defs>
            <radialGradient
              id={`${id}-ball`}
              cx="42%"
              cy="30%"
              fx="34%"
              fy="24%"
              r="78%"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="22%" stopColor="#f4f4f5" />
              <stop offset="58%" stopColor="#d4d4d8" />
              <stop offset="86%" stopColor="#71717a" />
              <stop offset="100%" stopColor="#3f3f46" />
            </radialGradient>
            <radialGradient id={`${id}-spec`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="42%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="grok-bot-yaw">
            <g transform="translate(20 24.04) scale(0.7)">
              <circle
                cx="114.271"
                cy="114.228"
                r="114.271"
                fill={`url(#${id}-ball)`}
              />
              <ellipse
                className="grok-bot-spec"
                cx="158"
                cy="78"
                rx="52"
                ry="34"
                fill={`url(#${id}-spec)`}
              />
              <g className="grok-bot-eyes">
                <path
                  className="grok-bot-lid grok-bot-lid-l"
                  d={GROK_BOT_EYE_L}
                  fill="#0a0a0a"
                />
                <path className="grok-bot-lid" d={GROK_BOT_EYE_R} fill="#0a0a0a" />
              </g>
            </g>
          </g>
        </svg>
      </span>
    </>
  );
}

export function GrokBotIdentityMark({
  mark,
  className,
}: {
  mark: BotMark;
  className?: string;
}) {
  const resolved = resolveBotMark(mark);
  if (!resolved) return <GrokBotMark className={className} />;

  return (
    <>
      <span className="grok-bot-ground" aria-hidden="true" />
      <span className={cn("grok-bot-motion block", className)}>
        <svg
          viewBox={GROK_BOT_MARK_VIEWBOX}
          fill="none"
          aria-hidden="true"
          data-bot-shape={resolved.shape}
          className="block size-full overflow-visible"
        >
          <g className="grok-bot-yaw">
            <path
              className="grok-bot-share-head"
              d={resolved.head}
              fill={resolved.coat}
            />
            <g className="grok-bot-eyes">
              {resolved.eyes.map((eye, index) => (
                <path
                  key={index}
                  className={cn(
                    "grok-bot-lid",
                    index === 0 && "grok-bot-lid-l"
                  )}
                  d={eye.d}
                  fill={resolved.eyeFill}
                  transform={eye.transform}
                />
              ))}
            </g>
          </g>
        </svg>
      </span>
    </>
  );
}

export function hopGrokBot(el: HTMLElement | null, reduced: boolean) {
  if (!el || reduced) return;
  el.classList.remove("grok-bot-hopping");
  void el.offsetWidth;
  el.classList.add("grok-bot-hopping");
}

export function gazeGrokBot(
  el: HTMLElement | null,
  clientX: number,
  clientY: number
) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height * 0.42;
  const gazeX = Math.max(
    -1,
    Math.min(1, (clientX - cx) / (rect.width * 1.7))
  );
  const gazeY = Math.max(
    -1,
    Math.min(1, (clientY - cy) / (rect.height * 1.7))
  );
  el.style.setProperty("--gaze-x", gazeX.toFixed(3));
  el.style.setProperty("--gaze-y", gazeY.toFixed(3));
  el.style.setProperty("--yaw", (gazeX * 5.2).toFixed(2));
  el.style.setProperty("--spec-x", gazeX.toFixed(3));
  el.style.setProperty("--spec-y", gazeY.toFixed(3));
}

export function clearGrokBotGaze(el: HTMLElement | null) {
  if (!el) return;
  el.style.removeProperty("--gaze-x");
  el.style.removeProperty("--gaze-y");
  el.style.removeProperty("--yaw");
  el.style.removeProperty("--spec-x");
  el.style.removeProperty("--spec-y");
}

export function GrokBot({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;

    let pointerX = 0;
    let pointerY = 0;
    let lastMove = 0;
    let currentX = 0;
    let currentY = 0;
    let currentYaw = 0;
    let glanceUntil = 0;
    let nextGlance = performance.now() + 3200;
    let nextWink = performance.now() + 5600;
    const lookAtYouUntil = performance.now() + 1900;
    let frame = 0;
    let running = true;

    const onMove = (event: PointerEvent) => {
      lastMove = performance.now();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.42;
      pointerX = Math.max(
        -1,
        Math.min(1, (event.clientX - cx) / (rect.width * 1.7))
      );
      pointerY = Math.max(
        -1,
        Math.min(1, (event.clientY - cy) / (rect.height * 1.7))
      );
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (now: number) => {
      if (!running) return;
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;

      const idle = lastMove === 0 || now - lastMove > 1500;
      const saccadeX = Math.sin(now * 0.00105) * 0.045;
      const saccadeY = Math.cos(now * 0.00088) * 0.035;

      let tx: number;
      let ty: number;

      if (now < lookAtYouUntil && idle) {
        tx = -0.4 + saccadeX * 0.3;
        ty = -0.06 + saccadeY * 0.3;
      } else if (idle) {
        if (glanceUntil === 0 && now > nextGlance) {
          glanceUntil = now + 1200;
          nextGlance = now + 6800 + Math.random() * 2400;
        }
        if (now < glanceUntil) {
          tx = -0.62;
          ty = 0.5;
        } else {
          glanceUntil = 0;
          tx = saccadeX;
          ty = saccadeY;
        }
      } else {
        glanceUntil = 0;
        tx = pointerX + saccadeX * 0.35;
        ty = pointerY + saccadeY * 0.35;
      }

      if (idle && now > nextWink && now > 2400) {
        el.classList.remove("grok-bot-winking");
        void el.offsetWidth;
        el.classList.add("grok-bot-winking");
        nextWink = now + 7600 + Math.random() * 4200;
      }

      const k = 0.14;
      currentX += (tx - currentX) * k;
      currentY += (ty - currentY) * k;
      const yawTarget = currentX * 5.2;
      currentYaw += (yawTarget - currentYaw) * k;

      el.style.setProperty("--gaze-x", currentX.toFixed(3));
      el.style.setProperty("--gaze-y", currentY.toFixed(3));
      el.style.setProperty("--yaw", currentYaw.toFixed(2));
      el.style.setProperty("--spec-x", currentX.toFixed(3));
      el.style.setProperty("--spec-y", currentY.toFixed(3));
    };

    frame = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <button
      ref={rootRef}
      type="button"
      aria-label="Grok Bot"
      onClick={() => hopGrokBot(rootRef.current, reduced)}
      onAnimationEnd={(event) => {
        if (event.animationName === "bot-hop") {
          event.currentTarget.classList.remove("grok-bot-hopping");
        }
        if (event.animationName === "bot-wink") {
          event.currentTarget.classList.remove("grok-bot-winking");
        }
      }}
      className={cn(
        "grok-bot group/bot relative block w-full cursor-pointer touch-manipulation appearance-none overflow-visible border-0 bg-transparent p-0 outline-none select-none focus-visible:ring-1 focus-visible:ring-foreground",
        className
      )}
    >
      <GrokBotMark />
    </button>
  );
}
