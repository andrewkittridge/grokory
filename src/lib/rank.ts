import type { ListedTemplate, SortMode } from "./types";

export function hotRank(template: ListedTemplate) {
  const score = template.score;
  const hours = Math.max(
    0,
    (Date.now() - Date.parse(template.createdAt)) / 36e5
  );
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  return sign * order / (hours + 2) ** 1.5;
}

export function sortTemplates(
  templates: ListedTemplate[],
  sort: SortMode = "hot"
) {
  const copy = [...templates];
  if (sort === "new") {
    return copy.sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
  }
  if (sort === "top") {
    return copy.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }
  return copy.sort((a, b) => hotRank(b) - hotRank(a));
}

export function parseSort(value: string | undefined): SortMode {
  if (value === "top" || value === "new" || value === "hot") return value;
  return "hot";
}
