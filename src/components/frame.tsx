import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Frame({
  children,
  className,
  matClassName,
  staticFrame = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  matClassName?: string;
  staticFrame?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("bot-frame", staticFrame && "bot-frame-static", className)}
      style={style}
    >
      <div className={cn("bot-frame-mat", matClassName)}>{children}</div>
    </div>
  );
}
