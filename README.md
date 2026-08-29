# Grokory

A public gallery of [Grok Bot](https://x.ai/bot) templates. People share bots as links like:

`https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN`

Grokory is the index: browse staff picks, paste a share link to list a community bot, then **Add to Grok Bot** on x.ai. Adding a shared bot copies the template onto the recipient’s account. It does not share the author’s computer, logins, or chats.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## How listing works

1. In Grok Bot, copy the bot’s public share link.
2. Paste it on `/upload`. Grokory looks up the name, author, and description from x.ai.
3. Pick a job category. The bot appears on the community shelf immediately. No account.

Listings are stored in `data/templates.json` on the machine running the app. Staff picks live in `src/data/seed.ts`.

This project is not affiliated with SpaceXAI or xAI.
