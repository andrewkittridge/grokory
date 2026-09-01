"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ScanField({
  children,
  active,
  failed,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  failed?: boolean;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const scanning = active ?? focused;

  return (
    <div
      className={cn(
        "relative min-w-0 flex-1 overflow-hidden",
        scanning && !failed && "input-scan",
        className
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
      {failed ? <span className="motion-scan-fail" aria-hidden="true" /> : null}
    </div>
  );
}
