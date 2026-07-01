import { useState, useMemo, useEffect } from 'react';
import { STATUSES } from './lib/sampleData';
import { fetchDemoJobs, mergeFromSheet, saveJobToSheet } from './lib/sheetsApi';
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
import StatsBar from './components/StatsBar';
import PinModal from './components/PinModal';
import ApiKeyModal from './components/ApiKeyModal';
import { evaluateRole, hasApiKey } from './lib/claudeApi';
import { format } from 'date-fns';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'interview', label: 'Interviewing' },
  { key: 'followup', label: 'Follow-up due' },
  { key: 'evaluate', label: 'To evaluate' },
  { key: 'closed', label: 'Closed' },
];

const STORAGE_KEY = 'jt_live_jobs';
const MODE_KEY = 'jt_mode';

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

function saveJobs(jobs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs)); } catch {}
}

function loadJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMode(isDemo) {
  try { localStorage.setItem(MODE_KEY, isDemo ? 'demo' : 'live'); } catch {}
}

function loadMode() {
  try { return localStorage.getItem(MODE_KEY) !== 'live'; }
  catch { return true; }
}

let nextId = 100;

export default function App() {
  const [demoMode, setDemoMode] = useState(loadMode);
  const [demoJobs, setDemoJobs] = useState([]);
  const [liveJobs, setLiveJobs] = useState(loadJobs);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [syncMsg, setSyncMsg] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState(null);
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [pendingEvalJobId, setPendingEvalJobId] = useState(null);

  const jobs = demoMode ? demoJobs : liveJobs;

  useEffect(() => {
    if (demoMode && !demoLoaded) {
      loadDemoData();
    }
  }, [demoMode]);

  async function loadDemoData() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchDemoJobs();
      setDemoJobs(data);
      setDemoLoaded(true);
    } catch {
      setLoadError('Could not load demo data.');
    } finally {
      setLoading(false);
    }
  }

  async function doSync() {
    setLoading(true);
    setLoadError(null);
    setSyncMsg(null);
    try {
      const before = liveJobs.length;
      const merged = await mergeFromSheet(liveJobs);
      setLiveJobs(merged);
      saveJobs(merged);
      const added = merged.length - before;
      setSyncMsg(added > 0 ? `Synced — ${added} new card${added > 1 ? 's' : ''} added.` : 'Synced — no new roles found.');
    } catch {
      setLoadError('Sync failed. Check your Apps Script deployment.');
    } finally {
      setLoading(false);
    }
  }

  function handleSyncClick() {
    setPinAction('sync');
    setShowPinModal(true);
  }

  function handleDemoToggle() {
    if (demoMode) {
      setPinAction('unlock');
      setShowPinModal(true);
    } else {
      setDemoMode(true);
      saveMode(true);
    }
  }

  function handlePinSuccess() {
    setShowPinModal(false);
    if (pinAction === 'unlock') {
      setDemoMode(false);
      saveMode(false);
      setSyncMsg('Live mode active — showing your real applications.');
    } else if (pinAction === 'sync') {
      doSync();
    }
    setPinAction(null);
  }

  function handlePinClose() {
    setShowPinModal(false);
    setPinAction(null);
  }

  async function doEvaluate(job) {
    setEvaluatingId(job.id);
    try {
      const result = await evaluateRole(job);
      setLiveJobs(prev => {
        const updated = prev.map(j => j.id === job.id ? { ...j, aiEval: result } : j);
        saveJobs(updated);
        return updated;
      });
    } catch (err) {
      if (err.message === 'INVALID_KEY') {
        localStorage.removeItem('jt_claude_key');
        setPendingEvalJobId(job.id);
        setShowKeyModal(true);
      } else if (err.message !== 'NO_API_KEY') {
        setSyncMsg(`Evaluation failed: ${err.message}`);
      }
    } finally {
      setEvaluatingId(null);
    }
  }

  function handleEvaluate(job) {
    if (demoMode) return;
    if (!hasApiKey()) {
      setPendingEvalJobId(job.id);
      setShowKeyModal(true);
    } else {
      doEvaluate(job);
    }
  }

  function handleKeyModalSave() {
    setShowKeyModal(false);
    const jobId = pendingEvalJobId;
    setPendingEvalJobId(null);
    if (jobId) {
      const job = liveJobs.find(j => j.id === jobId);
      if (job) doEvaluate(job);
    }
  }

  function handleKeyModalClose() {
    setShowKeyModal(false);
    setPendingEvalJobId(null);
  }

  function updateLive(updated) {
    setLiveJobs(updated);
    saveJobs(updated);
  }

  async function handleSave(form) {
  if (demoMode) return;

  const updated = !form.id
    ? [...liveJobs, { ...form, id: String(nextId++) }]
    : liveJobs.map(j => j.id === form.id ? form : j);

  updateLive(updated);
  setModal(null);

  try {
    await saveJobToSheet(form);
  } catch {
    setSyncMsg('Card saved locally, but sheet write failed. Changes will sync next time you hit Sync Sheet.');
  }
}

  function handleDelete(id) {
    if (demoMode) return;
    updateLive(liveJobs.filter(j => j.id !== id));
    setModal(null);
  }

  function handleMarkApplied(id) {
    if (demoMode) return;
    updateLive(liveJobs.map(j => j.id === id
      ? { ...j, status: STATUSES.APPLIED, dateApplied: format(new Date(), 'yyyy-MM-dd') }
      : j
    ));
  }

  const visible = useMemo(() => sortJobs(filterJobs(jobs, filter)), [jobs, filter]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {modal && !demoMode && (
        <JobModal job={modal} onSave={handleSave} onClose={() => setModal(null)} onDelete={handleDelete} />
      )}
      {showPinModal && (
        <PinModal onSuccess={handlePinSuccess} onClose={handlePinClose} />
      )}
      {showKeyModal && (
        <ApiKeyModal onSave={handleKeyModalSave} onClose={handleKeyModalClose} />
      )}

      <header style={{ borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 500, color: demoMode ? '#fb923c' : '#38bdf8', letterSpacing: '-0.02em' }}>jt/</span>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>{demoMode ? 'demo' : 'job tracker'}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleDemoToggle}
              style={{
                fontSize: 12, padding: '5px 12px', borderRadius: 20, border: '1px solid',
                borderColor: demoMode ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.1)',
                background: demoMode ? 'rgba(251,146,60,0.1)' : 'transparent',
                color: demoMode ? '#fb923c' : '#64748b',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <span style={{ fontSize: 10 }}>{demoMode ? '●' : '○'}</span>
              Demo
              {!demoMode && <span style={{ fontSize: 10, opacity: 0.5 }}>🔒</span>}
            </button>

            {!demoMode && (
              <button
                onClick={handleSyncClick}
                disabled={loading}
                style={{
                  fontSize: 13, color: loading ? '#64748b' : '#a78bfa',
                  padding: '6px 14px', borderRadius: 6, border: '1px solid',
                  borderColor: loading ? 'rgba(255,255,255,0.08)' : 'rgba(167,139,250,0.3)',
                  background: 'transparent', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                {loading ? 'Syncing…' : 'Sync Sheet'} 🔒
              </button>
            )}

            {!demoMode && (
              <button
                onClick={() => setModal({})}
                style={{ fontSize: 13, color: '#0f172a', padding: '6px 16px', borderRadius: 6, background: '#38bdf8', border: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add job
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem' }}>
        {demoMode && (
          <div style={{ marginBottom: '1rem', padding: '10px 14px', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', borderRadius: 8, fontSize: 13, color: '#fb923c' }}>
            Demo mode — sample data only. Toggle off to access the live tracker.
          </div>
        )}

        {loadError && (
          <div style={{ marginBottom: '1rem', padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#f87171', display: 'flex', justifyContent: 'space-between' }}>
            {loadError}
            <button onClick={() => setLoadError(null)} style={{ color: '#f87171', opacity: 0.6 }}>✕</button>
          </div>
        )}

        {syncMsg && (
          <div style={{ marginBottom: '1rem', padding: '10px 14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, fontSize: 13, color: '#4ade80', display: 'flex', justifyContent: 'space-between' }}>
            {syncMsg}
            <button onClick={() => setSyncMsg(null)} style={{ color: '#4ade80', opacity: 0.6 }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {demoMode ? 'Loading demo data…' : 'Syncing from Sheet…'}
          </div>
        ) : (
          <>
            <StatsBar jobs={jobs} />
            <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
              {FILTERS.map(f => {
                const overdueCount = jobs.filter(j =>
                  j.followUpDate && new Date(j.followUpDate) < new Date() &&
                  ![STATUSES.REJECTED, STATUSES.PASSED].includes(j.status)
                ).length;
                return (
                  <button key={f.key} onClick={() => setFilter(f.key)} style={{
                    fontSize: 12, padding: '5px 13px', borderRadius: 20, border: '1px solid',
                    borderColor: filter === f.key ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)',
                    background: filter === f.key ? 'rgba(56,189,248,0.1)' : 'transparent',
                    color: filter === f.key ? '#38bdf8' : '#64748b',
                    fontWeight: filter === f.key ? 500 : 400, transition: 'all 0.15s',
                  }}>
                    {f.label}
                    {f.key === 'followup' && overdueCount > 0 && (
                      <span style={{ marginLeft: 5, background: '#fb923c', color: '#0f172a', fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 10 }}>
                        {overdueCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visible.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)', fontSize: 14 }}>
                  {demoMode ? 'Loading demo data…' : 'No jobs yet — sync from Sheet or add one manually.'}
                </div>
              )}
              {visible.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={demoMode ? () => {} : j => setModal(j)}
                  onMarkApplied={handleMarkApplied}
                  onEvaluate={!demoMode ? handleEvaluate : undefined}
                  evaluating={evaluatingId === job.id}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}