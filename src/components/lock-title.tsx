import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motionDelay } from "@/lib/utils";

export function LockTitle({
  as: Comp = "h1",
  children,
  className,
  delay = 0,
  display = "page",
  ...rest
}: {
  as?: "h1" | "h2" | "p";
  children: ReactNode;
  className?: string;
  delay?: number;
  display?: "hero" | "page" | "section";
} & HTMLAttributes<HTMLElement>) {
  return (
    <Comp
      className={cn(
        display === "hero" && "display-hero",
        display === "page" && "display-page",
        display === "section" && "display-section",
        "motion-lock",
        className
      )}
      style={motionDelay(delay)}
      {...rest}
    >
      {children}
      <span className="motion-lock-scan" aria-hidden="true" />
    </Comp>
  );
}
