export const CATEGORIES = [
  "Work",
  "Founder",
  "Coding",
  "Research",
  "Writing",
  "Sales",
  "Ops",
  "Creative",
  "Learning",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type TemplateOrigin = "curated" | "community";

export type BotTemplate = {
  id: string;
  slug: string;
  botId: string;
  botUrl: string;
  title: string;
  authorName: string;
  summary: string;
  description: string;
  ogImage?: string;
  category: Category;
  tags: string[];
  note?: string;
  submittedBy: string;
  origin: TemplateOrigin;
  featured: boolean;
  createdAt: string;
  adds: number;
};

export type BotPreview = {
  botId: string;
  botUrl: string;
  title: string;
  authorName: string;
  summary: string;
  description: string;
  ogImage?: string;
};

export type TemplateFilters = {
  q?: string;
  category?: string;
  origin?: "all" | TemplateOrigin;
};
