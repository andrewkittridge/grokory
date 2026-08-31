import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
    >
      <path
        d="M12 2.75 21.25 12 12 21.25 2.75 12 12 2.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="miter"
      />
      <path
        d="M6.5 12h11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
      <circle cx="12" cy="12" r="1.55" fill="var(--sunset)" />
    </svg>
  );
}
