"use client";

import { useSyncExternalStore } from "react";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Button } from "@/components/ui/button";
import {
  listingPostCaption,
  listingPostText,
  listingTweetIntent,
  type ListingPostOptions,
} from "@/lib/bot-url";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

function canShareSnapshot() {
  return typeof navigator.share === "function";
}

function canShareServer() {
  return false;
}

export function ShareListing({
  title,
  listingUrl,
  xHandle,
  summary,
  compact = false,
  hero = false,
}: {
  title: string;
  listingUrl: string;
  xHandle?: string;
  summary?: string;
  compact?: boolean | "row";
  hero?: boolean;
}) {
  const options: ListingPostOptions = { xHandle, summary };
  const post = listingPostText(title, listingUrl, options);
  const caption = listingPostCaption(title, options);
  const intent = listingTweetIntent(post);
  const row = compact === "row";
  const canShare = useSyncExternalStore(
    subscribe,
    canShareSnapshot,
    canShareServer
  );

  const pill = row
    ? "h-7 w-auto px-2.5 text-[11px]"
    : compact
      ? "h-8 w-auto px-3 text-[0.8rem]"
      : "h-10 w-full sm:w-auto";
  const copyLabel = row ? "Copy" : "Copy a post";
  const postLabel = row ? "Post" : "Post on X";

  const copyButton = (
    <CopyLinkButton
      url={post}
      label={copyLabel}
      className={cn(pill, row && "hidden sm:inline-flex")}
    />
  );
  const postButton = (
    <Button
      variant={hero ? "default" : "outline"}
      className={cn(pill, hero && "btn-ignite")}
      nativeButton={false}
      render={<a href={intent} target="_blank" rel="noopener noreferrer" />}
    >
      {postLabel}
    </Button>
  );
  const nativeShare =
    canShare && !row ? (
      <Button
        variant="outline"
        type="button"
        className={pill}
        onClick={() => {
          void navigator
            .share({ title, text: caption, url: listingUrl })
            .catch(() => {});
        }}
      >
        Share
      </Button>
    ) : null;

  const actions = hero ? (
    <>
      {postButton}
      {copyButton}
      {nativeShare}
    </>
  ) : (
    <>
      {copyButton}
      {postButton}
      {nativeShare}
    </>
  );

  return (
    <div className={compact ? "flex flex-wrap items-center gap-1.5" : "contents"}>
      {actions}
    </div>
  );
}
