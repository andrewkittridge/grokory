import type { CSSProperties } from "react";

/** Dark-only Grokdex chrome. CSS :root must match ROOT_VARS. */
export const VISUAL = {
  colorScheme: "dark",
  canvas: "#06060a",
  panel: "#0c0c10",
  ink: "#f3eee6",
  body: "#cfc8be",
  mute: "#8b8680",
  hairline: "#22222a",
  sunset: "#ff7a17",
  accentFamily: "sunset",
  radius: "0px",
} as const;

export const CHROMATIC_ACCENTS = [VISUAL.sunset] as const;

export const JOBS = {
  share: "Share a bot",
  add: "Add to Grok Bot",
  board: "Board",
} as const;

export const INDEPENDENCE =
  "Independent. Not affiliated with xAI or SpaceXAI.";

export const ROOT_VARS = {
  "--background": VISUAL.canvas,
  "--foreground": VISUAL.ink,
  "--card": VISUAL.panel,
  "--card-foreground": VISUAL.ink,
  "--popover": VISUAL.panel,
  "--popover-foreground": VISUAL.ink,
  "--primary": VISUAL.ink,
  "--primary-foreground": VISUAL.canvas,
  "--secondary": VISUAL.panel,
  "--secondary-foreground": VISUAL.body,
  "--muted": VISUAL.panel,
  "--muted-foreground": VISUAL.mute,
  "--accent": VISUAL.panel,
  "--accent-foreground": VISUAL.ink,
  "--border": VISUAL.hairline,
  "--input": VISUAL.hairline,
  "--ring": VISUAL.ink,
  "--sunset": VISUAL.sunset,
  "--canvas-soft": VISUAL.panel,
  "--body": VISUAL.body,
  "--radius": VISUAL.radius,
} as const;

export const visualStyle = {
  colorScheme: VISUAL.colorScheme,
  ...ROOT_VARS,
} as CSSProperties;

export function parseHex(hex: string) {
  const n = hex.startsWith("#") ? hex.slice(1) : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(n)) {
    throw new Error(`expected #rrggbb, got ${hex}`);
  }
  return {
    r: Number.parseInt(n.slice(0, 2), 16),
    g: Number.parseInt(n.slice(2, 4), 16),
    b: Number.parseInt(n.slice(4, 6), 16),
  };
}

export function isNearBlack(hex: string) {
  const { r, g, b } = parseHex(hex);
  return Math.max(r, g, b) <= 24;
}

export function isSunsetFamily(hex: string) {
  const { r, g, b } = parseHex(hex);
  return r >= 200 && g > 60 && g < 180 && b < 80 && r > g && g > b;
}
