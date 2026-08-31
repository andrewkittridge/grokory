import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
    >
      <path d="M12 2.4 21.6 12 12 21.6 2.4 12 12 2.4Z" fill="#111111" />
      <path d="M12 2.4 21.6 12 12 12Z" fill="white" fillOpacity="0.28" />
      <path d="M12 12 21.6 12 12 21.6Z" fill="white" fillOpacity="0.1" />
      <path d="M12 2.4 12 12 2.4 12Z" fill="white" fillOpacity="0.06" />
      <path d="M12 12 2.4 12 12 21.6Z" fill="black" fillOpacity="0.55" />
      <path
        d="M12 2.4 21.6 12 12 21.6 2.4 12 12 2.4Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="miter"
      />
      <path
        d="M12 6.6 17.4 12 12 17.4 6.6 12 12 6.6Z"
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinejoin="miter"
        opacity="0.35"
      />
      <circle cx="12" cy="12" r="1.65" fill="var(--sunset)" />
    </svg>
  );
}
