import Link from "next/link";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Frame } from "@/components/frame";
import { LockTitle } from "@/components/lock-title";
import { MissionClock } from "@/components/telemetry";
import { Button } from "@/components/ui/button";
import { listingPostText } from "@/lib/bot-url";

export function ListedBanner({
  title,
  listingUrl,
  featureHref,
}: {
  title: string;
  listingUrl: string;
  featureHref?: string;
}) {
  const post = listingPostText(title, listingUrl);
  const intent = `https://x.com/intent/tweet?text=${encodeURIComponent(post)}`;

  return (
    <Frame staticFrame matClassName="p-5 sm:p-6">
      <p className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        <span className="inline-flex items-center gap-2 text-foreground">
          <span className="live-dot" aria-hidden="true" />
          Listed
        </span>
        <span className="text-border" aria-hidden="true">
          ·
        </span>
        <MissionClock />
      </p>
      <LockTitle as="p" display="section" className="mt-2">
        On the board.
      </LockTitle>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Copy a post for X, or list another bot.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <CopyLinkButton
          url={post}
          label="Copy a post"
          className="sm:w-auto"
        />
        <Button
          variant="outline"
          className="h-10 w-full sm:w-auto"
          nativeButton={false}
          render={
            <a href={intent} target="_blank" rel="noopener noreferrer" />
          }
        >
          Post on X
        </Button>
        {featureHref ? (
          <Button
            variant="outline"
            className="h-10 w-full sm:w-auto"
            nativeButton={false}
            render={<Link href={featureHref} />}
          >
            Feature this bot
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="h-10 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href="/upload" />}
        >
          Share another
        </Button>
      </div>
    </Frame>
  );
}
