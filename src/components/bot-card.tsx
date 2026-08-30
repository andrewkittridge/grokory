import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BotCover } from "@/components/bot-cover";
import { Frame } from "@/components/frame";
import { VoteButtons } from "@/components/vote-buttons";
import { formatCount } from "@/lib/bot-url";
import { cn, motionDelay } from "@/lib/utils";
import type { ListedTemplate } from "@/lib/types";

export function BotCard({
  template,
  size = "default",
  delay = 0,
  rank,
}: {
  template: ListedTemplate;
  size?: "default" | "lg";
  delay?: number;
  rank?: number;
}) {
  const href = `/templates/${template.slug}`;
  const coverHeight = size === "lg" ? "h-52 sm:h-64" : "h-40";

  return (
    <Frame
      className="motion-card motion-enter h-full"
      matClassName="relative flex h-full flex-col"
      style={motionDelay(delay)}
    >
      <Link
        href={href}
        className="flex min-h-0 flex-1 flex-col rounded-[1px] focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="px-2.5 pt-2.5">
          <BotCover
            botId={template.botId}
            title={template.title}
            ogImage={template.ogImage}
            className={coverHeight}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col px-3 pt-3 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {rank != null ? (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                #{rank}
              </span>
            ) : null}
            <Badge
              variant={template.origin === "curated" ? "default" : "outline"}
            >
              {template.origin === "curated" ? "Staff pick" : "Community"}
            </Badge>
            <Badge variant="secondary">{template.category}</Badge>
          </div>
          <h3 className="mt-2 text-xl font-normal tracking-tight">
            {template.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            by {template.authorName}
          </p>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {template.summary}
          </p>
          <p className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span className="font-mono tabular-nums text-foreground">
              {template.score === 1 ? "1 point" : `${template.score} points`}
            </span>
            <span>{formatCount(template.adds)} adds</span>
          </p>
        </div>
      </Link>
      <div className="absolute top-1 right-1 z-10">
        <VoteButtons
          templateId={template.id}
          score={template.score}
          userVote={template.userVote}
          size="mat"
        />
      </div>
    </Frame>
  );
}

export function BotCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-72 animate-pulse rounded-lg bg-canvas-soft", className)}
    />
  );
}
