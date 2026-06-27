import { STATUS_META } from '../lib/sampleData';

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.evaluate;
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      padding: '3px 9px',
      borderRadius: 20,
      background: meta.bg,
      color: meta.color,
      border: `1px solid ${meta.border}`,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
}
