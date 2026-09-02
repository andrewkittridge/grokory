import Link from "next/link";
import { BotCover } from "@/components/bot-cover";
import { Frame } from "@/components/frame";
import { VoteButtons } from "@/components/vote-buttons";
import { FeaturedMark } from "@/components/feature-cta";
import { formatCount } from "@/lib/bot-url";
import { isFeaturedActive } from "@/lib/featured";
import { motionDelay } from "@/lib/utils";
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
  const coverHeight = size === "lg" ? "h-28 sm:h-32" : "h-24";

  return (
    <Frame
      className="motion-enter h-full"
      matClassName="relative flex h-full flex-col"
      style={motionDelay(delay)}
    >
      <Link
        href={href}
        className="flex min-h-0 flex-1 flex-col focus-visible:ring-1 focus-visible:ring-foreground"
      >
        <div className="px-0">
          <BotCover
            botId={template.botId}
            title={template.title}
            ogImage={template.ogImage}
            className={coverHeight}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col px-3 pt-3 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {isFeaturedActive(template) ? <FeaturedMark /> : null}
            {rank != null ? (
              <span
                className={
                  rank === 1
                    ? "font-mono text-xs tabular-nums text-sunset"
                    : "font-mono text-xs tabular-nums text-muted-foreground"
                }
              >
                #{rank}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-xl font-normal tracking-tight">
            {template.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            by {template.authorName}
            {template.xHandle ? ` · @${template.xHandle}` : ""}
          </p>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
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
