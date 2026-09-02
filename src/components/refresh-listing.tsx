"use client";

import { useActionState, useState } from "react";
import { createListing } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { TurnstileField } from "@/components/turnstile-field";

export function RefreshListing({
  shareUrl,
  siteKey,
}: {
  shareUrl: string;
  siteKey?: string;
}) {
  const [state, action, pending] = useActionState(createListing, {});
  const [turnstileReset, setTurnstileReset] = useState(0);

  return (
    <form
      action={(formData) => {
        setTurnstileReset((value) => value + 1);
        return action(formData);
      }}
      className="space-y-2"
    >
      <input type="hidden" name="shareUrl" value={shareUrl} />
      <input type="hidden" name="intent" value="refresh" />
      {state.error ? (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="outline"
        disabled={pending}
        className="h-8 px-3 text-xs"
      >
        {pending ? "Refreshing…" : "Refresh from x.ai"}
      </Button>
      {siteKey ? (
        <TurnstileField siteKey={siteKey} resetKey={turnstileReset} />
      ) : null}
    </form>
  );
}
