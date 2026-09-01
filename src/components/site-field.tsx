"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/lib/motion";

const SiteFieldCanvas = dynamic(() => import("./site-field-canvas"), {
  ssr: false,
});

function fieldDensity(pathname: string) {
  if (pathname === "/privacy" || pathname === "/terms") return "legal";
  if (pathname === "/") return "pad";
  return "whisper";
}

export function SiteField() {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const density = fieldDensity(pathname);
  const [paint, setPaint] = useState(false);

  useEffect(() => {
    if (reduced || density === "legal") return;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setPaint(true), {
        timeout: 900,
      });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setPaint(true), 180);
    return () => window.clearTimeout(id);
  }, [reduced, density]);

  if (reduced) return null;

  return (
    <div className="site-field" data-density={density} aria-hidden="true">
      <div className="site-field-grid" />
      {density !== "legal" && paint ? (
        <SiteFieldCanvas density={density} />
      ) : null}
      <div className="site-field-glint" />
      <div className="site-field-veil" />
    </div>
  );
}
