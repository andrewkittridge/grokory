import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const ROOM_PIGMENTS = [
  { hue: 250, chroma: 0.04 },
  { hue: 32, chroma: 0.06 },
  { hue: 220, chroma: 0.03 },
  { hue: 18, chroma: 0.05 },
  { hue: 240, chroma: 0.035 },
] as const;

export function botAccent(botId: string) {
  let hash = 0;
  for (const char of botId) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  const pigment = ROOM_PIGMENTS[hash % ROOM_PIGMENTS.length];
  const { hue, chroma } = pigment;
  return {
    "--blob-0": `oklch(0.28 ${chroma} ${hue})`,
    "--blob-1": `oklch(0.22 ${chroma * 0.7} ${(hue + 16) % 360})`,
    "--blob-2": `oklch(0.18 ${chroma * 0.5} ${(hue + 340) % 360})`,
    "--blob-3": `oklch(0.16 ${chroma * 0.3} ${hue})`,
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
      className={cn("bot-cover relative overflow-hidden", className ?? "h-36")}
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
        <span className="absolute inset-0 z-1 flex items-center justify-center text-4xl font-normal text-white/70">
          {title.slice(0, 1)}
        </span>
      )}
    </div>
  );
}
