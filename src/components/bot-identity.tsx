"use client";

import { useEffect, useRef, useState } from "react";
import {
  GrokBotIdentityMark,
  GrokBotMark,
  hopGrokBot,
} from "@/components/grok-bot";
import { usePrefersReducedMotion } from "@/lib/motion";
import type { BotMark } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BotIdentityThumb({
  mark,
  size = "md",
  className,
}: {
  mark?: BotMark;
  size?: "md" | "lg";
  className?: string;
}) {
  const [painted, setPainted] = useState(false);
  useEffect(() => {
    setPainted(true);
  }, []);

  return (
    <span
      className={cn(
        "bot-thumb grok-bot",
        size === "lg" && "bot-thumb-lg",
        mark && "is-identity",
        className
      )}
      aria-hidden="true"
    >
      <span className="grok-bot-rim" aria-hidden="true" />
      {painted ? (
        mark ? (
          <GrokBotIdentityMark mark={mark} />
        ) : (
          <GrokBotMark />
        )
      ) : null}
    </span>
  );
}

export function BotIdentityStage({
  mark,
  title,
  ogImage,
  className,
}: {
  mark?: BotMark;
  title: string;
  ogImage?: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const botRef = useRef<HTMLSpanElement>(null);

  return (
    <div className={cn("bot-stage", className)}>
      {ogImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ogImage} alt="" className="bot-stage-wash" />
      ) : null}
      <span className="grok-bot-rim" aria-hidden="true" />
      <span
        ref={botRef}
        className={cn(
          "grok-bot bot-stage-figure relative block",
          mark && "is-identity"
        )}
        onPointerDown={() => hopGrokBot(botRef.current, reduced)}
        onAnimationEnd={(event) => {
          if (event.animationName === "bot-hop") {
            botRef.current?.classList.remove("grok-bot-hopping");
          }
        }}
      >
        {mark ? <GrokBotIdentityMark mark={mark} /> : <GrokBotMark />}
      </span>
      <span className="sr-only">{title}</span>
    </div>
  );
}
