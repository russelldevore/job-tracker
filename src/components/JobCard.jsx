import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import StatusBadge from './StatusBadge';
import { STATUSES } from '../lib/sampleData';

const btn = {
  fontSize: 12,
  padding: '5px 11px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#94a3b8',
  background: 'transparent',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
};

function ActionBtn({ children, accent, onClick }) {
  const style = accent
    ? { ...btn, color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }
    : btn;
  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f1f5f9'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = accent ? '#38bdf8' : '#94a3b8'; }}
    >
      {children}
    </button>
  );
}

export default function JobCard({ job, onStatusChange, onEdit, onMarkApplied }) {
  const daysAgo = job.dateApplied
    ? differenceInDays(new Date(), parseISO(job.dateApplied))
    : null;

  const followUpOverdue = job.followUpDate && isPast(parseISO(job.followUpDate))
    && job.status !== STATUSES.REJECTED && job.status !== STATUSES.PASSED;

  const isActive = ![STATUSES.REJECTED, STATUSES.PASSED].includes(job.status);

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${followUpOverdue ? 'rgba(251,146,60,0.35)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
      opacity: isActive ? 1 : 0.5,
      transition: 'border-color 0.15s, opacity 0.15s',
    }}
    onMouseEnter={e => isActive && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
    onMouseLeave={e => e.currentTarget.style.borderColor = followUpOverdue ? 'rgba(251,146,60,0.35)' : 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>
              {job.staffingAgency && <span style={{ color: 'var(--text3)', fontWeight: 400 }}>{job.staffingAgency} → </span>}
              {job.company || <span style={{ color: 'var(--text3)' }}>Hiring co. TBD</span>}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</span>
            <StatusBadge status={job.status} />
            {job.applicationUrl && (
              <a href={job.applicationUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                JD
              </a>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {job.dateApplied && (
              <span style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                {format(parseISO(job.dateApplied), 'MMM d')}
                {daysAgo !== null && <span style={{ color: 'var(--text3)' }}> · {daysAgo}d ago</span>}
              </span>
            )}
            {job.salary && job.salary !== 'Not listed' && (
              <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{job.salary}</span>
            )}
            {job.source && (
              <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface2)', padding: '2px 7px', borderRadius: 4 }}>{job.source}</span>
            )}
            {job.network && (
              <span style={{ fontSize: 12, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {job.network}
              </span>
            )}
            {followUpOverdue && (
              <span style={{ fontSize: 11, color: '#fb923c', background: 'rgba(251,146,60,0.12)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(251,146,60,0.25)' }}>
                Follow up overdue
              </span>
            )}
          </div>

          {job.gmailUpdate && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#4ade80', background: 'rgba(74,222,128,0.08)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {job.gmailUpdate}
            </div>
          )}

          {job.notes && (
            <p style={{ marginTop: 7, fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{job.notes}</p>
          )}
        </div>

        {/* Actions */}
        {isActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
            {job.status === STATUSES.EVALUATE && (
              <ActionBtn accent onClick={() => onMarkApplied(job.id)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Mark applied
              </ActionBtn>
            )}
            {job.status === STATUSES.APPLIED && followUpOverdue && (
              <ActionBtn accent onClick={() => onEdit(job)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Follow up
              </ActionBtn>
            )}
            {[STATUSES.RECRUITER, STATUSES.INTERVIEW].includes(job.status) && (
              <ActionBtn accent onClick={() => onEdit(job)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Prep notes
              </ActionBtn>
            )}
            <ActionBtn onClick={() => onEdit(job)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </ActionBtn>
          </div>
        )}
      </div>
    </div>
  );
}
