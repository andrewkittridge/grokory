"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

type Diamond = {
  x: number;
  y: number;
  depth: number;
  alpha: number;
  size: number;
};

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius, y);
  ctx.closePath();
  ctx.fill();
}

export default function SiteFieldCanvas({
  density = "whisper",
}: {
  density?: "pad" | "whisper";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rand = mulberry32(density === "pad" ? 0x67a1d : 0x51c0e);
    const count = density === "pad" ? 52 : 28;
    const diamonds: Diamond[] = Array.from({ length: count }, () => ({
      x: rand(),
      y: rand() * (density === "pad" ? 0.62 : 0.9),
      depth: 0.22 + rand() * 0.78,
      alpha: 0.35 + rand() * 0.5,
      size: 1.1 + rand() * 1.6,
    }));

    let meteor: Meteor | null = null;
    let elapsed = 0;
    let nextMeteor = 1800 + rand() * 2600;
    let last = performance.now();
    let frame = 0;
    let running = true;
    let onscreen = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        onscreen = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      if (!running) return;
      frame = requestAnimationFrame(draw);

      const dt = Math.min(48, now - last);
      last = now;
      if (document.hidden || !onscreen) return;

      elapsed += dt;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      for (const star of diamonds) {
        star.x += (0.000007 + star.depth * 0.000016) * dt;
        if (star.x > 1) star.x -= 1;
        const twinkle =
          0.72 + Math.sin(elapsed * 0.0013 * star.depth + star.y * 12) * 0.28;
        const sunset = star.depth > 0.8 && star.x < 0.24;
        ctx.fillStyle = sunset
          ? `rgba(255,122,23,${0.62 * twinkle})`
          : `rgba(255,255,255,${star.alpha * twinkle})`;
        drawDiamond(
          ctx,
          star.x * width,
          star.y * height,
          star.depth > 0.55 ? star.size : star.size * 0.7
        );
      }

      if (!meteor && elapsed > nextMeteor) {
        meteor = {
          x: (0.08 + rand() * 0.7) * width,
          y: (0.04 + rand() * 0.22) * height,
          vx: 0.24 + rand() * 0.18,
          vy: 0.09 + rand() * 0.09,
          life: 0,
          ttl: 420 + rand() * 240,
        };
        nextMeteor = elapsed + 4800 + rand() * 3600;
      }

      if (meteor) {
        meteor.life += dt;
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        const t = meteor.life / meteor.ttl;
        const alpha =
          t < 0.14
            ? t / 0.14
            : t > 0.68
              ? Math.max(0, 1 - (t - 0.68) / 0.32)
              : 1;
        ctx.strokeStyle = `rgba(255,255,255,${0.65 * alpha})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.vx * 48, meteor.y - meteor.vy * 48);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,122,23,${0.8 * alpha})`;
        drawDiamond(ctx, meteor.x, meteor.y, 2.1);
        if (
          meteor.life >= meteor.ttl ||
          meteor.x > width + 40 ||
          meteor.y > height + 40
        ) {
          meteor = null;
        }
      }
    };

    frame = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
    };
  }, [density, reduced]);

  if (reduced) return null;

  return <canvas ref={canvasRef} className="site-field-canvas" />;
}
