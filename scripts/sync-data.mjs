// scripts/sync-data.mjs
//
// Pulls the live job tracker data from the Google Apps Script endpoint
// (the same one src/lib/sheetsApi.js calls in the browser) and writes it
// to public/data.json so it's readable as a plain static file — no
// browser, no localStorage, no auth required to read it.
//
// Run manually with: node scripts/sync-data.mjs
// Run automatically via .github/workflows/sync-data.yml

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwNJeNmkK5o5-0ZrjFiqPdoe9ThKLKmYvVYKGwIT5UO--ECxP1Q3V3k5YZVywSQRjtV/exec';

// Read from environment so the key never gets committed to the repo.
// Locally: ACCESS_KEY=... node scripts/sync-data.mjs
// In CI: comes from the ACCESS_KEY GitHub Actions secret.
const ACCESS_KEY = process.env.ACCESS_KEY;

const OUTPUT_PATH = new URL('../public/data.json', import.meta.url);

async function main() {
  if (!ACCESS_KEY) {
    throw new Error('Missing ACCESS_KEY env var. Set it before running this script.');
  }

  console.log(`Fetching live sheet data from Apps Script endpoint...`);

  const res = await fetch(`${SCRIPT_URL}?key=${encodeURIComponent(ACCESS_KEY)}`);
  if (!res.ok) {
    throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);
  }

  const rows = await res.json();

  const payload = {
    syncedAt: new Date().toISOString(),
    rowCount: Array.isArray(rows) ? rows.length : 0,
    rows,
  };

  await mkdir(dirname(OUTPUT_PATH.pathname), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf-8');

  console.log(`Wrote ${payload.rowCount} rows to public/data.json (synced ${payload.syncedAt})`);
}

main().catch((err) => {
  console.error('sync-data failed:', err);
  process.exit(1);
});
