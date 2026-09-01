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
    <div className="empty-scan relative overflow-hidden rounded-lg border border-border bg-card px-6 py-16 text-center">
      <h3 className="display-section">{title}</h3>
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
