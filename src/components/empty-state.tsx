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
        <GrokBot className="is-ghost" />
      </div>
      <h3 className="mt-6 font-heading text-2xl tracking-tight">{title}</h3>
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
