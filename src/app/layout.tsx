import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Grokory — Ranked Grok Bot catalog";
const description =
  "A public ranked catalog of Grok Bot templates. Browse specialist agents, upvote the useful ones, and add a copy to your Grok account.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s · Grokory",
  },
  description,
  openGraph: {
    title,
    description,
    siteName: "Grokory",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
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
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(window.__grokoryCopy)return;window.__grokoryCopy=1;document.addEventListener("click",function(e){var n=e.target;if(n&&n.nodeType===3)n=n.parentElement;var el=n&&n.closest&&n.closest("[data-copy-url]");if(!el)return;var u=el.getAttribute("data-copy-url");if(!u)return;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).catch(function(){})}},true)})();`,
          }}
        />
      </body>
    </html>
  );
}
