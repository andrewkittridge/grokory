import type { CSSProperties } from "react";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

const LETTERS = SITE_NAME.split("");

export function HeroWordmark({
  className,
  as: Comp = "h1",
}: {
  className?: string;
  as?: "h1" | "p";
}) {
  return (
    <Comp className={cn("hero-wordmark", className)} aria-label={SITE_NAME}>
      {LETTERS.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className="hero-letter"
          style={{ "--i": index } as CSSProperties}
          aria-hidden="true"
        >
          {letter}
        </span>
      ))}
    </Comp>
  );
}
