import { isBoostedActive, partitionBoosted } from "./boost";
import { isFeaturedActive, partitionFeatured } from "./featured";
import { jobVacancy, type BoardVacancy } from "./founding";
import type { ListedTemplate, TemplateFilters, Category } from "./types";
import { CATEGORIES } from "./types";
import { sortTemplates } from "./rank";

export const CATALOG_LANE_FLOOR = 4;
export const CATALOG_EMPTY_OPENS = 3;

export type CategoryLane = {
  category: Category;
  templates: ListedTemplate[];
};

export type CatalogToken =
  | {
      kind: "listed";
      key: string;
      template: ListedTemplate;
      featured: boolean;
      boosted: boolean;
    }
  | {
      kind: "open";
      key: string;
      vacancy: BoardVacancy;
    };

export function categoryAnchor(category: Category) {
  return `job-${category.toLowerCase()}`;
}

export function filterTemplates(
  templates: ListedTemplate[],
  filters: TemplateFilters
) {
  const q = filters.q?.trim().toLowerCase();
  const category =
    filters.category && filters.category !== "all"
      ? filters.category
      : undefined;
  const tag = filters.tag?.trim().toLowerCase();

  return templates.filter((template) => {
    if (category && template.category !== category) return false;
    if (tag && !template.tags.some((item) => item === tag)) return false;
    if (!q) return true;
    const haystack = [
      template.title,
      template.authorName,
      template.xHandle ?? "",
      template.summary,
      template.description,
      template.note ?? "",
      template.tags.join(" "),
      template.category,
      template.skills.join(" "),
      template.routines.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function populatedCategories(templates: ListedTemplate[]): Category[] {
  const present = new Set(templates.map((template) => template.category));
  return CATEGORIES.filter((category) => present.has(category));
}

export function relatedTemplates(
  templates: ListedTemplate[],
  current: ListedTemplate
) {
  return sortTemplates(
    templates.filter(
      (template) =>
        template.slug !== current.slug && template.category === current.category
    ),
    "hot"
  ).slice(0, 3);
}

export function groupTemplatesByCategory(
  templates: ListedTemplate[],
  now = Date.now()
): CategoryLane[] {
  const { featured, organic } = partitionFeatured(templates, now);
  return CATEGORIES.map((category) => {
    const featuredInJob = featured.filter(
      (template) => template.category === category
    );
    const organicInJob = organic.filter(
      (template) => template.category === category
    );
    const { boosted, rest } = partitionBoosted(organicInJob, category, now);
    return {
      category,
      templates: [...featuredInJob, ...boosted, ...sortTemplates(rest, "hot")],
    };
  });
}

export function catalogLaneTokens(
  lane: CategoryLane,
  now = Date.now()
): CatalogToken[] {
  const listed: CatalogToken[] = lane.templates.map((template) => ({
    kind: "listed",
    key: template.id,
    template,
    featured: isFeaturedActive(template, now),
    boosted: isBoostedActive(template, now),
  }));
  const vacancy = jobVacancy(lane.category);
  const opens =
    listed.length === 0
      ? CATALOG_EMPTY_OPENS
      : Math.max(0, CATALOG_LANE_FLOOR - listed.length);
  const tokens = [...listed];
  for (let index = 0; index < opens; index += 1) {
    tokens.push({
      kind: "open",
      key: `${lane.category}-open-${index}`,
      vacancy,
    });
  }
  return tokens;
}
