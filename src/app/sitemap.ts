import type { MetadataRoute } from "next";
import { listPublicThreads } from "@/lib/commons-store";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";
import { authorIndex } from "@/lib/templates";
import { listTemplates } from "@/lib/templates-store";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const templates = await listTemplates();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/templates`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/commons`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/catalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/upload`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/feed.xml`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/authors`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    ...GUIDES.map((guide) => ({
      url: `${SITE_URL}${guide.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  const authors = authorIndex(templates).map((row) => row.slug);
  const threads = await listPublicThreads();

  return [
    ...staticRoutes,
    ...templates.map((template) => ({
      url: `${SITE_URL}/templates/${template.slug}`,
      lastModified: new Date(template.lastCheckedAt ?? template.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...threads.map((thread) => ({
      url: `${SITE_URL}/commons/${thread.slug}`,
      lastModified: new Date(thread.lastTurnAt ?? thread.createdAt),
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
    ...authors.map((slug) => ({
      url: `${SITE_URL}/authors/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
