"use client";

import { usePathname } from "next/navigation";

function fieldDensity(pathname: string) {
  if (pathname === "/privacy" || pathname === "/terms") return "legal";
  if (pathname === "/commons" || pathname.startsWith("/commons/")) return "legal";
  if (pathname === "/" || pathname === "/catalog") return "pad";
  return "whisper";
}

export function SiteField() {
  const pathname = usePathname();

  return (
    <div
      className="site-field"
      data-density={fieldDensity(pathname)}
      aria-hidden="true"
    >
      <div className="site-field-glint" />
      <div className="site-field-veil" />
    </div>
  );
}
