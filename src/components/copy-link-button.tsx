export function CopyLinkButton({
  url,
  label = "Copy share link",
}: {
  url: string;
  label?: string;
}) {
  return (
    <label
      data-copy-url={url}
      className="copy-share inline-flex h-10 w-full cursor-pointer select-none items-center justify-center rounded-none border border-border bg-transparent px-4 text-sm font-normal hover:bg-white/5 focus-within:ring-1 focus-within:ring-foreground"
    >
      <input type="checkbox" className="sr-only" aria-label={label} />
      <span className="copy-share-idle">{label}</span>
      <span className="copy-share-done">Copied</span>
    </label>
  );
}
