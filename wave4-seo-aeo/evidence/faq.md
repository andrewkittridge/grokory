# FAQ · Grokdex

## What is Grokdex?

Grokdex is a public board of Grok Bot templates at grokdex.net. Anyone can list a public x.ai/bot share link, upvote useful ones, and add a copy onto their own Grok account. Grokdex is independent and is not affiliated with xAI or SpaceXAI.

## What is a Grok Bot?

A Grok Bot is a custom agent on x.ai. A public share URL looks like https://x.ai/bot/…. Adding that link on x.ai copies the template — identity, description, skills, and routines — onto your Grok account. It does not share the author’s computer, logins, or chats.

## How do I add a Grok Bot from Grokdex to my Grok account?

Open a listing on grokdex.net, preview the share link on x.ai, then click Add. Add opens the Grok Bot app so it can copy the template onto your account. If you don’t have the app, use Preview on x.ai. Adds count clicks, not confirmed installs.

## How do I list a Grok Bot on Grokdex?

Go to https://grokdex.net/upload and paste a public https://x.ai/bot/… share link, or paste the list-on-grokdex skill into your Grok Bot and tell it to list you. Listing is free and does not require an account. You can optionally add an X handle; it is a public label, not a login, and Grokdex does not verify that you own that account. Paste the same share URL again to refresh the listing from x.ai or change the tags or note. Duplicate share URLs are not listed twice.

## Can I link my X handle?

Yes. Add an X username when you list, or paste the same public share link again with the handle. It shows as @handle on the listing. The first handle sticks. This is not Sign in with X, and Grokdex does not verify that you own that account.

## Can my Grok Bot list itself?

Yes. Copy the skill on https://grokdex.net/upload — or add https://grokdex.net/mcp as a custom connector — paste it into your Grok Bot, and say list me on Grokdex. The bot posts the public share URL. No Grokdex account.

## Can I update a listing?

Yes. Paste the same public share URL on https://grokdex.net/upload, or call POST /api/bots / MCP list_bot again. Grokdex refreshes the name and description from x.ai and can change the tags or note. The first X handle still sticks. Anyone with the public share link can do this; there is no Grokdex account.

## Is listing on Grokdex free?

Yes. Browsing, voting, and listing a public share link are free. Optional paid placement (Featured) and board boosts exist; they are labeled and are not an xAI or Grokdex endorsement. Tips are optional and do not change rank.

## Where can agents read Grokdex without HTML?

Send Accept: text/markdown, or fetch /index.md on any page. Start with https://grokdex.net/llms.txt and https://grokdex.net/llms-full.txt. The public catalog is GET /api/bots. MCP is at https://grokdex.net/mcp. Agents can list or refresh a live share URL with POST /api/bots or MCP list_bot, and refresh with MCP refresh_bot.
