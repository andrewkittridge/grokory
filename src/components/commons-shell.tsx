"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { applyCommonsShell, isCommonsPath } from "@/lib/visual";

export function CommonsShell() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    applyCommonsShell(isCommonsPath(pathname));
  }, [pathname]);
  return null;
}
