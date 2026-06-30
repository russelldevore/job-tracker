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

### v0.5 — Sync Safety + Demo Mode
- Hashed PIN gates the Sync Sheet button (SHA-256, client-side check)
- Demo mode is the default view for anyone visiting the live URL — pulls from a separate `Demo Data` tab, loaded once per session
- Switching from Demo to Live requires the PIN
- Live data persists in localStorage across refreshes — no auto-sync on page load
- Sync merges new rows only; existing cards are never overwritten or duplicated (de-duped by Application URL, falling back to Company+Role)
- Partial Sheet rows (URL only, no Company/Role) create a new "To Evaluate" card

---

## Up Next

### Story: AI-Assisted Role Evaluation
**As Russell**, when I add a role with just a URL or JD pasted in, I want Claude to assess fit against my background so I can quickly decide whether to invest time applying.

**Open questions to resolve before building:**
- Output depth: quick fit score + summary vs. full breakdown (requirements, resume gaps, talking points) vs. lightweight must-have flagging
- Output location: inline on the card in the app vs. conversational in chat

**Acceptance criteria (draft, pending answers above):**
- [ ] Evaluate action available on any "To Evaluate" card with a JD or URL present
- [ ] Output reflects Russell's actual background (fraud/identity/AI PM, Wells Fargo, Vesta, KForce)
- [ ] Clearly distinguishes must-have gaps from nice-to-have gaps
- [ ] Does not overclaim — flags where experience is adjacent vs. direct

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