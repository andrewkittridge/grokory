import Link from "next/link";
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
    <div className="empty-scan relative overflow-hidden border border-border px-6 py-16 text-center">
      <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
        Scanning
      </p>
      <h3 className="mt-3 text-2xl font-normal tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
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
