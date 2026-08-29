import type { ListedTemplate, TemplateFilters } from "./types";
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
  const origin =
    filters.origin && filters.origin !== "all" ? filters.origin : undefined;

  return templates.filter((template) => {
    if (category && template.category !== category) return false;
    if (origin && template.origin !== origin) return false;
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

export function featuredTemplates(templates: ListedTemplate[]) {
  return templates.filter((template) => template.featured);
}

export function communityTemplates(templates: ListedTemplate[]) {
  return sortTemplates(
    templates.filter((template) => template.origin === "community"),
    "hot"
  );
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
