import { useState, useEffect } from 'react';
import { STATUSES, STATUS_META, SOURCES } from '../lib/sampleData';
import { format } from 'date-fns';

const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100, padding: '1rem',
};

const modal = {
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14,
  padding: '1.5rem',
  width: '100%',
  maxWidth: 520,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const label = { fontSize: 12, color: '#64748b', marginBottom: 5, display: 'block', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' };
const field = { marginBottom: '1rem' };

export default function JobModal({ job, onSave, onClose, onDelete }) {
  const isNew = !job.id;
  const today = format(new Date(), 'yyyy-MM-dd');

  const [form, setForm] = useState({
    role: '',
    company: '',
    status: STATUSES.EVALUATE,
    dateApplied: '',
    salary: '',
    source: 'Ashby',
    network: '',
    followUpDate: '',
    notes: '',
    applicationUrl: '',
    jobDescription: '',
    staffingAgency: '',
    ...job,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    const handler = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#f1f5f9' }}>{isNew ? 'Add job' : 'Edit job'}</h2>
          <button onClick={onClose} style={{ color: '#64748b', fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <div style={field}>
            <label style={label}>Company</label>
            <input style={{ width: '100%' }} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Socure" autoFocus />
          </div>
          <div style={field}>
            <label style={label}>Status</label>
            <select style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={field}>
          <label style={label}>Role title</label>
          <input style={{ width: '100%' }} value={form.role} onChange={e => set('role', e.target.value)} placeholder="Senior Product Manager, Fraud" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <div style={field}>
            <label style={label}>Date applied</label>
            <input style={{ width: '100%' }} type="date" value={form.dateApplied || ''} onChange={e => set('dateApplied', e.target.value)} />
          </div>
          <div style={field}>
            <label style={label}>Follow-up date</label>
            <input style={{ width: '100%' }} type="date" value={form.followUpDate || ''} onChange={e => set('followUpDate', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <div style={field}>
            <label style={label}>Salary range</label>
            <input style={{ width: '100%' }} value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="$150–180K" />
          </div>
          <div style={field}>
            <label style={label}>Source</label>
            <select style={{ width: '100%' }} value={form.source} onChange={e => set('source', e.target.value)}>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={field}>
          <label style={label}>Staffing agency <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(if submitted via recruiter)</span></label>
          <input style={{ width: '100%' }} value={form.staffingAgency} onChange={e => set('staffingAgency', e.target.value)} placeholder="e.g. KForce, TEKsystems" />
        </div>

        <div style={field}>
          <label style={label}>Application URL</label>
          <input style={{ width: '100%' }} value={form.applicationUrl} onChange={e => set('applicationUrl', e.target.value)} placeholder="https://jobs.ashbyhq.com/..." />
        </div>

        <div style={field}>
          <label style={label}>Job description <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(paste full JD here)</span></label>
          <textarea style={{ width: '100%', minHeight: 120, resize: 'vertical', lineHeight: 1.5 }} value={form.jobDescription} onChange={e => set('jobDescription', e.target.value)} placeholder="Paste the full job description — used for resume tailoring, prep notes, and fit scoring..." />
        </div>

        <div style={field}>
          <label style={label}>Network contact</label>
          <input style={{ width: '100%' }} value={form.network} onChange={e => set('network', e.target.value)} placeholder="e.g. Sarah K. (ex-Socure)" />
        </div>

        <div style={field}>
          <label style={label}>Notes</label>
          <textarea style={{ width: '100%', minHeight: 80, resize: 'vertical', lineHeight: 1.5 }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Key observations, interview notes, fit assessment..." />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          {!isNew && (
            <button onClick={() => onDelete(form.id)} style={{ fontSize: 13, color: '#f87171', padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(248,113,113,0.25)', background: 'transparent' }}>
              Delete
            </button>
          )}
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button onClick={onClose} style={{ fontSize: 13, color: '#94a3b8', padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              style={{ fontSize: 13, color: '#0f172a', padding: '8px 18px', borderRadius: 6, background: '#38bdf8', border: 'none', fontWeight: 500 }}
            >
              {isNew ? 'Add job' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
