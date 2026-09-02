"use client";

import { useEffect, useState } from "react";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Button } from "@/components/ui/button";
import {
  listingPostCaption,
  listingPostText,
  listingTweetIntent,
  type ListingPostOptions,
} from "@/lib/bot-url";
import { cn } from "@/lib/utils";

export function ShareListing({
  title,
  listingUrl,
  category,
  xHandle,
  firstInJob = false,
  compact = false,
}: {
  title: string;
  listingUrl: string;
  category?: string;
  xHandle?: string;
  firstInJob?: boolean;
  compact?: boolean;
}) {
  const options: ListingPostOptions = { category, xHandle, firstInJob };
  const post = listingPostText(title, listingUrl, options);
  const caption = listingPostCaption(title, options);
  const intent = listingTweetIntent(post);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  const pill = compact
    ? "h-8 w-auto px-3 text-[0.8rem]"
    : "h-10 w-full sm:w-auto";

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "contents"}>
      <CopyLinkButton url={post} label="Copy a post" className={pill} />
      <Button
        variant="outline"
        className={pill}
        nativeButton={false}
        render={
          <a href={intent} target="_blank" rel="noopener noreferrer" />
        }
      >
        Post on X
      </Button>
      {canShare ? (
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
      ) : null}
    </div>
  );
}
