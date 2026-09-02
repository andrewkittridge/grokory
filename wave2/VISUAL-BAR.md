# Grokdex — wave 2 visual polish bar

Owner: Designer · Audience: Engineer · Status: **draft only** (implement in draft PR; no merge)  
Live: https://grokdex.net @ `64c1791` · Evidence: `../evidence/board-live.png`, `../picklist/EYECHECK.md`  
Prior: `../designer-notes.md` (honesty / share / Add) — still stands  
Public brand: **Grokdex** only

---

## Thesis

Wave 1 made the loop honest. Wave 2 makes the **scoreboard feel worth listing on** — calmer aura, clearer Add/list conversion, less founding clutter. Still n=2: thin + premium > thick + hollow. No seeds, no ads chrome, no invented skills, no redesign.

Bar for every change: does it make someone **want to list** or **want to Add**?

---

## Ship-now visual bets (ranked)

### 1. Quiet the empty seats
Live pain: `MCP LIST_BOT` ×4 + “Claim this seat” reads as noise, not invitation.
- One calm OPEN line: **Claim this seat** · paste or agent list (skill/MCP linked once, not mono spam per row).
- Prefer 2–3 open seats or a single “seats open” footer invite over four identical noisy rows.
- Keep agent path visible once (home strip or upload), not repeated four times on the board.

### 2. One Share hero (kill CTA spam)
Live pain: Share a bot appears too many times on home (nav + hero + mid + footer).
- **One** primary Share (nav or hero). Secondary Browse.
- Drop redundant “JUST OPENED / Share a Grok Bot” band if hero already says it.
- Agent “HAVE YOUR BOT LIST IT” strip stays **once**, compact.

### 3. Scoreboard aura (list/Add feel)
- Rows: rank · title · @handle · one-line job · Copy/Post · vote — breathing room, hairline dividers, sunset only on #1 / active.
- Mobile: keep **Copy + Post** both thumb-reachable (EYECHECK note).
- Listing detail: **Add to Grok Bot** remains the single solid primary; Preview outline; share tertiary.
- Hot/Top/New: quieter founding treatment (smaller tabs or default to one board sort) — don’t invent discovery chrome.

### 4. Upload / list ritual polish
- Form card calm; Turnstile doesn’t dominate mid-form (tighter placement / less visual weight if possible).
- Post-list success already has Post on X hero — keep; don’t add more competing CTAs.
- Agent skill block: secondary card, not competing with Publish.

---

## Never (this wave)

- Fake seed rows / mock density
- Skill chip walls / related carousels before skills parse
- Louder Featured/boost or ads before ~8–12
- Dual brand (Grokory in UI), light-mode rewrite, mascot redo
- Accounts / OAuth walls

---

## Preferred build order

1. Quiet OPEN seats (biggest honesty/aura win at n=2)
2. Deduplicate Share CTAs
3. Row/mobile share + scoreboard spacing
4. Upload/Turnstile calm + listing Add hierarchy touch-up

Evidence: before/after under `wave2/evidence/` (home, board, listing, upload, mobile board).

---

## Handoff

Locks with Product ship-now set. Engineer: one draft PR. Designer eye-checks. No merge until Andrew yes.
