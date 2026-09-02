import type { ListedTemplate, TemplateFilters, Category } from "./types";
import { CATEGORIES } from "./types";
import { authorSlug } from "./bot-url";
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
  const tag = filters.tag?.trim().toLowerCase();
  const skill = filters.skill?.trim().toLowerCase();

  return templates.filter((template) => {
    if (category && template.category !== category) return false;
    if (tag && !template.tags.some((item) => item === tag)) return false;
    if (
      skill &&
      !template.skills.some((item) => item.toLowerCase() === skill)
    ) {
      return false;
    }
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
  const sameJob = sortTemplates(
    templates.filter(
      (template) =>
        template.slug !== current.slug && template.category === current.category
    ),
    "hot"
  ).slice(0, 3);
  if (sameJob.length > 0) return sameJob;

  const currentTags = new Set(current.tags.map((item) => item.toLowerCase()));
  const currentSkills = new Set(
    current.skills.map((item) => item.toLowerCase())
  );
  const scored = templates
    .filter((template) => template.slug !== current.slug)
    .map((template) => {
      let overlap = 0;
      for (const tag of template.tags) {
        if (currentTags.has(tag.toLowerCase())) overlap += 1;
      }
      for (const skill of template.skills) {
        if (currentSkills.has(skill.toLowerCase())) overlap += 1;
      }
      return { template, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  return scored.map((item) => item.template).slice(0, 3);
}

export function isFirstInJob(
  templates: { slug: string; category: string }[],
  current: { slug: string; category: string }
) {
  const same = templates.filter(
    (template) => template.category === current.category
  );
  return same.length === 1 && same[0].slug === current.slug;
}

export function jobRank(
  templates: ListedTemplate[],
  current: ListedTemplate
) {
  const same = sortTemplates(
    templates.filter((template) => template.category === current.category),
    "hot"
  );
  const index = same.findIndex((template) => template.slug === current.slug);
  return index >= 0 ? index + 1 : 0;
}

export type AuthorIndexRow = {
  slug: string;
  name: string;
  handles: string[];
  count: number;
};

export function authorIndex(templates: ListedTemplate[]): AuthorIndexRow[] {
  const bySlug = new Map<
    string,
    { name: string; handles: Set<string>; count: number }
  >();
  for (const template of templates) {
    const slug = authorSlug(template.authorName);
    const row = bySlug.get(slug) ?? {
      name: template.authorName,
      handles: new Set<string>(),
      count: 0,
    };
    row.count += 1;
    if (template.xHandle) row.handles.add(template.xHandle);
    bySlug.set(slug, row);
  }
  return [...bySlug.entries()]
    .map(([slug, row]) => ({
      slug,
      name: row.name,
      handles: [...row.handles],
      count: row.count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
