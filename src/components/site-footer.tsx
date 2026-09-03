import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 border-b border-border py-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.7fr))]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 text-foreground">
              <BrandMark className="size-4" />
              <span className="text-sm tracking-tight">Grokdex</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              The ranked public board of Grok Bot share links. Independent — not
              affiliated with xAI or SpaceXAI.
            </p>
          </div>
          <FooterCol
            title="Board"
            links={[
              { href: "/templates", label: "Ranked board" },
              { href: "/catalog", label: "Catalog parade" },
              { href: "/authors", label: "Authors" },
              { href: "/upload", label: "Share a bot" },
            ]}
          />
          <FooterCol
            title="Learn"
            links={[
              { href: "/guides/what-is-grokdex", label: "What is Grokdex" },
              { href: "/guides/how-to-add", label: "How to add" },
              { href: "/guides/how-to-list", label: "How to list" },
              { href: "/faq", label: "FAQ" },
            ]}
          />
          <FooterCol
            title="More"
            links={[
              { href: "/support", label: "Support" },
              { href: "/feed.xml", label: "RSS", external: true },
              { href: "https://x.ai/bot", label: "x.ai/bot", external: true },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ]}
          />
        </div>
        <div className="py-5 text-xs leading-5 text-muted-foreground">
          <p>
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
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <nav>
      <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
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
                href={link.href}
                className="hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
