const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzK7AoLk4DnXeftU0x6HEnLRVUx3Bak5ZWn7_aP5D44Rxq2DxGUde5ubKbbD21NJp6o/exec';

function parseDate(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
}

function mapStatusFromSheet(val) {
  if (!val) return 'applied';
  const v = val.toLowerCase().trim();
  if (v === 'evaluate' || v === 'to evaluate') return 'evaluate';
  if (v === 'applied') return 'applied';
  if (v === 'recruiter' || v === 'phone screen' || v === 'recruiter screen') return 'recruiter';
  if (v === 'interview' || v === 'interviewing') return 'interview';
  if (v === 'offer') return 'offer';
  if (v === 'rejected' || v === 'reject' || v === 'no' || v === 'declined') return 'rejected';
  if (v === 'passed' || v === 'pass') return 'passed';
  // fallback: try to infer from text
  if (v.includes('interview') || v.includes('recruiter')) return 'recruiter';
  if (v.includes('reject') || v.includes('decline') || v.includes('not ') || v.includes('no ')) return 'rejected';
  return 'applied';
}

function mapSheetRowToJob(row, index) {
  return {
    id: `sheet-${index}`,
    role: row['Role'] || '',
    company: row['Company'] || '',
    jobDescription: row['Description'] || '',
    status: mapStatusFromSheet(row['Status'] || ''),
    dateApplied: parseDate(row['Date applied'] || row['Date Applied'] || ''),
    notes: row['Notes'] || '',
    applicationUrl: row['Application url'] || row['Application URL'] || '',
    source: row['Source'] || '',
    salary: row['Salary'] || '',
    network: row['Network'] || '',
    followUpDate: parseDate(row['Follow-up date'] || row['Follow Up Date'] || ''),
    staffingAgency: row['Staffing agency'] || row['Staffing Agency'] || '',
    gmailUpdate: null,
    fromSheet: true,
  };
}

export async function fetchJobsFromSheet() {
  const res = await fetch(SCRIPT_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const rows = await res.json();
  return rows
    .filter(row => row['Company'] || row['Role'])
    .map((row, i) => mapSheetRowToJob(row, i));
}
