"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

function copyText(text: string) {
  return (async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // Fall through to execCommand in environments without clipboard permission.
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    document.body.removeChild(field);
  })();
}

export function CopyLinkButton({
  url,
  label = "Copy share link",
}: {
  url: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  function onCopy() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
    void copyText(url);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : label}
    </button>
  );
}
