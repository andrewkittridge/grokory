import type { BotTemplate, TemplateFilters } from "./types";

export function filterTemplates(
  templates: BotTemplate[],
  filters: TemplateFilters
) {
  const q = filters.q?.trim().toLowerCase();
  const category = filters.category && filters.category !== "all"
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

export function sortByNewest(templates: BotTemplate[]) {
  return [...templates].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

export function featuredTemplates(templates: BotTemplate[]) {
  return templates.filter((template) => template.featured);
}

export function communityTemplates(templates: BotTemplate[]) {
  return sortByNewest(
    templates.filter((template) => template.origin === "community")
  );
}

export function relatedTemplates(templates: BotTemplate[], current: BotTemplate) {
  return templates
    .filter(
      (template) =>
        template.slug !== current.slug && template.category === current.category
    )
    .slice(0, 3);
}
