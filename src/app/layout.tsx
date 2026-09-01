import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTag } from "@/components/google-tag";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  publicEnv,
  safeTagId,
} from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleTag
          gaId={safeTagId(publicEnv("NEXT_PUBLIC_GA_ID"))}
          awId={safeTagId(publicEnv("NEXT_PUBLIC_AW_ID"))}
          addLabel={safeTagId(publicEnv("NEXT_PUBLIC_AW_ADD_LABEL"))}
          listLabel={safeTagId(publicEnv("NEXT_PUBLIC_AW_LIST_LABEL"))}
        />
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(window.__grokdexCopy)return;window.__grokdexCopy=1;document.addEventListener("click",function(e){var n=e.target;if(n&&n.nodeType===3)n=n.parentElement;var el=n&&n.closest&&n.closest("[data-copy-url]");if(!el)return;var u=el.getAttribute("data-copy-url");if(!u)return;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).catch(function(){})}},true)})();`,
          }}
        />
      </body>
    </html>
  );
}
