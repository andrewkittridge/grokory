import { FAQS } from "./agent";
import { xHandleUrl } from "./bot-url";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absUrl } from "./site";
import type { ListedTemplate } from "./types";

export function organizationJson() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

export function websiteJson() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/templates?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJson() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function itemListJson(templates: ListedTemplate[], path = "/") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} public Grok Bots`,
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
      ...(template.xHandle
        ? { sameAs: xHandleUrl(template.xHandle) }
        : {}),
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
