import Link from "next/link";
import { LegalDoc } from "@/components/legal-doc";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms",
  description:
    "Terms for using Grokdex, listing public Grok Bot share links, paid featured placement, board boosts, and using the board.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalDoc kicker="Legal" title="Terms" updated="1 September 2026">
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
        An optional X handle is a public label, not Sign in with X, and not
        proof that you own that account.
        Listings are user-generated. We may refuse, edit, or remove a listing
        (including spam, malware, impersonation, or anything that looks like an
        official xAI product).         Duplicate share URLs are not listed twice; paste
        the same URL again to refresh the listing from x.ai or change the tags
        or note. The first X handle sticks. We
        may hide a listing from the board when its x.ai share link returns 404.
      </p>

      <h2>Voting</h2>
      <p>
        Votes are one per browser per bot, tracked with a cookie. Do not
        automate votes or impersonate other listers.
      </p>

      <h2>Tips, featured placement, and boosts</h2>
      <p>
        Listing a bot is free. You may optionally send a tip or buy featured
        placement through Stripe. Tips are voluntary support for the site. They
        are not tax-deductible and they do not change rank or unlock a pin.
        Featured placement is paid advertising: a labeled pin on the home board
        and catalog for a stated number of days. A boost is paid advertising on
        the ranked board only; it is not a homepage pin. Neither
        changes organic hot, top, or new scores, and neither is an endorsement
        by Grokdex, xAI, or SpaceXAI. We may refuse, move, or remove a paid pin
        or boost (including spam, malware, impersonation, or a down share
        link). Payments are processed by Stripe. Refunds for unused featured or
        boost time are at our discretion.
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
