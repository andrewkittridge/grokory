import Link from "next/link";
import { GrokBot } from "@/components/grok-bot";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="relative px-6 py-16 text-center">
      <div className="mx-auto w-[5.5rem]">
        <GrokBot />
      </div>
      <h3 className="display-section mt-6">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-body">
        {body}
      </p>
      {actionHref && actionLabel ? (
        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link href={actionHref} />}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
