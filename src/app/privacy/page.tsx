import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal-doc";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Grokdex handles cookies, listings, payments, and optional advertising measurement.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDoc kicker="Legal" title="Privacy" updated="1 September 2026">
      <p>
        Grokdex (<a href="https://grokdex.net">grokdex.net</a>) is an independent
        public catalog of Grok Bot share links. It is not affiliated with xAI or
        SpaceXAI. This page describes what the site stores when you browse, vote,
        or list a bot.
      </p>

      <h2>What Grokdex is</h2>
      <p>
        Listings are public <a href="https://x.ai/bot">x.ai/bot</a> share URLs
        that anyone can paste on{" "}
        <Link href="/upload">Share a bot</Link>. Adding a bot opens that share
        link on x.ai and copies the template onto your Grok account. Grokdex does
        not host bots, chats, or logins.
      </p>

      <h2>Information we store</h2>
      <ul>
        <li>
          <strong className="text-foreground">Voter cookie.</strong> Voting uses an
          httpOnly cookie named <code className="text-foreground">grokdex_voter</code>{" "}
          with a random identifier. It lasts about one year, is not an account,
          and is used only so one browser can cast one vote per listing. We do
          not collect a name or email to vote.
        </li>
        <li>
          <strong className="text-foreground">Listings you publish.</strong> The
          public share URL, bot name, author, optional X handle, description, category, optional
          tags, optional note, and an optional display name on the listing. That
          content is shown on the board. An X handle is a label you type, not an
          X login. We do not verify that you own that account.
        </li>
        <li>
          <strong className="text-foreground">Add counts.</strong> When you click
          Add to Grok Bot, we increment a counter on that listing.
        </li>
        <li>
          <strong className="text-foreground">Abuse checks.</strong> Publish on
          /upload may run Cloudflare Turnstile so automated posting is harder.
          Agent listings (POST /api/bots or MCP list_bot) are gated by fetching
          the public x.ai share page for that bot. Re-pasting a listed share URL
          updates that listing. A second X handle on the same bot is rejected.
        </li>
        <li>
          <strong className="text-foreground">Link checks.</strong> We
          periodically fetch public x.ai preview pages to see whether a share
          link still exists, and we store last-checked time, live/down, and any
          skill or routine names the preview exposes.
        </li>
        <li>
          <strong className="text-foreground">Reports.</strong> If you email a
          listing report, we receive the listing URL and whatever you write in
          that message.
        </li>
        <li>
          <strong className="text-foreground">Payments.</strong> Tips and
          featured placement are processed by Stripe. Stripe receives the
          payment details you enter on Checkout (typically email and card). We
          store the Checkout session id, amount, and — for featured placement —
          which listing was paid for, so we can pin it until it expires. We do
          not store full card numbers.
        </li>
        <li>
          <strong className="text-foreground">Logs.</strong> Standard request
          logs (time, path, coarse location via the CDN) for operating the site.
        </li>
      </ul>

      <h2>Advertising and analytics tags</h2>
      <p>
        If Google tags are configured on this site, Google may set cookies or
        use similar storage to measure visits and conversions (for example,
        listing a bot or clicking Add). Those tags load only when a measurement
        ID is set. We do not run remarketing audiences on Grokdex today. Google
        describes how it uses data at{" "}
        <a href="https://business.safety.google/privacy/">
          business.safety.google/privacy
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        The voter cookie is required for the vote feature to work as designed.
        Advertising/analytics cookies, if present, come from Google tags and
        are used for measurement, not to log you into Grokdex. You can block
        cookies in your browser; votes may not stick if the voter cookie is
        cleared.
      </p>

      <h2>Third parties</h2>
      <p>
        Bot previews and Add open x.ai. Payments go through Stripe. Listings,
        votes, add counts, and paid-placement records are stored in a database
        we operate (currently Neon) and the site is served by Cloudflare. We do
        not sell your personal information.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Listings stay until they are removed. Vote records stay for as long as
        the listing exists, keyed to the voter cookie. The voter cookie expires
        after about one year unless you vote again from that browser.
      </p>

      <h2>Children</h2>
      <p>
        Grokdex is not directed at children under 13, and we do not knowingly
        collect personal information from them.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, we will update the date above. Continued use of
        Grokdex after a change means the updated policy applies.
      </p>
    </LegalDoc>
  );
}
