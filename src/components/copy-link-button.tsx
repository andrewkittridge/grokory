import { cn } from "@/lib/utils";

export function CopyLinkButton({
  url,
  label = "Copy share link",
  className,
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  return (
    <label
      data-copy-url={url}
      className={cn(
        "copy-share inline-flex h-10 w-full cursor-pointer select-none items-center justify-center rounded-full border border-pill-border bg-transparent px-4 text-sm font-normal hover:bg-canvas-soft focus-within:ring-1 focus-within:ring-foreground",
        className
      )}
    >
      <input type="checkbox" className="sr-only" aria-label={label} />
      <span className="copy-share-idle">{label}</span>
      <span className="copy-share-done">Copied</span>
    </label>
  );
}
