"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { recordAdd } from "@/lib/actions";
import { trackConversion } from "@/lib/analytics";
import { grokbotTemplateUrl } from "@/lib/bot-url";
import { JOBS } from "@/lib/visual";

export function AddBotButton({
  slug,
  botId,
  size = "default",
}: {
  slug: string;
  botId: string;
  size?: "default" | "lg" | "sm";
}) {
  const [pending, start] = useTransition();
  const addHref = grokbotTemplateUrl(botId);

  return (
    <Button
      size={size}
      className="btn-ignite w-full"
      nativeButton={false}
      disabled={pending}
      render={
        <a
          href={addHref}
          rel="noopener noreferrer"
          onClick={() => {
            trackConversion("add_bot");
            start(() => recordAdd(slug));
          }}
        />
      }
    >
      {JOBS.add}
    </Button>
  );
}
