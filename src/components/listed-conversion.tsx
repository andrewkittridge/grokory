"use client";

import { useEffect } from "react";
import { trackConversion } from "@/lib/analytics";

export function ListedConversion({ listed }: { listed: boolean }) {
  useEffect(() => {
    if (!listed) return;
    trackConversion("list_bot");
    const url = new URL(window.location.href);
    if (!url.searchParams.has("listed")) return;
    url.searchParams.delete("listed");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", next);
  }, [listed]);

  return null;
}
