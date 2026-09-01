import { SITE_NAME, SITE_URL, absUrl } from "./site";
import type { ListedTemplate } from "./types";

export function itemListJson(templates: ListedTemplate[], path = "/") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} ranked Grok Bots`,
    url: absUrl(path),
    numberOfItems: templates.length,
    itemListElement: templates.map((template, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absUrl(`/templates/${template.slug}`),
      name: template.title,
    })),
  };
}

export function softwareJson(template: ListedTemplate, listingUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: template.title,
    applicationCategory: "DeveloperApplication",
    description: template.summary,
    url: listingUrl,
    author: {
      "@type": "Person",
      name: template.authorName,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isRelatedTo: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
