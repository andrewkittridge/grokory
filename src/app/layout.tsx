import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
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

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Grokory — Grok Bot templates",
    template: "%s · Grokory",
  },
  description:
    "A public ranked board of Grok Bot share links. Upvote the good ones, paste your x.ai/bot URL, and Add to Grok Bot.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
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
