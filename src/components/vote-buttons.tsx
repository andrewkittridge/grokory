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
  children,
}: {
  value: VoteValue;
  active: boolean;
  label: string;
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
        "inline-flex size-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-50",
        active && "text-primary"
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
}: {
  templateId: string;
  score: number;
  userVote: 0 | VoteValue;
  layout?: "column" | "row";
}) {
  return (
    <form
      action={castVote}
      className={cn(
        "flex items-center gap-0.5",
        layout === "column" ? "flex-col" : "flex-row"
      )}
    >
      <input type="hidden" name="templateId" value={templateId} />
      <VoteSubmit value={1} active={userVote === 1} label="Upvote">
        <ChevronUp className="size-5" />
      </VoteSubmit>
      <span
        className={cn(
          "min-w-8 text-center font-mono text-sm tabular-nums",
          userVote !== 0 && "text-primary"
        )}
      >
        {score}
      </span>
      <VoteSubmit value={-1} active={userVote === -1} label="Downvote">
        <ChevronDown className="size-5" />
      </VoteSubmit>
    </form>
  );
}
