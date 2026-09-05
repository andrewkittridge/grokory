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

/** Commons-only SpaceXAI-light. Board :root stays dark. */
export const COMMONS = {
  colorScheme: "light",
  canvas: "#f3f5f8",
  panel: "#ffffff",
  ink: "#12141a",
  body: "#3c4250",
  mute: "#6b7382",
  hairline: "#d5dae3",
  navy: "#1b2d4f",
  focus: "#3b6ea8",
  wash: "#e8ebf0",
  radius: "0px",
} as const;

export const CHROMATIC_ACCENTS = [VISUAL.sunset] as const;

export const JOBS = {
  share: "Share a bot",
  add: "Add to Grok Bot",
  board: "Board",
  commons: "Commons",
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

export const COMMONS_ROOT_VARS = {
  "--background": COMMONS.canvas,
  "--foreground": COMMONS.ink,
  "--card": COMMONS.panel,
  "--card-foreground": COMMONS.ink,
  "--popover": COMMONS.panel,
  "--popover-foreground": COMMONS.ink,
  "--primary": COMMONS.navy,
  "--primary-foreground": COMMONS.canvas,
  "--secondary": COMMONS.panel,
  "--secondary-foreground": COMMONS.body,
  "--muted": COMMONS.wash,
  "--muted-foreground": COMMONS.mute,
  "--accent": COMMONS.wash,
  "--accent-foreground": COMMONS.ink,
  "--border": COMMONS.hairline,
  "--input": COMMONS.hairline,
  "--ring": COMMONS.focus,
  "--sunset": COMMONS.navy,
  "--canvas-soft": COMMONS.wash,
  "--body": COMMONS.body,
  "--radius": COMMONS.radius,
  "--pill-border": "rgb(18 20 26 / 0.16)",
} as const;

export const visualStyle = {
  colorScheme: VISUAL.colorScheme,
  ...ROOT_VARS,
} as CSSProperties;

export const commonsStyle = {
  colorScheme: COMMONS.colorScheme,
  ...COMMONS_ROOT_VARS,
} as CSSProperties;

export function isCommonsPath(path: string) {
  return path === "/commons" || path.startsWith("/commons/");
}

export function applyCommonsShell(on: boolean) {
  const root = document.documentElement;
  if (on) {
    root.dataset.shell = "commons";
    root.style.colorScheme = COMMONS.colorScheme;
    for (const [name, value] of Object.entries(COMMONS_ROOT_VARS)) {
      root.style.setProperty(name, value);
    }
    return;
  }
  delete root.dataset.shell;
  root.style.colorScheme = VISUAL.colorScheme;
  for (const [name, value] of Object.entries(ROOT_VARS)) {
    root.style.setProperty(name, value);
  }
  root.style.removeProperty("--pill-border");
}

export function commonsBootScript() {
  const assigns = Object.entries(COMMONS_ROOT_VARS)
    .map(
      ([name, value]) =>
        `r.style.setProperty(${JSON.stringify(name)},${JSON.stringify(value)});`
    )
    .join("");
  return `(function(){var p=location.pathname;if(p!=="/commons"&&p.indexOf("/commons/")!==0)return;var r=document.documentElement;r.dataset.shell="commons";r.style.colorScheme="light";${assigns}})();`;
}

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

export function isCoolOffWhite(hex: string) {
  const { r, g, b } = parseHex(hex);
  return (
    Math.min(r, g, b) >= 232 &&
    b >= r &&
    Math.abs(r - g) <= 8 &&
    b - r <= 16
  );
}

export function isNavyFamily(hex: string) {
  const { r, g, b } = parseHex(hex);
  return r < 48 && g < 64 && b > 64 && b > r && b > g;
}

export function isRestrainedBlue(hex: string) {
  const { r, g, b } = parseHex(hex);
  return (
    r >= 40 &&
    r < 90 &&
    g >= 90 &&
    g < 140 &&
    b >= 140 &&
    b < 190 &&
    b > g &&
    g > r
  );
}
