"use client";

import type { ReactNode } from "react";
import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const quiet = pathname === "/privacy" || pathname === "/terms";

  return (
    <ViewTransition
      enter={quiet ? "fade" : "acquire"}
      exit="fade"
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
