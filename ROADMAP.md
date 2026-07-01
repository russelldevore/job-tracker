# Roadmap

Lightweight backlog for jt/ job tracker. Stories are sized for solo, conversational development — not formal sprints.

---

## Shipped

### v0.1 — Scaffold
React + Vite app, sample data, status pipeline, filters, stats bar, add/edit modal, dark theme.

### v0.2 — Field Expansion
Added Workday source, Application URL, Job description, Staffing agency fields.

### v0.3 — Google Sheets Integration
Apps Script web app bridge, live data load from `Apply List` tab, Sync button.

### v0.4 — Column Alignment
Apps Script targets `Apply List` tab specifically. Column mapping updated to match cleaned Sheet headers.

### v0.6 — AI-Assisted Role Evaluation
- Evaluate button on "To Evaluate" cards (live mode only) when a JD or URL is present
- Calls Claude Haiku 4.5 directly from the browser via raw `fetch` with CORS bypass header
- Returns a color-coded fit score (strong / good / partial / weak) + 2-3 sentence summary, inline on the card
- Re-evaluate anytime; result persists in localStorage alongside the card
- Anthropic API key stored in localStorage under `jt_claude_key` — prompted on first use via modal
- System prompt reflects Russell's fraud/identity/AI PM background (Wells Fargo, Vesta, KForce); explicitly distinguishes must-have from nice-to-have gaps and flags adjacent vs. direct experience

### v0.5 — Sync Safety + Demo Mode
- Hashed PIN gates the Sync Sheet button (SHA-256, client-side check)
- Demo mode is the default view for anyone visiting the live URL — pulls from a separate `Demo Data` tab, loaded once per session
- Switching from Demo to Live requires the PIN
- Live data persists in localStorage across refreshes — no auto-sync on page load
- Sync merges new rows only; existing cards are never overwritten or duplicated (de-duped by Application URL, falling back to Company+Role)
- Partial Sheet rows (URL only, no Company/Role) create a new "To Evaluate" card

---

## Up Next

Nothing scoped yet — see Backlog below.

---

## Backlog (not yet scoped)

- **Gmail sync** — surface replies/rejections per card automatically (real integration, not the earlier placeholder)
- **Google Docs interview prep integration** — link prep docs per card, templated from past prep (Yahoo, Symetra precedent)
- **Duplicate card** — clone a card for reapplications or multi-posting roles
- **Write-back to Sheet** — app status changes sync back to Google Sheet (deferred — no clear need yet)
- **Email intake** — forward a posting to a dedicated address, auto-creates a To Evaluate card (deprioritized in favor of the simpler "paste URL into Sheet, Sync" flow)

---

## Explicitly Deferred / Rejected

- **iMessage-direct intake** — no clean native path without third-party tools (Zapier/Make); not worth the complexity for current volume
- **Copy/duplicate card during v1→v2 migration** — fields didn't map 1:1, re-entry was faster than building a migration tool for a one-time event