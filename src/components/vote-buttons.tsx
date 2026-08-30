"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { castVote } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { VoteValue } from "@/lib/types";

function VoteSubmit({
  value,
  active,
  label,
  compact,
  children,
}: {
  value: VoteValue;
  active: boolean;
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
        "inline-flex items-center justify-center rounded-full transition-colors hover:bg-white/5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/70 active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100 touch-manipulation",
        compact ? "size-8 sm:size-7" : "size-8",
        active ? "text-sunset [&_svg]:stroke-[2.5]" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
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

  return (
    <form
      action={castVote}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "flex items-center gap-0.5",
        layout === "column" ? "flex-col" : "flex-row",
        compact &&
          "rounded-full bg-background/80 p-0.5 ring-1 ring-white/15 backdrop-blur-sm"
      )}
    >
      <input type="hidden" name="templateId" value={templateId} />
      <VoteSubmit
        value={1}
        active={userVote === 1}
        label="Upvote"
        compact={compact}
      >
        <ChevronUp className={compact ? "size-4" : "size-5"} />
      </VoteSubmit>
      <span
        className={cn(
          "text-center font-mono tabular-nums text-foreground",
          compact ? "min-w-5 text-[11px]" : "min-w-8 text-sm"
        )}
      >
        {score}
      </span>
      <VoteSubmit
        value={-1}
        active={userVote === -1}
        label="Downvote"
        compact={compact}
      >
        <ChevronDown className={compact ? "size-4" : "size-5"} />
      </VoteSubmit>
    </form>
  );
}
