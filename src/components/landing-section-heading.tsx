import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

export function LandingSectionHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {kicker ? (
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          {kicker}
        </p>
      ) : null}
      <div className={kicker ? "mt-3" : undefined}>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="display-section">{title}</h2>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      <Separator className="mt-5" />
    </div>
  );
}
