"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton({
  payload,
  children,
  variant = "default",
  size = "lg",
  className,
}: {
  payload: Record<string, unknown>;
  children: ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "lg" | "sm";
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function start() {
    setPending(true);
    setError(undefined);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Checkout did not start.");
    } catch {
      setError("Checkout did not start.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className="w-full"
        onClick={start}
        disabled={pending}
      >
        {pending ? "Opening checkout…" : children}
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
