import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const LINKS = [
  { href: "/templates", label: "Board" },
  { href: "/catalog", label: "Catalog" },
  { href: "/authors", label: "Authors" },
  { href: "/upload", label: "Share a bot" },
  { href: "/guides", label: "Guides" },
  { href: "/guides/how-to-list", label: "How to list" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
  { href: "/feed.xml", label: "RSS", external: true },
  { href: "https://x.ai/bot", label: "x.ai/bot", external: true },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2.5 text-foreground">
          <BrandMark className="size-4" />
          <span className="font-heading text-lg tracking-tight">Grokdex</span>
        </Link>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          The ranked public board of Grok Bot share links. Independent. Not
          affiliated with xAI or SpaceXAI.
        </p>
        <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <p className="mt-8 max-w-2xl text-xs leading-5 text-muted-foreground">
          Grokdex indexes public{" "}
          <a
            href="https://x.ai/bot"
            className="text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Grok Bot
          </a>{" "}
          share links. Adding a bot on x.ai copies the template, not the
          author’s computer or logins.
        </p>
      </div>
    </footer>
  );
}
