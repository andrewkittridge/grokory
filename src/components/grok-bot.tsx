"use client";

import { useEffect, useId, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const EYE_L =
  "M130.36 45.98L132.71 46.19L134.98 46.81L137.11 47.83L138.97 49.28L140.47 51.09L141.68 53.12L142.73 55.23L143.76 57.36L144.78 59.49L145.79 61.62L146.79 63.76L147.76 65.91L148.71 68.07L149.63 70.25L150.52 72.43L151.37 74.63L151.99 76.91L152.10 79.26L151.64 81.57L150.59 83.68L149.04 85.45L147.10 86.78L144.90 87.62L142.56 87.93L140.22 87.71L137.98 86.99L135.93 85.82L134.17 84.24L132.78 82.34L131.69 80.25L130.77 78.08L129.87 75.89L128.94 73.72L128.00 71.56L127.03 69.40L126.05 67.26L125.05 65.12L124.03 62.99L122.93 60.90L121.87 58.79L121.03 56.59L120.72 54.26L121.10 51.93L122.15 49.83L123.75 48.10L125.76 46.89L128.01 46.19Z";
const EYE_R =
  "M176.61 37.08L178.72 37.59L180.70 38.48L182.52 39.65L184.20 41.03L185.71 42.59L187.03 44.31L188.20 46.14L189.26 48.03L190.27 49.96L191.26 51.89L192.23 53.84L193.16 55.80L194.05 57.78L194.92 59.77L195.74 61.78L196.53 63.80L197.27 65.84L197.97 67.90L198.47 70.01L198.63 72.18L198.40 74.33L197.58 76.33L195.95 77.72L193.83 78.08L191.71 77.65L189.76 76.69L188.03 75.38L186.53 73.82L185.28 72.05L184.25 70.13L183.40 68.14L182.63 66.11L181.87 64.07L181.07 62.05L180.25 60.04L179.39 58.05L178.49 56.07L177.57 54.10L176.61 52.15L175.62 50.22L174.59 48.31L173.53 46.41L172.54 44.48L171.86 42.42L171.76 40.26L172.62 38.30L174.45 37.19Z";

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
                  d={EYE_L}
                  fill="#0a0a0a"
                />
                <path className="grok-bot-lid" d={EYE_R} fill="#0a0a0a" />
              </g>
            </g>
            <g className="grok-bot-comet">
              <path
                d="M100 20 105.2 25.2 100 30.4 94.8 25.2Z"
                fill="var(--sunset)"
              />
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
