import { cn } from "@/lib/utils";

export function BotCover({
  title,
  ogImage,
  className,
}: {
  botId: string;
  title: string;
  ogImage?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("bot-cover relative overflow-hidden", className ?? "h-36")}
    >
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
