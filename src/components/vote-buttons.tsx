"use client";

import { useOptimistic, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { castVote } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { VoteValue } from "@/lib/types";

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
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { score, userVote },
    (
      current,
      next: VoteValue
    ): { score: number; userVote: 0 | VoteValue } => {
      if (current.userVote === next) {
        return { score: current.score - next, userVote: 0 };
      }
      if (current.userVote === 0) {
        return { score: current.score + next, userVote: next };
      }
      return {
        score: current.score - current.userVote + next,
        userVote: next,
      };
    }
  );

  function vote(value: VoteValue) {
    start(async () => {
      setOptimistic(value);
      await castVote(templateId, value);
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        layout === "column" ? "flex-col" : "flex-row"
      )}
    >
      <button
        type="button"
        aria-label="Upvote"
        aria-pressed={optimistic.userVote === 1}
        disabled={pending}
        onClick={() => vote(1)}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md hover:bg-muted",
          optimistic.userVote === 1 && "text-primary"
        )}
      >
        <ChevronUp className="size-5" />
      </button>
      <span
        className={cn(
          "min-w-8 text-center font-mono text-sm tabular-nums",
          optimistic.userVote !== 0 && "text-primary"
        )}
      >
        {optimistic.score}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        aria-pressed={optimistic.userVote === -1}
        disabled={pending}
        onClick={() => vote(-1)}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md hover:bg-muted",
          optimistic.userVote === -1 && "text-primary"
        )}
      >
        <ChevronDown className="size-5" />
      </button>
    </div>
  );
}
