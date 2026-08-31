export type ConversionEvent = "add_bot" | "list_bot";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __grokdexAds?: {
      awId?: string;
      addLabel?: string;
      listLabel?: string;
    };
    __grokdexCopy?: number;
  }
}

export function trackConversion(name: ConversionEvent) {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;

  gtag("event", name);

  const ads = window.__grokdexAds;
  const label = name === "add_bot" ? ads?.addLabel : ads?.listLabel;
  if (ads?.awId && label) {
    gtag("event", "conversion", { send_to: `${ads.awId}/${label}` });
  }
}
