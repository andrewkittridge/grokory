"use client";

import type { ReactNode } from "react";
import { useEffect, useOptimistic, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { castVote } from "@/lib/actions";
import { nextBallot, scoreAfter } from "@/lib/vote";
import { cn } from "@/lib/utils";
import type { VoteValue } from "@/lib/types";

function ChevronUpIcon({ compact }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={compact ? "size-4" : "size-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ChevronDownIcon({ compact }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={compact ? "size-4" : "size-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function VoteSubmit({
  value,
  active,
  burst,
  label,
  compact,
  onBurst,
  children,
}: {
  value: VoteValue;
  active: boolean;
  burst: boolean;
  label: string;
  compact?: boolean;
  onBurst: (value: 0 | VoteValue) => void;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  const up = value === 1;

  return (
    <button
      type="submit"
      name="value"
      value={value}
      aria-label={label}
      aria-pressed={active}
      aria-busy={pending}
      onPointerDown={() => {
        if (pending) return;
        onBurst(0);
        requestAnimationFrame(() => onBurst(value));
      }}
      onClick={(event) => {
        if (pending) event.preventDefault();
      }}
      onAnimationEnd={(event) => {
        if (
          event.animationName === "vote-kick-up" ||
          event.animationName === "vote-kick-down"
        ) {
          onBurst(0);
        }
      }}
      className={cn(
        "vote-btn relative inline-flex items-center justify-center overflow-visible rounded-full transition-colors hover:bg-canvas-soft focus-visible:ring-1 focus-visible:ring-foreground motion-reduce:transition-none touch-manipulation",
        compact ? "size-7" : "size-8",
        active
          ? "text-sunset [&_svg]:stroke-[2.5]"
          : "text-muted-foreground hover:text-foreground",
        burst && (up ? "vote-burst-up" : "vote-burst-down")
      )}
    >
      <span className="vote-icon inline-flex">{children}</span>
      <span className="vote-burst" aria-hidden="true">
        <span className="vote-diamond vote-diamond-a" />
        <span className="vote-diamond vote-diamond-b" />
        <span className="vote-diamond vote-diamond-c" />
      </span>
    </button>
  );
}

function VoteScore({ score, compact }: { score: number; compact?: boolean }) {
  const previous = useRef(score);
  const [dir, setDir] = useState<0 | 1 | -1>(0);

  useEffect(() => {
    if (previous.current === score) return;
    const next = score > previous.current ? 1 : -1;
    previous.current = score;
    const start = window.setTimeout(() => setDir(next), 0);
    const stop = window.setTimeout(() => setDir(0), 520);
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
        dir === 1 && "vote-tick-up",
        dir === -1 && "vote-tick-down"
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
  const [burst, setBurst] = useState<0 | VoteValue>(0);
  const [optimistic, addOptimistic] = useOptimistic(
    { score, userVote },
    (state, value: VoteValue) => {
      const next = nextBallot(state.userVote, value);
      return {
        userVote: next,
        score: scoreAfter(state.score, state.userVote, next),
      };
    }
  );

  return (
    <form
      action={async (formData) => {
        const raw = String(formData.get("value"));
        if (raw === "1" || raw === "-1") {
          addOptimistic(Number(raw) as VoteValue);
        }
        await castVote(formData);
      }}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "relative z-10 flex items-center gap-0 overflow-visible",
        layout === "column" ? "flex-col" : "flex-row"
      )}
    >
      <input type="hidden" name="templateId" value={templateId} />
      <VoteSubmit
        value={1}
        active={optimistic.userVote === 1}
        burst={burst === 1}
        label="Upvote"
        compact={compact}
        onBurst={setBurst}
      >
        <ChevronUpIcon compact={compact} />
      </VoteSubmit>
      <VoteScore score={optimistic.score} compact={compact} />
      <VoteSubmit
        value={-1}
        active={optimistic.userVote === -1}
        burst={burst === -1}
        label="Downvote"
        compact={compact}
        onBurst={setBurst}
      >
        <ChevronDownIcon compact={compact} />
      </VoteSubmit>
    </form>
  );
}
