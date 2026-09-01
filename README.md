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

Production is a Cloudflare Worker on [https://grokdex.net](https://grokdex.net). Set `DATABASE_URL` as a Worker secret (`npx wrangler secret put DATABASE_URL`). Deploys use `--keep-vars` so that secret is not wiped. Upload protection also needs `TURNSTILE_SECRET` (`npx wrangler secret put TURNSTILE_SECRET`). Tips and featured placement need `STRIPE_SECRET_KEY` (restricted `rk_…` key) and `STRIPE_WEBHOOK_SECRET` from a grokdex-only endpoint at `/api/webhooks/stripe`. Optional Google measurement IDs are Worker vars: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_AW_ID`, `NEXT_PUBLIC_AW_ADD_LABEL`, `NEXT_PUBLIC_AW_LIST_LABEL`.

## Tips and featured

Listing stays free. Optional Stripe Checkout (hosted):

- **Tip** — `$5` / `$10` / `$25` or custom (min `$3`) at `/support`. Not tax-deductible. Does not change rank.
- **Featured** — `$79` for 7 days or `$199` for 30 days from a listing page. Labeled pin on home and the board (max 3 at once). Organic hot/top/new scores are unchanged.
- **Category boost** — `$29` for 7 days or `$79` for 30 days. Labeled strip on that job’s board (max 2 per category). Not a homepage pin. Organic scores are unchanged.

Fulfillment is the webhook at `/api/webhooks/stripe`, not the success page. Locally: `stripe listen --forward-to 127.0.0.1:43127/api/webhooks/stripe` and put that CLI signing secret in `.env.local` as `STRIPE_WEBHOOK_SECRET`. Prices are looked up by key (`grokdex_tip_5`, `grokdex_featured_week`, …) so the same code works in test and live once those products exist in both modes.

## How listing works

1. In Grok Bot, copy the bot’s public share link.
2. Paste it on `/upload`. Grokdex looks up the name, author, and description from x.ai.
3. Pick a job category. Optionally add an X handle (a public label, not a login). The bot appears on the board immediately. No account.

## Paid traffic

Do not buy demand ads until the board has about 8–12 real listings across jobs. Do not restore fake seed data.

When you do test spend, use **US-only Google Search** at about **$10/day** total:

- **Share** → [https://grokdex.net/upload](https://grokdex.net/upload). Conversion: `list_bot`.
- **Add** → [https://grokdex.net/templates](https://grokdex.net/templates). Conversion: `add_bot`. Keep this campaign paused until the catalog floor.
- Negatives: grok api, grok.com login, grok image, grok 4, grok iphone, grok twitter, x.ai careers.
- Copy: independent catalog of public Grok Bot share links. Adding copies the template onto the visitor’s Grok account. Do not imply official xAI status.

This project is not affiliated with SpaceXAI or xAI. See [Privacy](https://grokdex.net/privacy) and [Terms](https://grokdex.net/terms).
