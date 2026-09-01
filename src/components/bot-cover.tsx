import { cn } from "@/lib/utils";

export function BotCover({
  title,
  ogImage,
  className,
  acquire = false,
}: {
  botId: string;
  title: string;
  ogImage?: string;
  className?: string;
  acquire?: boolean;
}) {
  return (
    <div
      className={cn(
        "bot-cover relative overflow-hidden",
        acquire && "motion-acquire",
        className ?? "h-36"
      )}
    >
      {acquire ? (
        <span className="motion-lock-scan" aria-hidden="true" />
      ) : null}
      {ogImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ogImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span className="absolute inset-0 z-1 flex items-center justify-center text-4xl font-normal text-muted-foreground">
          {title.slice(0, 1)}
        </span>
      )}
    </div>
  );
}
