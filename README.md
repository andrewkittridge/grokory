# Grokdex

A public ranked board of [Grok Bot](https://x.ai/bot) templates. People share bots as links like:

`https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN`

Browse by **Hot**, **Top**, and **New**. Upvote the good ones. Paste a share link to list a community bot, then **Add to Grok Bot** on x.ai. Adding a shared bot copies the template onto the recipient’s account. It does not share the author’s computer, logins, or chats.

Voting uses a browser cookie (no account). One vote per browser per bot.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your Neon pooled connection string so votes and new listings persist. Without it, the app uses `data/templates.json` on this machine (fine for local; it will not stick on Cloudflare Workers).

Production is a Cloudflare Worker on [https://grokdex.net](https://grokdex.net). Set `DATABASE_URL` as a Worker secret (`npx wrangler secret put DATABASE_URL`). Deploys use `--keep-vars` so that secret is not wiped. Upload protection also needs `TURNSTILE_SECRET` (`npx wrangler secret put TURNSTILE_SECRET`). Optional Google measurement IDs are Worker vars: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_AW_ID`, `NEXT_PUBLIC_AW_ADD_LABEL`, `NEXT_PUBLIC_AW_LIST_LABEL`.

## How listing works

1. In Grok Bot, copy the bot’s public share link.
2. Paste it on `/upload`. Grokdex looks up the name, author, and description from x.ai.
3. Pick a job category. The bot appears on the board immediately. No account.

## Paid traffic

Do not buy demand ads until the board has about 8–12 real listings across jobs. Do not restore fake seed data.

When you do test spend, use **US-only Google Search** at about **$10/day** total:

- **Share** → [https://grokdex.net/upload](https://grokdex.net/upload). Conversion: `list_bot`.
- **Add** → [https://grokdex.net/templates](https://grokdex.net/templates). Conversion: `add_bot`. Keep this campaign paused until the catalog floor.
- Negatives: grok api, grok.com login, grok image, grok 4, grok iphone, grok twitter, x.ai careers.
- Copy: independent catalog of public Grok Bot share links. Adding copies the template onto the visitor’s Grok account. Do not imply official xAI status.

This project is not affiliated with SpaceXAI or xAI. See [Privacy](https://grokdex.net/privacy) and [Terms](https://grokdex.net/terms).
