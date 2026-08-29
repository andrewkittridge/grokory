import type { CSSProperties } from "react";

export function botAccent(botId: string) {
  let hash = 0;
  for (const char of botId) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return {
    "--blob-0": `oklch(0.55 0.14 ${hue})`,
    "--blob-1": `oklch(0.42 0.1 ${(hue + 40) % 360})`,
    "--blob-2": `oklch(0.28 0.06 ${(hue + 80) % 360})`,
    "--blob-3": `oklch(0.2 0.03 ${hue})`,
  } as CSSProperties;
}

export function BotCover({
  botId,
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
      className={`bot-cover relative overflow-hidden ${className ?? "h-36"}`}
      style={botAccent(botId)}
    >
      {ogImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ogImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-heading text-3xl text-white/80 italic">
          {title.slice(0, 1)}
        </span>
      )}
    </div>
  );
}
