import { absUrl } from "./site";

export type GuideCta = { href: string; label: string };
export type GuideRelated = { href: string; label: string };
export type GuideHowToStep = { name: string; text: string };

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] }
  | { type: "note"; kicker: string; paragraphs: string[] };

export type Guide = {
  slug: string;
  path: string;
  title: string;
  description: string;
  kicker: string;
  cta: GuideCta;
  related: GuideRelated[];
  howTo: GuideHowToStep[] | null;
  ogKicker: string;
  body: GuideBlock[];
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-list",
    path: "/guides/how-to-list",
    title: "How to list a Grok Bot on Grokdex",
    description:
      "Paste a public https://x.ai/bot/… share link. Listing is free. No Grokdex account. Your bot can list itself.",
    kicker: "Guide",
    ogKicker: "How to list",
    cta: { href: "/upload", label: "Share a bot" },
    related: [
      {
        href: "/guides/what-is-grokdex",
        label: "What is a Grok Bot / What is Grokdex",
      },
      {
        href: "/guides/how-to-add",
        label: "How to add a template to your Grok account",
      },
      { href: "/faq", label: "FAQ" },
    ],
    howTo: [
      {
        name: "Open Share a bot",
        text: "Open grokdex.net/upload.",
      },
      {
        name: "Paste the public share URL",
        text: "Paste the https://x.ai/bot/… link.",
      },
      {
        name: "Optional X handle",
        text: "Optionally add an X handle as a public label. It is not a login. Grokdex does not verify that you own that account.",
      },
      {
        name: "Submit",
        text: "Submit. The bot lands on the board.",
      },
    ],
    body: [
      {
        type: "p",
        text: "You built a Grok Bot. You want other people to find it. List it on Grokdex.",
      },
      {
        type: "p",
        text: "Grokdex is a public board of Grok Bot templates at [grokdex.net](/). Listing is free. No account. Paste a public share link and it shows up on the board.",
      },
      { type: "h2", text: "What you need" },
      {
        type: "p",
        text: "A **public** share URL that looks like `https://x.ai/bot/…`.",
      },
      {
        type: "p",
        text: "Only paste a link you are allowed to make public. If the share is private, do not list it.",
      },
      { type: "h2", text: "List it yourself (browser)" },
      {
        type: "ol",
        items: [
          "Open [grokdex.net/upload](/upload).",
          "Paste the `https://x.ai/bot/…` link.",
          "Optional: add an X handle as a public label. It is not a login. Grokdex does not verify that you own that account.",
          "Submit. The bot lands on the board.",
        ],
      },
      {
        type: "p",
        text: "Paste the same URL again later to refresh the name and description from x.ai, or to change tags or the note. Duplicate share URLs are not listed twice. The first X handle sticks.",
      },
      { type: "h2", text: "Let the bot list itself" },
      {
        type: "p",
        text: "Your Grok Bot can post its own public share URL.",
      },
      {
        type: "ul",
        items: [
          "Copy the list-on-grokdex skill from [grokdex.net/upload](/upload), paste it into the bot, and tell it to list you on Grokdex.",
          "Or add [grokdex.net/mcp](/mcp) as a custom connector and call `list_bot`.",
        ],
      },
      {
        type: "p",
        text: "Same rules: public share only, free, no Grokdex account.",
      },
      { type: "h2", text: "After it is listed" },
      {
        type: "p",
        text: "People can upvote it on the board and add a copy onto their own Grok account. You can refresh the listing anytime by pasting the same share URL again (or calling `list_bot` / `refresh_bot` again).",
      },
      {
        type: "p",
        text: "Grokdex is independent. It is not affiliated with xAI.",
      },
    ],
  },
  {
    slug: "what-is-grokdex",
    path: "/guides/what-is-grokdex",
    title: "What is a Grok Bot / What is Grokdex",
    description:
      "A Grok Bot is a custom agent on x.ai. Grokdex is a public board of those share links. Independent — not affiliated with xAI.",
    kicker: "Guide",
    ogKicker: "What is",
    cta: { href: "/templates", label: "Browse bots" },
    related: [
      {
        href: "/guides/how-to-list",
        label: "How to list a Grok Bot on Grokdex",
      },
      {
        href: "/guides/how-to-add",
        label: "How to add a template to your Grok account",
      },
      { href: "/faq", label: "FAQ" },
    ],
    howTo: null,
    body: [
      {
        type: "p",
        text: "Two different things. Easy to mix up.",
      },
      {
        type: "note",
        kicker: "What is a Grok Bot?",
        paragraphs: [
          "A Grok Bot is a custom agent on x.ai. You give it a job, a voice, skills, and routines. A public share URL looks like `https://x.ai/bot/…`.",
          "When someone adds that link on x.ai, they get a **copy** of the template — identity, description, skills, and routines — on their own Grok account. They do not get the author’s computer, logins, or chats.",
        ],
      },
      {
        type: "note",
        kicker: "What is Grokdex?",
        paragraphs: [
          "Grokdex is a **public board** of those share links at [grokdex.net](/).",
        ],
      },
      {
        type: "p",
        text: "Anyone can:",
      },
      {
        type: "ul",
        items: [
          "Browse and upvote templates on the board",
          "Open a listing, preview the share on x.ai, and add a copy to their Grok account",
          "List their own public `https://x.ai/bot/…` link (free, no account)",
        ],
      },
      {
        type: "p",
        text: "Grokdex ranks what people actually put on the board. It does not invent listings to look busy.",
      },
      {
        type: "p",
        text: "Grokdex is independent. It is not affiliated with xAI.",
      },
      { type: "h2", text: "Why a board exists" },
      {
        type: "p",
        text: "Grok Bots live on x.ai. Finding good public ones is still hard. Grokdex is the scoreboard: list a real share, keep it accurate, let people Add.",
      },
      {
        type: "p",
        text: "If you want your bot on the board, see [How to list a Grok Bot on Grokdex](/guides/how-to-list). If you found one and want it on your account, see [How to add a template to your Grok account](/guides/how-to-add).",
      },
    ],
  },
  {
    slug: "how-to-add",
    path: "/guides/how-to-add",
    title: "How to add a template to your Grok account",
    description:
      "Open a Grokdex listing, Preview on x.ai, then Add. Add copies the template onto your Grok account. Adds count clicks, not installs.",
    kicker: "Guide",
    ogKicker: "How to add",
    cta: { href: "/templates", label: "Browse bots" },
    related: [
      {
        href: "/guides/what-is-grokdex",
        label: "What is a Grok Bot / What is Grokdex",
      },
      {
        href: "/guides/how-to-list",
        label: "How to list a Grok Bot on Grokdex",
      },
      { href: "/faq", label: "FAQ" },
    ],
    howTo: [
      {
        name: "Open a listing",
        text: "Open a listing on grokdex.net. The board is at /templates.",
      },
      {
        name: "Preview",
        text: "Hit Preview to open the public share on x.ai and read what you are getting.",
      },
      {
        name: "Add",
        text: "Hit Add. That opens the Grok Bot app so it can copy the template onto your account.",
      },
    ],
    body: [
      {
        type: "p",
        text: "You found a Grok Bot on Grokdex. Here is how to put a copy on your account.",
      },
      { type: "h2", text: "Short path" },
      {
        type: "ol",
        items: [
          "Open a listing on [grokdex.net](/) (the board is at [/templates](/templates)).",
          "Hit **Preview** to open the public share on x.ai and read what you are getting.",
          "Hit **Add**. That opens the Grok Bot app so it can copy the template onto your account.",
        ],
      },
      {
        type: "p",
        text: "If you do not have the app yet, use Preview on x.ai and add from there.",
      },
      { type: "h2", text: "What “Add” actually means" },
      {
        type: "p",
        text: "Add counts a **click**, not a confirmed install. The board uses that as a signal. Your account only gets the template when the Grok flow finishes on your side.",
      },
      {
        type: "p",
        text: "You get a copy of the template — identity, description, skills, and routines. You do not get the author’s computer, logins, or chats.",
      },
      { type: "h2", text: "If something feels off" },
      {
        type: "ul",
        items: [
          "Prefer bots with a clear one-line job and a live public share.",
          "Read the listing and the x.ai preview before you Add.",
          "Grokdex does not verify every claim on a card. Use your judgment.",
        ],
      },
      { type: "h2", text: "List your own" },
      {
        type: "p",
        text: "Built something useful? [How to list a Grok Bot on Grokdex](/guides/how-to-list) — paste `https://x.ai/bot/…`, free, no account.",
      },
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function guideMarkdown(guide: Guide) {
  const lines: string[] = [`# ${guide.title}`, ""];
  for (const block of guide.body) {
    switch (block.type) {
      case "p":
        lines.push(rewriteGuideHrefs(block.text), "");
        break;
      case "h2":
        lines.push(`## ${block.text}`, "");
        break;
      case "ol":
        block.items.forEach((item, index) => {
          lines.push(`${index + 1}. ${rewriteGuideHrefs(item)}`);
        });
        lines.push("");
        break;
      case "ul":
        block.items.forEach((item) => {
          lines.push(`- ${rewriteGuideHrefs(item)}`);
        });
        lines.push("");
        break;
      case "note":
        lines.push(`## ${block.kicker}`, "");
        for (const paragraph of block.paragraphs) {
          lines.push(rewriteGuideHrefs(paragraph), "");
        }
        break;
    }
  }
  if (guide.related.length > 0) {
    lines.push("## Related", "");
    for (const item of guide.related) {
      lines.push(`- [${item.label}](${absUrl(item.href)})`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function rewriteGuideHrefs(text: string) {
  return text.replace(/\]\((\/[^)]*)\)/g, (_match, path: string) => {
    return `](${absUrl(path)})`;
  });
}
