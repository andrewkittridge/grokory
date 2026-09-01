import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absUrl } from "@/lib/site";
import { sortTemplates } from "@/lib/rank";
import { listTemplates } from "@/lib/templates-store";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const templates = sortTemplates(await listTemplates(), "new").slice(0, 50);
  const items = templates
    .map((template) => {
      const url = absUrl(`/templates/${template.slug}`);
      return `<item>
  <title>${escapeXml(template.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid>${escapeXml(url)}</guid>
  <pubDate>${new Date(template.createdAt).toUTCString()}</pubDate>
  <description>${escapeXml(template.summary)}</description>
  <category>${escapeXml(template.category)}</category>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(SITE_NAME)}</title>
  <link>${SITE_URL}</link>
  <description>${escapeXml(SITE_DESCRIPTION)}</description>
  ${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
