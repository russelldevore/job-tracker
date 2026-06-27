import { useState, useMemo, useEffect } from 'react';
import { STATUSES } from './lib/sampleData';
import { fetchJobsFromSheet } from './lib/sheetsApi';
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
import StatsBar from './components/StatsBar';
import { format } from 'date-fns';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'interview', label: 'Interviewing' },
  { key: 'followup', label: 'Follow-up due' },
  { key: 'evaluate', label: 'To evaluate' },
  { key: 'closed', label: 'Closed' },
];

function filterJobs(jobs, filter) {
  switch (filter) {
    case 'active': return jobs.filter(j => ![STATUSES.REJECTED, STATUSES.PASSED].includes(j.status));
    case 'interview': return jobs.filter(j => [STATUSES.RECRUITER, STATUSES.INTERVIEW].includes(j.status));
    case 'followup': return jobs.filter(j => j.followUpDate && new Date(j.followUpDate) < new Date() && ![STATUSES.REJECTED, STATUSES.PASSED].includes(j.status));
    case 'evaluate': return jobs.filter(j => j.status === STATUSES.EVALUATE);
    case 'closed': return jobs.filter(j => [STATUSES.REJECTED, STATUSES.PASSED].includes(j.status));
    default: return jobs;
  }
}

function sortJobs(jobs) {
  const priority = { interview: 0, offer: 1, recruiter: 2, applied: 3, evaluate: 4, passed: 5, rejected: 6 };
  return [...jobs].sort((a, b) => {
    const pa = priority[a.status] ?? 99;
    const pb = priority[b.status] ?? 99;
    if (pa !== pb) return pa - pb;
    if (a.dateApplied && b.dateApplied) return new Date(b.dateApplied) - new Date(a.dateApplied);
    return 0;
  });
}

let nextId = 100;

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadFromSheet();
  }, []);

  async function loadFromSheet() {
    setLoading(true);
    setLoadError(null);
    try {
      const sheetJobs = await fetchJobsFromSheet();
      setJobs(sheetJobs);
    } catch (err) {
      setLoadError('Could not load from Google Sheet. Check your Apps Script deployment.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const visible = useMemo(() => sortJobs(filterJobs(jobs, filter)), [jobs, filter]);
  const gmailCount = jobs.filter(j => j.gmailUpdate).length;

  function handleSave(form) {
    if (!form.id) {
      setJobs(js => [...js, { ...form, id: String(nextId++) }]);
    } else {
      setJobs(js => js.map(j => j.id === form.id ? form : j));
    }
    setModal(null);
  }

  function handleDelete(id) {
    setJobs(js => js.filter(j => j.id !== id));
    setModal(null);
  }

  function handleMarkApplied(id) {
    setJobs(js => js.map(j => j.id === id
      ? { ...j, status: STATUSES.APPLIED, dateApplied: format(new Date(), 'yyyy-MM-dd') }
      : j
    ));
  }

  function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    setTimeout(() => {
      setSyncing(false);
      setSyncMsg('Gmail synced — 2 updates found. Connect your Google account to enable live sync.');
    }, 1800);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {modal && (
        <JobModal
          job={modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 500, color: '#38bdf8', letterSpacing: '-0.02em' }}>jt/</span>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>job tracker</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={loadFromSheet}
              disabled={loading}
              style={{ fontSize: 13, color: loading ? '#64748b' : '#a78bfa', padding: '6px 14px', borderRadius: 6, border: '1px solid', borderColor: loading ? 'rgba(255,255,255,0.08)' : 'rgba(167,139,250,0.3)', background: 'transparent', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {loading ? 'Loading…' : 'Sync Sheet'}
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{ fontSize: 13, color: syncing ? '#64748b' : '#4ade80', padding: '6px 14px', borderRadius: 6, border: '1px solid', borderColor: syncing ? 'rgba(255,255,255,0.08)' : 'rgba(74,222,128,0.3)', background: 'transparent', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              {syncing ? 'Syncing…' : gmailCount > 0 ? `Gmail (${gmailCount})` : 'Sync Gmail'}
            </button>
            <button
              onClick={() => setModal({})}
              style={{ fontSize: 13, color: '#0f172a', padding: '6px 16px', borderRadius: 6, background: '#38bdf8', border: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add job
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem' }}>

        {loadError && (
          <div style={{ marginBottom: '1rem', padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#f87171', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {loadError}
            <button onClick={() => setLoadError(null)} style={{ color: '#f87171', opacity: 0.6, fontSize: 16 }}>✕</button>
          </div>
        )}

        {syncMsg && (
          <div style={{ marginBottom: '1rem', padding: '10px 14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, fontSize: 13, color: '#4ade80', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {syncMsg}
            <button onClick={() => setSyncMsg(null)} style={{ color: '#4ade80', opacity: 0.6, fontSize: 16 }}>✕</button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Loading from Google Sheet…
          </div>
        )}

        {!loading && (
          <>
            <StatsBar jobs={jobs} />

            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    fontSize: 12, padding: '5px 13px', borderRadius: 20,
                    border: '1px solid',
                    borderColor: filter === f.key ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)',
                    background: filter === f.key ? 'rgba(56,189,248,0.1)' : 'transparent',
                    color: filter === f.key ? '#38bdf8' : '#64748b',
                    fontWeight: filter === f.key ? 500 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                  {f.key === 'followup' && jobs.filter(j => j.followUpDate && new Date(j.followUpDate) < new Date() && ![STATUSES.REJECTED, STATUSES.PASSED].includes(j.status)).length > 0 && (
                    <span style={{ marginLeft: 5, background: '#fb923c', color: '#0f172a', fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 10 }}>
                      {jobs.filter(j => j.followUpDate && new Date(j.followUpDate) < new Date() && ![STATUSES.REJECTED, STATUSES.PASSED].includes(j.status)).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Job list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visible.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)', fontSize: 14 }}>
                  No jobs in this filter
                </div>
              )}
              {visible.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={j => setModal(j)}
                  onMarkApplied={handleMarkApplied}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
