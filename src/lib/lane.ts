/** Closed browse lanes. Filter-only — never a rank boost. */

export const LANES = [
  "product",
  "engineering",
  "research",
  "writing",
  "design",
  "marketing",
  "sales",
  "ops",
  "personal",
  "media",
  "other",
] as const;

export type Lane = (typeof LANES)[number];

export const DEFAULT_LANE: Lane = "other";

export const LANE_LABELS: Record<Lane, string> = {
  product: "Product",
  engineering: "Engineering",
  research: "Research",
  writing: "Writing",
  design: "Design",
  marketing: "Marketing",
  sales: "Sales",
  ops: "Ops",
  personal: "Personal",
  media: "Media",
  other: "Other",
};

export type LaneSource = "marketplace" | "tag" | "keyword" | "other";

export type LaneInput = {
  botId?: string;
  title?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  marketplaceCategory?: string | string[];
};

export type LaneAssignment = {
  lane: Lane;
  source: LaneSource;
};

const LANE_SET = new Set<string>(LANES);

const TAG_TO_LANE: Record<string, Lane> = {
  product: "product",
  engineering: "engineering",
  engineer: "engineering",
  research: "research",
  writing: "writing",
  copy: "writing",
  drafts: "writing",
  design: "design",
  marketing: "marketing",
  sales: "sales",
  ops: "ops",
  operations: "ops",
  personal: "personal",
  media: "media",
  video: "media",
  fantasy: "personal",
  sports: "personal",
};

const MARKETPLACE_CATEGORY_TO_LANE: Record<string, Lane> = {
  sales: "sales",
  marketing: "marketing",
  personal: "personal",
  engineering: "engineering",
  operations: "ops",
  design: "design",
  product: "product",
  "recruiting & people": "ops",
  recruiting: "ops",
  writing: "writing",
  research: "research",
  media: "media",
};

/**
 * Marketplace category → lane for known share IDs (2026-09-04 x.ai/bot/marketplace
 * scrape). Not a live x.ai category API. "From Grok Bot Team" is ignored.
 */
const MARKETPLACE_BOT_LANES: Record<string, Lane> = {
  "-L1yFJ5mtwPgn3O_iYUo_": "marketing",
  "-hmCmHB0ynJGvSKxeINfS": "engineering",
  "0IhyZWxwbf2cFmsmroZQL": "marketing",
  "0LLQmzk-yzwHi0zuiV0lC": "engineering",
  "1xAJYJPes3X7dUM2mk9Di": "personal",
  "8hhdYqfvRzigWstUtcmBZ": "sales",
  AZKaQOsjrAa51Nb4xvTur: "engineering",
  AamPlGjd2lIdDv6seEMXR: "sales",
  "B6nsTFJlkGP4R-BbdIzeV": "sales",
  "BFiw9Y7BzTQ-3jFBAro1X": "marketing",
  "BX4-kOUI2CzphgiYLZ1hb": "personal",
  EbF8AR1wEHSWCGOp9D1qK: "sales",
  Eeu5NZp62OzQjtlY4ons2: "design",
  GVAnpUah1K6PzJtG9EuG9: "sales",
  KDahOjiDbbAvxqx9KaGcq: "ops",
  KQnsHIvv4_Xk7HyhmewP3: "design",
  MK5zStpj_As8CsRwg3r6w: "marketing",
  "NqdH9qGvrq-yWRaXhJGM-": "design",
  O3iqVd_ZrdRtrDJpxcKss: "sales",
  PaYvPhWPSynlUwFqMX7nc: "personal",
  PlsyvUb0KnHIQr6psoy0L: "sales",
  PwWb6fJXpeG857af6tEYi: "personal",
  "Q3VCc_x0Y8lWd4m-rung2": "marketing",
  RO8GwQZFXL9O95i13epqF: "marketing",
  RpAQeGjhzaiO6_Rq_4fyC: "sales",
  Rw8d83KAzTYQWBAtAscin: "sales",
  SxqbG1NT5qEw7ggmHqQu_: "engineering",
  "TxB-fy1KryaYJLYWBcGtT": "product",
  "V8XugyLxzbQXLM9o5b3B-": "marketing",
  "X-hZf_AreWNt-ZQPYs0Ev": "sales",
  X4NHZvN9cvBBS5EgdjsLx: "personal",
  YklttiPpAHweKbOLV1TSF: "sales",
  "YwxIbVEWqXN-HYCxiMCoB": "marketing",
  _DnP777DCicZpaTtm9_h5: "ops",
  _rzRrKKlUyBD3znUN5b3Q: "marketing",
  "aUF_wTHXGWKU3-QPm6PmN": "sales",
  "afZj-XnYkThA4MB7GfZK6": "ops",
  aw0Zj54sIsAK7vMnajdz0: "product",
  c47Jj2QSSR1UXEcuBgUtQ: "personal",
  cht7ytAhe3euOQy2wnEg9: "personal",
  dGYdqS9vLSXpxoNCPBHys: "personal",
  estQ8HWdKqhheDNmOGjcy: "sales",
  gadc3bVOsg9iIwmzAGRve: "marketing",
  gj3IlHOOpzecm6xpmPJOt: "sales",
  hp7QlVUPuYUp09kc6IFAA: "ops",
  "i03IaF768-ielyzegoGye": "sales",
  i2hvaEONDg6_gEF5C9RlK: "engineering",
  jHT5FLhpCMx7JeIq9BEHY: "marketing",
  kGiyk73f5CF8XtBMIh0gW: "marketing",
  oPDkINUfpUXhJDdsfRZht: "marketing",
  "p7Gh6HIrfv4AGzIow6-9X": "ops",
  pXNvc_U2cGyZmheYrUuF_: "design",
  "ph-u_zkF5Vui1GdGnysn9": "product",
  q4u8YgzGQqCAOUZcg0Lgt: "personal",
  qBFjPRQ3IbHG69qIFHblE: "marketing",
  qDtCI8WZgVJKbN3rogL8j: "personal",
  tIas6udS9kSXpcAz6LFd1: "personal",
  v1lSvhJCo4UrNGZxc5Fw8: "sales",
  "vIX2YW6rr6nQnf8-Rhyzc": "ops",
  "vZfC76-4UC1XU7qC4m726": "sales",
  wtEIGNZ8oipDDVQTDHMPB: "marketing",
  "wtq-j01kD7o8gQFx7E9zv": "marketing",
  yTeKCLayahHnMdHFG9GJg: "personal",
  yZ5MFQFdl32vHt6fcIJAc: "sales",
  "zkVS-PkX1ooTE2nP21DPO": "sales",
};

const TITLE_HINTS: [string, Lane][] = [
  ["writing bot", "writing"],
  ["video editor", "media"],
  ["image gen", "media"],
  ["clip bot", "media"],
  ["figma bro", "design"],
  ["grok build", "engineering"],
  ["engineer bot", "engineering"],
  ["nightly audit engineer", "engineering"],
  ["engineering", "engineering"],
  ["engineer", "engineering"],
  ["product", "product"],
  ["research", "research"],
  ["writing", "writing"],
  ["writer", "writing"],
  ["design", "design"],
  ["marketing", "marketing"],
  ["sales", "sales"],
  ["operations", "ops"],
  ["ops", "ops"],
  ["personal", "personal"],
  ["media", "media"],
  ["health", "personal"],
  ["fantasy", "personal"],
  ["loops", "engineering"],
  ["email", "ops"],
];

const KEYWORD_PHRASES: { lane: Exclude<Lane, "other">; phrases: string[] }[] = [
  {
    lane: "engineering",
    phrases: [
      "engineering manager",
      "engineering supervisor",
      "engineering auditor",
      "engineering outer",
      "outer-loop engineering",
      "coding agent",
      "codebase",
      "pstack",
      "grok build",
      "cloud agent",
      "build agent",
      "cursor/agent",
      "mcp + skills",
    ],
  },
  {
    lane: "research",
    phrases: [
      "primary-source",
      "primary source",
      "cited answers",
      "fact-check",
      "fact check",
      "research desk",
    ],
  },
  {
    lane: "writing",
    phrases: [
      "writing partner",
      "writing bot",
      "revising essays",
      "essays, emails, docs",
      "polished prose",
    ],
  },
  {
    lane: "design",
    phrases: [
      "design critique",
      "designs in figma",
      "figma",
      "alt text",
      "art director",
    ],
  },
  {
    lane: "product",
    phrases: [
      "product judgment",
      "product idea",
      "startup idea",
      "what to ship",
      "indie app",
      "competitor watch",
    ],
  },
  {
    lane: "marketing",
    phrases: [
      "search ads",
      "ad spend",
      "marketing",
      "ai search visibility",
      "event producer",
      "x posters",
      "for you",
    ],
  },
  {
    lane: "sales",
    phrases: [
      "pitch deck",
      "meddic",
      "sales call",
      "pre-call",
      "account plan",
      "deal inspector",
      "follow-up list",
    ],
  },
  {
    lane: "ops",
    phrases: [
      "executive assistant",
      "ruthless triage",
      "job seekers",
      "open roles",
      "conference rooms",
    ],
  },
  {
    lane: "personal",
    phrases: [
      "fantasy football",
      "street-cleaning",
      "houseplant",
      "credit card",
      "bland ai",
      "phone calls",
      "training, sleep",
      "be happier",
    ],
  },
  {
    lane: "media",
    phrases: [
      "stills and clips",
      "image gen",
      "video editor",
      "captioned social clips",
      "youtube interviews",
      "owner footage",
    ],
  },
];

export function isLane(value: string | undefined | null): value is Lane {
  return Boolean(value && LANE_SET.has(value));
}

export function parseLane(value: string | undefined | null): Lane | undefined {
  if (!value) return undefined;
  const key = value.trim().toLowerCase();
  if (isLane(key)) return key;
  if (key === "operations") return "ops";
  const fromLabel = LANES.find(
    (lane) => LANE_LABELS[lane].toLowerCase() === key
  );
  return fromLabel;
}

export function laneLabel(lane: Lane) {
  return LANE_LABELS[lane];
}

export function marketplaceLane(botId?: string): Lane | undefined {
  if (!botId) return undefined;
  return MARKETPLACE_BOT_LANES[botId];
}

export function marketplaceCategoryLane(
  categories?: string[] | string
): Lane | undefined {
  const list = Array.isArray(categories)
    ? categories
    : categories
      ? [categories]
      : [];
  for (const raw of list) {
    const key = raw.trim().toLowerCase();
    if (!key || key === "from grok bot team") continue;
    const mapped = MARKETPLACE_CATEGORY_TO_LANE[key] ?? parseLane(key);
    if (mapped && mapped !== "other") return mapped;
  }
  return undefined;
}

export function assignLane(input: LaneInput): Lane {
  return explainLane(input).lane;
}

export function explainLane(input: LaneInput): LaneAssignment {
  const fromMarket =
    marketplaceLane(input.botId) ??
    marketplaceCategoryLane(input.marketplaceCategory);
  if (fromMarket) return { lane: fromMarket, source: "marketplace" };

  const fromTag = tagLane(input.tags);
  if (fromTag) return { lane: fromTag, source: "tag" };

  const fromText = textLane(input);
  if (fromText) return { lane: fromText, source: "keyword" };

  return { lane: DEFAULT_LANE, source: "other" };
}

export function boardSearchHref(params: {
  q?: string;
  tag?: string;
  skill?: string;
  sort?: string;
  lane?: string;
}) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.tag) search.set("tag", params.tag);
  if (params.skill) search.set("skill", params.skill);
  if (params.lane) search.set("lane", params.lane);
  if (params.sort && params.sort !== "hot") search.set("sort", params.sort);
  const qs = search.toString();
  return qs ? `/templates?${qs}` : "/templates";
}

export function laneCounts(
  templates: Array<{ lane?: string | null }>
): { lane: Lane; count: number }[] {
  const counts = Object.fromEntries(LANES.map((lane) => [lane, 0])) as Record<
    Lane,
    number
  >;
  for (const template of templates) {
    const lane = parseLane(template.lane) ?? DEFAULT_LANE;
    counts[lane] += 1;
  }
  return LANES.map((lane) => ({ lane, count: counts[lane] }));
}

function tagLane(tags?: string[]): Lane | undefined {
  if (!tags) return undefined;
  for (const tag of tags) {
    const key = tag.trim().toLowerCase();
    if (!key) continue;
    const mapped = TAG_TO_LANE[key] ?? parseLane(key);
    if (mapped && mapped !== "other") return mapped;
  }
  return undefined;
}

function textLane(input: LaneInput): Lane | undefined {
  const title = (input.title ?? "").trim();
  const fromTitle = titleHint(title);
  if (fromTitle) return fromTitle;

  const haystack = [title, input.summary ?? "", input.description ?? ""]
    .join(" ")
    .toLowerCase();
  let best: { lane: Lane; score: number } | undefined;
  for (const group of KEYWORD_PHRASES) {
    let score = 0;
    for (const phrase of group.phrases) {
      if (hasPhrase(haystack, phrase)) score += phrase.split(/\s+/).length;
    }
    if (score === 0) continue;
    if (!best || score > best.score) best = { lane: group.lane, score };
  }
  return best?.lane;
}

function titleHint(title: string): Lane | undefined {
  const t = title.trim().toLowerCase();
  if (!t) return undefined;
  for (const [needle, lane] of TITLE_HINTS) {
    if (t === needle) return lane;
    if (t.startsWith(`${needle} `) || t.startsWith(`${needle}:`)) return lane;
    if (t.includes(`'s ${needle}`)) return lane;
  }
  return undefined;
}

function hasPhrase(haystack: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i").test(
    haystack
  );
}
