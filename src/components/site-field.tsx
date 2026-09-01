"use client";

import dynamic from "next/dynamic";
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

  if (reduced) return null;

  return (
    <div className="site-field" data-density={density} aria-hidden="true">
      <div className="site-field-grid" />
      {density !== "legal" ? <SiteFieldCanvas density={density} /> : null}
      <div className="site-field-glint" />
      <div className="site-field-veil" />
    </div>
  );
}
