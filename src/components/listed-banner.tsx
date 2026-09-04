import Link from "next/link";
import { LockTitle } from "@/components/lock-title";
import { ShareListing } from "@/components/share-listing";
import { Button } from "@/components/ui/button";
import { addHandleHref } from "@/lib/bot-url";
import { FEATURED_PLANS } from "@/lib/pricing";
import { JOBS } from "@/lib/visual";

export function ListedBanner({
  title,
  listingUrl,
  featureHref,
  shareUrl,
  xHandle,
  summary,
  justLinked = false,
  justUpdated = false,
  founding = false,
}: {
  title: string;
  listingUrl: string;
  featureHref?: string;
  shareUrl?: string;
  xHandle?: string;
  summary?: string;
  justLinked?: boolean;
  justUpdated?: boolean;
  founding?: boolean;
}) {
  const linkHandleHref = shareUrl ? addHandleHref(shareUrl) : "/upload";
  const kicker = justUpdated
    ? "Updated"
    : justLinked
      ? "Handle linked"
      : "On the board";
  const headline = justUpdated
    ? "Updated."
    : justLinked
      ? "Handle linked."
      : "You’re on the board.";
  const blurb = justUpdated
    ? "Share it so someone else can add it."
    : justLinked
      ? "Share the listing with the handle on it."
      : "Share it so someone else can add it.";

  return (
    <div className="border-y border-border py-5 sm:py-6">
      <p className="cmd inline-flex items-center gap-2">
        <span className="live-dot" aria-hidden="true" />
        {kicker}
      </p>
      <LockTitle as="p" display="section" className="mt-2">
        {headline}
      </LockTitle>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{blurb}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <ShareListing
          title={title}
          listingUrl={listingUrl}
          xHandle={xHandle}
          summary={summary}
          hero
        />
        {!xHandle ? (
          <Button
            variant="outline"
            className="h-10 w-full sm:w-auto"
            nativeButton={false}
            render={<Link href={linkHandleHref} />}
          >
            Add @handle
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="h-10 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href="/upload" />}
        >
          {JOBS.share}
        </Button>
        {!founding && featureHref ? (
          <Button
            variant="ghost"
            className="h-10 w-full sm:w-auto"
            nativeButton={false}
            render={<Link href={featureHref} />}
          >
            Pin for {FEATURED_PLANS[0].priceLabel} ·{" "}
            {FEATURED_PLANS[0].durationLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
