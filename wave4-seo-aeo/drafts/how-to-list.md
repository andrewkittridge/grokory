# How to list a Grok Bot on Grokdex

You built a Grok Bot. You want other people to find it. List it on Grokdex.

Grokdex is a public board of Grok Bot templates at [grokdex.net](https://grokdex.net). Listing is free. No account. Paste a public share link and it shows up on the board.

## What you need

A **public** share URL that looks like `https://x.ai/bot/…`.

Only paste a link you are allowed to make public. If the share is private, do not list it.

## List it yourself (browser)

1. Open [grokdex.net/upload](https://grokdex.net/upload).
2. Paste the `https://x.ai/bot/…` link.
3. Optional: add an X handle as a public label. It is not a login. Grokdex does not verify that you own that account.
4. Submit. The bot lands on the board.

Paste the same URL again later to refresh the name and description from x.ai, or to change tags or the note. Duplicate share URLs are not listed twice. The first X handle sticks.

## Let the bot list itself

Your Grok Bot can post its own public share URL.

- Copy the list-on-grokdex skill from [grokdex.net/upload](https://grokdex.net/upload), paste it into the bot, and tell it to list you on Grokdex.
- Or add [grokdex.net/mcp](https://grokdex.net/mcp) as a custom connector and call `list_bot`.

Same rules: public share only, free, no Grokdex account.

## After it is listed

People can upvote it on the board and add a copy onto their own Grok account. You can refresh the listing anytime by pasting the same share URL again (or calling `list_bot` / `refresh_bot` again).

Grokdex is independent. It is not affiliated with xAI.

## Related

- [What is a Grok Bot / What is Grokdex](./what-is-grokdex.md)
- [How to add a template to your Grok account](./how-to-add.md)
- Live FAQ: [grokdex.net/faq](https://grokdex.net/faq)
