import { useState } from 'react';

// SHA-256 hash of your PIN — replace this with yours after hashing
// Generate at: https://emn178.github.io/online-tools/sha256.html
export const SYNC_PIN_HASH = '9072a0ce8784e9c3f6513d11d88a963d86c49ff2689a314c789797e3080c99e5';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.75)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200, padding: '1rem',
};

export default function PinModal({ onSuccess, onClose }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function handleSubmit() {
    if (!pin) return;
    setChecking(true);
    setError('');
    const hash = await sha256(pin);
    if (hash === SYNC_PIN_HASH) {
      onSuccess();
    } else {
      setError('Incorrect PIN. Try again.');
      setPin('');
    }
    setChecking(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: '1.75rem',
        width: '100%',
        maxWidth: 360,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, color: '#f1f5f9', marginBottom: 6 }}>Sync authorization</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Enter your PIN to sync from Google Sheets.
        </p>
        <input
          type="password"
          autoFocus
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Enter PIN"
          style={{ width: '100%', marginBottom: '0.75rem', fontSize: 14, letterSpacing: '0.1em' }}
        />
        {error && (
          <p style={{ fontSize: 12, color: '#f87171', marginBottom: '0.75rem' }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ fontSize: 13, color: '#94a3b8', padding: '7px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={checking || !pin}
            style={{ fontSize: 13, color: '#0f172a', padding: '7px 18px', borderRadius: 6, background: checking ? '#7dd3fc' : '#38bdf8', border: 'none', fontWeight: 500 }}
          >
            {checking ? 'Checking…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
