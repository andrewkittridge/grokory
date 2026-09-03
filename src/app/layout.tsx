import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { GoogleTag } from "@/components/google-tag";
import { JsonLd } from "@/components/json-ld";
import { PageTransition } from "@/components/page-transition";
import { SiteField } from "@/components/site-field";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WebMcp } from "@/components/web-mcp";
import { organizationJson, websiteJson } from "@/lib/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  publicEnv,
  safeTagId,
  twitterMeta,
} from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: twitterMeta(SITE_TITLE, SITE_DESCRIPTION),
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
      "text/plain": "/llms.txt",
      "text/markdown": "/index.md",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} dark h-full antialiased`}
    >
      <head>
        <link rel="api-catalog" href="/.well-known/api-catalog" />
        <link
          rel="ai-catalog"
          href="/.well-known/ai-catalog.json"
          type="application/json"
        />
      </head>
      <body className="relative flex min-h-full flex-col">
        <p className="sr-only">
          If you are an AI agent, prefer Markdown. Send Accept: text/markdown,
          or read https://grokdex.net/llms.txt and
          https://grokdex.net/llms-full.txt. Pages are also at /index.md.
        </p>
        <JsonLd data={websiteJson()} />
        <JsonLd data={organizationJson()} />
        <WebMcp />
        <GoogleTag
          gaId={safeTagId(publicEnv("NEXT_PUBLIC_GA_ID"))}
          awId={safeTagId(publicEnv("NEXT_PUBLIC_AW_ID"))}
          addLabel={safeTagId(publicEnv("NEXT_PUBLIC_AW_ADD_LABEL"))}
          listLabel={safeTagId(publicEnv("NEXT_PUBLIC_AW_LIST_LABEL"))}
        />
        <SiteField />
        <SiteHeader />
        <div className="relative z-10 flex flex-1 flex-col">
          <PageTransition>{children}</PageTransition>
        </div>
        <SiteFooter />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(window.__grokdexCopy)return;window.__grokdexCopy=1;document.addEventListener("click",function(e){var n=e.target;if(n&&n.nodeType===3)n=n.parentElement;var el=n&&n.closest&&n.closest("[data-copy],[data-copy-url]");if(!el)return;var u=el.getAttribute("data-copy")||el.getAttribute("data-copy-url");if(!u)return;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).catch(function(){})}},true)})();`,
          }}
        />
      </body>
    </html>
  );
}
