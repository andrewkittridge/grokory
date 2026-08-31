"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: "dark" | "light" | "auto";
          appearance?: "always" | "execute" | "interaction-only";
        }
      ) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function TurnstileField({
  siteKey,
  resetKey,
}: {
  siteKey: string;
  resetKey: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    function destroy() {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    }

    function paint() {
      const node = ref.current;
      if (cancelled || !node || !window.turnstile) return;
      destroy();
      widgetId.current = window.turnstile.render(node, {
        sitekey: siteKey,
        theme: "dark",
        appearance: "always",
      });
    }

    if (window.turnstile) {
      paint();
      return () => {
        cancelled = true;
        destroy();
      };
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", paint);
    return () => {
      cancelled = true;
      script.removeEventListener("load", paint);
      destroy();
    };
  }, [siteKey, resetKey]);

  return <div ref={ref} className="min-h-[65px]" />;
}
