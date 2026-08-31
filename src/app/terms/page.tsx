import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal-doc";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms for using Grokdex, listing public Grok Bot share links, and using the board.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDoc kicker="Legal" title="Terms" updated="31 August 2026">
      <p>
        Grokdex is an independent catalog of public Grok Bot share links at{" "}
        <a href="https://grokdex.net">grokdex.net</a>. It is not affiliated with,
        endorsed by, or operated by xAI or SpaceXAI. By using the site you
        agree to these terms.
      </p>

      <h2>The service</h2>
      <p>
        Grokdex indexes public share URLs of the form{" "}
        <span className="font-mono text-foreground">https://x.ai/bot/…</span>.
        Rankings come from browser votes.{" "}
        <Link href="/upload">Share a bot</Link> lists a link on the board. Add
        opens that link on x.ai so you can copy the template onto your own Grok
        Bot account. Grokdex does not run the bot, share the author’s computer,
        or transfer logins or chats.
      </p>

      <h2>Listings you publish</h2>
      <p>
        Only paste a share link you are allowed to make public. You are
        responsible for the listing text and for the bot behind the link.
        Listings are user-generated. We may refuse, edit, or remove a listing
        (including spam, malware, impersonation, or anything that looks like an
        official xAI product). Duplicate share URLs are not listed twice.
      </p>

      <h2>Voting</h2>
      <p>
        Votes are one per browser per bot, tracked with a cookie. Do not
        automate votes or impersonate other listers.
      </p>

      <h2>No official Grok or xAI status</h2>
      <p>
        Grokdex is not the Grok Bot product. Names, logos, and bots on x.ai
        belong to their owners. A listing on this board does not mean xAI,
        SpaceXAI, or Grokdex reviewed or approved the bot.
      </p>

      <h2>Availability</h2>
      <p>
        The site is provided as is. Rankings, previews, and lookups can be
        wrong, delayed, or unavailable. We are not liable for bots you add from
        a listing or for downtime.
      </p>

      <h2>Privacy</h2>
      <p>
        How cookies and listings are handled is described in the{" "}
        <Link href="/privacy">Privacy</Link> page.
      </p>
    </LegalDoc>
  );
}
