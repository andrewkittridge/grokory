import Link from "next/link";
import { Frame } from "@/components/frame";
import { LockTitle } from "@/components/lock-title";
import { ShareListing } from "@/components/share-listing";
import { Button } from "@/components/ui/button";
import { FEATURED_PLANS } from "@/lib/pricing";

export function ListedBanner({
  title,
  listingUrl,
  featureHref,
  shareUrl,
  xHandle,
  justLinked = false,
  justUpdated = false,
}: {
  title: string;
  listingUrl: string;
  featureHref?: string;
  shareUrl?: string;
  xHandle?: string;
  justLinked?: boolean;
  justUpdated?: boolean;
}) {
  const linkHandleHref = shareUrl
    ? `/upload?share=${encodeURIComponent(shareUrl)}`
    : "/upload";
  const kicker = justUpdated
    ? "Updated"
    : justLinked
      ? "Handle linked"
      : "Listed";
  const headline = justUpdated
    ? "Updated."
    : justLinked
      ? "Handle linked."
      : "Listed.";

  return (
    <Frame staticFrame matClassName="p-5 sm:p-6">
      <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        <span className="live-dot" aria-hidden="true" />
        {kicker}
      </p>
      <LockTitle as="p" display="section" className="mt-2">
        {headline}
      </LockTitle>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {xHandle
          ? "Copy a post for X, pin it on the board, or list another bot."
          : "Link an X handle, copy a post, pin it on the board, or list another bot."}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {featureHref ? (
          <Button
            className="h-10 w-full sm:w-auto"
            nativeButton={false}
            render={<Link href={featureHref} />}
          >
            Pin for {FEATURED_PLANS[0].priceLabel} ·{" "}
            {FEATURED_PLANS[0].durationLabel}
          </Button>
        ) : null}
        <ShareListing
          title={title}
          listingUrl={listingUrl}
          xHandle={xHandle}
        />
        {!xHandle ? (
          <Button
            variant="outline"
            className="h-10 w-full sm:w-auto"
            nativeButton={false}
            render={<Link href={linkHandleHref} />}
          >
            Link X handle
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="h-10 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href="/upload" />}
        >
          Share a bot
        </Button>
      </div>
    </Frame>
  );
}
