# Grokdex — auto-categories (chip filter) visual bar

Owner: Designer · Audience: Engineer · Status: **draft only**  
Live: https://grokdex.net · Brand: **Grokdex** only  
Product: `product-notes.md`  
Moods: `mood-chips-all.png`, `mood-chips-selected.png`, `mood-chips-phone.png`

---

## Thesis

One ranked board. Closed ~8–12 **lanes** auto-inferred on list/refresh. Surface as **filter chips** above the same Hot/Top/New list — not separate category boards, not boosts, not a required job on upload. Free tags stay secondary.

Moods are **chip-row chrome only**. Match **live board** look (dark Grokdex); if board is mid SpaceXAI-light pass, chips follow that shell — don’t invent a second visual system. **Ignore** mood inventions: Grokdex Pro, fake vote/score deltas, verified checkmarks, LoL/champion lists, separate Discover/Collections IA, neon category rainbow spam.

---

## Board chip row (ship-now)

Moods: `mood-chips-all.png` (All idle) · `mood-chips-selected.png` (one lane on) · `mood-chips-phone.png`

1. **Placement** — Chip row **above** the ranked list (under title / sort). Desktop wrap or scroll; phone horizontal scroll, thumb-height targets.
2. **Chips** — `All` + lanes with **honest counts**. Empty lanes hidden or quiet grey (no fake fill).
3. **Selected** — One clear selected state (navy / quiet accent). Filter is `?lane=` (or agreed param) on the **same** list — ranking formula unchanged.
4. **Idle All** — Default = full board; tapping All clears the lane filter.
5. **Listing page** — Primary lane shown quietly; free tags unchanged if present.
6. **Upload** — No required job picker / lane nag.

---

## Evidence (Engineer)

Under `auto-categories/evidence/`:

| Shot | Look for |
| --- | --- |
| `board-chips-all.png` | All selected; full ranked list; counts honest |
| `board-chips-lane.png` | One lane selected; filtered slice; still one board |
| `board-chips-phone.png` | Scrollable chips; thumb targets |
| `listing-lane.png` | Quiet primary lane on listing |
| before/after sample table | Backfill lanes (Product sniff) |

Hold: ranking formula (except filter), commons tokens/MCP, no category boosts.

Draft only — Designer eye-check before Andrew merge.

---

## Hard no

- Separate job-lane boards / `list_categories` ranking product  
- Category boosts or rank-by-lane  
- Required job on upload  
- Fake density / inventing lanes for empty seats  
- Dual Grokory brand / SEO doorway pages per lane this wave  
- Merge without Andrew yes  

---

## Handoff

Engineer: draft against this bar + Product ship-now. Designer soft eye-check before Jarvis merge ask. Draft only.
