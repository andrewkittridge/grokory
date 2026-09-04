import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("brand-mark size-5 shrink-0", className)}
    >
      <circle cx="12" cy="13" r="8.4" fill="#c8c0b4" />
      <ellipse
        cx="15.1"
        cy="10.1"
        rx="3.1"
        ry="2"
        fill="#ffffff"
        fillOpacity="0.42"
      />
      <ellipse cx="9.55" cy="12.85" rx="1.2" ry="2.15" fill="#0a0a0a" />
      <ellipse cx="14.35" cy="12.85" rx="1.2" ry="2.15" fill="#0a0a0a" />
    </svg>
  );
}
