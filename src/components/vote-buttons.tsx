"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { castVote } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { VoteValue } from "@/lib/types";

function VoteSubmit({
  value,
  active,
  flash,
  label,
  compact,
  children,
}: {
  value: VoteValue;
  active: boolean;
  flash?: boolean;
  label: string;
  compact?: boolean;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="value"
      value={value}
      aria-label={label}
      aria-pressed={active}
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center rounded-none transition-colors hover:bg-white/5 disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-foreground motion-reduce:transition-none touch-manipulation",
        compact ? "size-7" : "size-8",
        active
          ? "text-sunset [&_svg]:stroke-[2.5]"
          : "text-muted-foreground hover:text-foreground",
        flash && "vote-flash"
      )}
    >
      {children}
    </button>
  );
}

function VoteScore({ score, compact }: { score: number; compact?: boolean }) {
  const previous = useRef(score);
  const [tick, setTick] = useState(false);

  useEffect(() => {
    if (previous.current === score) return;
    previous.current = score;
    const start = window.setTimeout(() => setTick(true), 0);
    const stop = window.setTimeout(() => setTick(false), 520);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, [score]);

  return (
    <span
      className={cn(
        "inline-block text-center font-mono tabular-nums text-foreground",
        compact ? "min-w-5 text-[11px]" : "min-w-8 text-sm",
        tick && "vote-tick"
      )}
    >
      {score}
    </span>
  );
}

export function VoteButtons({
  templateId,
  score,
  userVote,
  layout = "column",
  size = "default",
}: {
  templateId: string;
  score: number;
  userVote: 0 | VoteValue;
  layout?: "column" | "row";
  size?: "default" | "mat";
}) {
  const compact = size === "mat";
  const previousVote = useRef(userVote);
  const [flash, setFlash] = useState<0 | VoteValue>(0);

  useEffect(() => {
    if (previousVote.current === userVote) return;
    previousVote.current = userVote;
    const start = window.setTimeout(() => setFlash(userVote), 0);
    const stop = window.setTimeout(() => setFlash(0), 700);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, [userVote]);

  return (
    <form
      action={castVote}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "flex items-center gap-0",
        layout === "column" ? "flex-col" : "flex-row"
      )}
    >
      <input type="hidden" name="templateId" value={templateId} />
      <VoteSubmit
        value={1}
        active={userVote === 1}
        flash={flash === 1}
        label="Upvote"
        compact={compact}
      >
        <ChevronUp className={compact ? "size-4" : "size-5"} />
      </VoteSubmit>
      <VoteScore score={score} compact={compact} />
      <VoteSubmit
        value={-1}
        active={userVote === -1}
        flash={flash === -1}
        label="Downvote"
        compact={compact}
      >
        <ChevronDown className={compact ? "size-4" : "size-5"} />
      </VoteSubmit>
    </form>
  );
}
