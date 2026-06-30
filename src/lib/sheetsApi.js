const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwNJeNmkK5o5-0ZrjFiqPdoe9ThKLKmYvVYKGwIT5UO--ECxP1Q3V3k5YZVywSQRjtV/exec';
const ACCESS_KEY = 'UXIExYMLVPc8TMZy6-kw-XkYXZX-8jZO';
const DEMO_SCRIPT_URL = `${SCRIPT_URL}?tab=Demo+Data&key=${ACCESS_KEY}`;

function parseDate(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
}

function mapStatusFromSheet(val) {
  if (!val) return 'evaluate';
  const v = val.toLowerCase().trim();
  if (v === 'evaluate' || v === 'to evaluate') return 'evaluate';
  if (v === 'applied') return 'applied';
  if (v === 'recruiter' || v === 'phone screen' || v === 'recruiter screen') return 'recruiter';
  if (v === 'interview' || v === 'interviewing') return 'interview';
  if (v === 'offer') return 'offer';
  if (v === 'rejected' || v === 'reject' || v === 'no' || v === 'declined') return 'rejected';
  if (v === 'passed' || v === 'pass') return 'passed';
  if (v.includes('interview') || v.includes('recruiter')) return 'recruiter';
  if (v.includes('reject') || v.includes('decline')) return 'rejected';
  return 'applied';
}

function jobKey(row) {
  const url = row['Application url'] || row['Application URL'] || '';
  const company = (row['Company'] || '').trim();
  const role = (row['Role'] || '').trim();
  return url || (company && role ? `${company}||${role}` : '');
}

function mapSheetRowToJob(row, index) {
  const url = row['Application url'] || row['Application URL'] || '';
  const company = row['Company'] || '';
  const role = row['Role'] || '';
  const isPartial = url && !company && !role;
  return {
    id: `sheet-${index}-${Date.now()}`,
    role,
    company,
    jobDescription: row['Description'] || '',
    status: isPartial ? 'evaluate' : mapStatusFromSheet(row['Status'] || ''),
    dateApplied: parseDate(row['Date applied'] || row['Date Applied'] || ''),
    notes: row['Notes'] || '',
    applicationUrl: url,
    source: row['Source'] || '',
    salary: row['Salary'] || '',
    network: row['Network'] || '',
    followUpDate: parseDate(row['Follow-up date'] || row['Follow Up Date'] || ''),
    staffingAgency: row['Staffing agency'] || row['Staffing Agency'] || '',
    gmailUpdate: null,
    fromSheet: true,
    _key: jobKey(row),
  };
}

function hasContent(row) {
  return row['Company'] || row['Role'] || row['Application url'] || row['Application URL'];
}

async function fetchFromUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const rows = await res.json();
  return rows
    .filter(row => hasContent(row))
    .map((row, i) => mapSheetRowToJob(row, i));
}

export async function fetchDemoJobs() {
  return fetchFromUrl(DEMO_SCRIPT_URL);
}

export async function mergeFromSheet(existingJobs) {
  const sheetJobs = await fetchFromUrl(`${SCRIPT_URL}?key=${ACCESS_KEY}`);
  const existingKeys = new Set(
    existingJobs
      .map(j => j._key || j.applicationUrl || (j.company && j.role ? `${j.company}||${j.role}` : ''))
      .filter(Boolean)
  );
  const newJobs = sheetJobs.filter(j => j._key && !existingKeys.has(j._key));
  return [...existingJobs, ...newJobs];
}

// Write a single job card back to the sheet.
// Called automatically on every save from the UI.
export async function saveJobToSheet(job) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: ACCESS_KEY, action: 'upsert', job }),
    });
    if (!res.ok) throw new Error(`Sheet write failed: ${res.status}`);
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result;
  } catch (err) {
    // Non-fatal — local save already succeeded, sheet write failed silently.
    // Surface this in the UI via the returned error so the user knows.
    console.error('saveJobToSheet error:', err);
    throw err;
  }
}
