import { FAQS } from "./agent";
import { authorIdentity, xHandleUrl } from "./bot-url";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absUrl } from "./site";
import type { ListedTemplate } from "./types";

export function organizationJson() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: absUrl("/icon.png"),
    },
  };
}

export function websiteJson() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/templates?q={search_term_string}`,
      },
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
      name: authorIdentity(template).name,
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

export function breadcrumbListJson(
  crumbs: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absUrl(crumb.path),
    })),
  };
}

export function howToJson({
  name,
  description,
  url,
  steps,
}: {
  name: string;
  description: string;
  url: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    url,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function definedTermJson() {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Grok Bot",
    description:
      "A Grok Bot is a custom agent on x.ai. A public share URL looks like https://x.ai/bot/…. Adding that link on x.ai copies the template onto your Grok account. Identity, description, skills, and routines. It does not share the author’s computer, logins, or chats.",
    url: absUrl("/guides/what-is-grokdex"),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function personJson(
  name: string,
  path: string,
  sameAs?: string | null
) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: absUrl(path),
    ...(sameAs ? { sameAs } : {}),
  };
}

export function guideListJson(guides: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} guides`,
    url: absUrl("/guides"),
    numberOfItems: guides.length,
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absUrl(guide.path),
      name: guide.name,
    })),
  };
}
