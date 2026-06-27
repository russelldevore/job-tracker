# jt/ — job tracker

A lightweight job application tracker built with React. Designed for a mobile-first, fast-moving search targeting remote fraud/identity/AI PM roles.

## Features

- Track applications with status pipeline: Evaluate → Applied → Recruiter → Interview → Offer
- One-click "mark applied" with auto-date stamp
- Follow-up date tracking with overdue alerts
- Source tracking (Ashby, Greenhouse, Direct, etc.)
- Network contact field per role
- Gmail sync (coming soon — will surface replies and rejections automatically)
- Google Sheets sync (coming soon — reads/writes to your existing tracker)

## Stack

- React 18
- date-fns for date math
- No backend — data lives in Google Sheets (via API, coming in v0.2)

## Setup

```bash
npm install
npm start
```

## Roadmap

- [ ] Google Sheets read/write integration
- [ ] Gmail sync for application updates
- [ ] GitHub Pages deployment
- [ ] Mobile PWA manifest
