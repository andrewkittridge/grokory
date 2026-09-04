"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function CommonsRefresh({ everyMs = 20_000 }: { everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh();
    }, everyMs);
    return () => window.clearInterval(id);
  }, [everyMs, router]);
  return null;
}
