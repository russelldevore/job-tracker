# jt/ — Job Tracker

A lightweight, mobile-friendly job application tracker built with React and Vite. Pulls live data from Google Sheets via Apps Script. Built for a senior PM conducting an active search in fraud, identity, and AI/ML.

---

## Features

- **Live Google Sheets sync** — one click pulls your Apply List tab into the app
- **Status pipeline** — Evaluate → Applied → Recruiter → Interview → Offer → Rejected/Passed
- **Smart status inference** — maps your Sheet's Response/Status column to the right badge automatically
- **Add / edit / delete jobs** — full modal with all fields
- **One-click Mark Applied** — stamps today's date automatically
- **Follow-up date tracking** — overdue follow-ups highlighted in amber
- **Stats bar** — applied count, in progress, follow-ups due, response rate
- **Filter tabs** — All, Active, Interviewing, Follow-up due, To Evaluate, Closed
- **Application URL** — one-click link to the original job posting
- **Job description storage** — paste full JD for resume tailoring and interview prep
- **Staffing agency field** — tracks contractor submittals (e.g. KForce → Boeing)
- **Network contact** — one field per role for your referral or connection
- **Source tracking** — Ashby, Greenhouse, Workday, LinkedIn, Direct, Referral, Staffing
- **Mobile responsive** — works cleanly on iPhone and Android without a native app
- **Dark mode** — easy on the eyes during a long search

---

## Iteration History

### v0.1 — Scaffold
- React + Vite project structure
- Sample data with realistic job cards
- Status badges, filter tabs, stats bar
- Add/edit modal with core fields
- Dark theme, mobile responsive layout

### v0.2 — Field Expansion
- Added **Workday** to source dropdown
- Added **Application URL** field (renders as JD ↗ link on card)
- Added **Job description** field (paste full JD for AI-assisted prep)
- Added **Staffing agency** field (shows as "KForce → Company" on card)

### v0.3 — Google Sheets Integration
- Apps Script deployed as web app on Google Sheet
- App loads live data from Sheet on startup
- **Sync Sheet** button in header to refresh anytime
- Status inferred from Sheet Response column
- Error banner if Sheet connection fails
- Loading spinner while fetching

### v0.4 — Column Alignment + Tab Targeting
- Apps Script updated to target `Apply List` tab specifically
- Column mapping updated to match cleaned Sheet headers:
  `Role, Company, Description, Status, Date applied, Notes, Application url`
- Single source of truth — Sheet and app fully in sync

---

## Roadmap

- [ ] GitHub Pages deployment
- [ ] Email intake — forward a job posting to auto-add as "To Evaluate"
- [ ] Gmail sync — surface replies and rejections automatically per card
- [ ] Google Docs interview prep integration
- [ ] Duplicate card feature
- [ ] Write-back — status changes in app sync back to Sheet

---

## Stack

- React 18
- Vite
- date-fns
- Google Apps Script (Sheets API bridge)
- GitHub Pages (deployment)

---

## Setup

```bash
npm install
npm start
```

App runs at `http://localhost:5173/job-tracker/`

## Deploy to GitHub Pages

```bash
npm run deploy
```

---

## Google Sheets Integration

Data is pulled from a Google Sheet via an Apps Script web app deployment. The script reads the `Apply List` tab and returns rows as JSON. No API keys required — the script runs under the sheet owner's Google account.

Column headers expected in the Sheet:
`Role, Company, Description, Status, Date applied, Notes, Application url`
