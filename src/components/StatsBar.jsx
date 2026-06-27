import { isPast, parseISO } from 'date-fns';
import { STATUSES } from '../lib/sampleData';

export default function StatsBar({ jobs }) {
  const active = jobs.filter(j => ![STATUSES.REJECTED, STATUSES.PASSED].includes(j.status));
  const applied = jobs.filter(j => j.dateApplied).length;
  const inProgress = jobs.filter(j => [STATUSES.RECRUITER, STATUSES.INTERVIEW, STATUSES.OFFER].includes(j.status)).length;
  const followUpDue = active.filter(j => j.followUpDate && isPast(parseISO(j.followUpDate))).length;
  const responded = jobs.filter(j => j.status !== STATUSES.EVALUATE && j.status !== STATUSES.APPLIED).length;
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;
  const gmailUpdates = jobs.filter(j => j.gmailUpdate).length;

  const stats = [
    { label: 'Applied', value: applied, color: null },
    { label: 'In progress', value: inProgress, color: inProgress > 0 ? '#38bdf8' : null },
    { label: 'Follow-ups due', value: followUpDue, color: followUpDue > 0 ? '#fb923c' : null },
    { label: 'Response rate', value: `${responseRate}%`, color: null },
    ...(gmailUpdates > 0 ? [{ label: 'Gmail updates', value: gmailUpdates, color: '#4ade80' }] : []),
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 10, marginBottom: '1.25rem' }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: s.color || 'var(--text)', fontFamily: 'var(--mono)' }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}
