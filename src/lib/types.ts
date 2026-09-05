export type TemplateOrigin = "curated" | "community";

export const BOT_MARK_SHAPES = ["teardrop", "blob"] as const;

export type BotMarkShape = (typeof BOT_MARK_SHAPES)[number];

/** Share-page identity: coat colors plus a named silhouette or custom head path. */
export type BotMark = {
  coatLight: string;
  coatDark: string;
  shape?: BotMarkShape;
  headPath?: string;
};

import type { Lane } from "./lane";

export type { Lane };

export type SortMode = "hot" | "top" | "new";

export type VoteValue = 1 | -1;

export type Vote = {
  voterId: string;
  templateId: string;
  value: VoteValue;
};

export type BotTemplate = {
  id: string;
  slug: string;
  botId: string;
  botUrl: string;
  title: string;
  authorName: string;
  xHandle?: string;
  summary: string;
  description: string;
  ogImage?: string;
  mark?: BotMark;
  tags: string[];
  lane: Lane;
  note?: string;
  submittedBy: string;
  origin: TemplateOrigin;
  featured: boolean;
  featuredUntil?: string;
  boostedUntil?: string;
  createdAt: string;
  adds: number;
  live: boolean;
  lastCheckedAt?: string;
  skills: string[];
  routines: string[];
};

export type ListedTemplate = BotTemplate & {
  score: number;
  userVote: 0 | VoteValue;
};

export type BotPreview = {
  botId: string;
  botUrl: string;
  title: string;
  authorName: string;
  summary: string;
  description: string;
  ogImage?: string;
  addHref?: string;
  mark?: BotMark;
  skills: string[];
  routines: string[];
};

export type TemplateFilters = {
  q?: string;
  tag?: string;
  skill?: string;
  lane?: string;
  sort?: SortMode;
};
