import type { ListedTemplate, TemplateFilters, Category } from "./types";
import { CATEGORIES } from "./types";
import { sortTemplates } from "./rank";

export function filterTemplates(
  templates: ListedTemplate[],
  filters: TemplateFilters
) {
  const q = filters.q?.trim().toLowerCase();
  const category =
    filters.category && filters.category !== "all"
      ? filters.category
      : undefined;

  return templates.filter((template) => {
    if (category && template.category !== category) return false;
    if (!q) return true;
    const haystack = [
      template.title,
      template.authorName,
      template.summary,
      template.description,
      template.note ?? "",
      template.tags.join(" "),
      template.category,
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
