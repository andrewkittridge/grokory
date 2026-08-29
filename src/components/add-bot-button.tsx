"use client";

import { ExternalLink } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { recordAdd } from "@/lib/actions";

export function AddBotButton({
  slug,
  botUrl,
  size = "default",
}: {
  slug: string;
  botUrl: string;
  size?: "default" | "lg" | "sm";
}) {
  const [pending, start] = useTransition();

  return (
    <Button
      size={size}
      nativeButton={false}
      disabled={pending}
      render={
        <a
          href={botUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => start(() => recordAdd(slug))}
        />
      }
    >
      Add to Grok Bot
      <ExternalLink data-icon="inline-end" />
    </Button>
  );
}
