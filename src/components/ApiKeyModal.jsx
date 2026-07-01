import { useState } from 'react';
import { setApiKey } from '../lib/claudeApi';

const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.75)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200, padding: '1rem',
};

export default function ApiKeyModal({ onSave, onClose }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) { setError('Enter your Anthropic API key.'); return; }
    if (!trimmed.startsWith('sk-ant-')) {
      setError('Key should start with sk-ant-');
      return;
    }
    setApiKey(trimmed);
    onSave();
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSave();
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
        maxWidth: 400,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, color: '#f1f5f9', marginBottom: 6 }}>
          Anthropic API key
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Required for AI role evaluation. Stored locally in your browser — never sent anywhere except Anthropic's API.
        </p>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={e => { setValue(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          placeholder="sk-ant-..."
          style={{
            width: '100%',
            marginBottom: '0.75rem',
            fontSize: 13,
            fontFamily: 'var(--mono)',
            letterSpacing: '0.02em',
          }}
        />
        {error && (
          <p style={{ fontSize: 12, color: '#f87171', marginBottom: '0.75rem' }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13, color: '#94a3b8', padding: '7px 14px',
              borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              fontSize: 13, color: '#0f172a', padding: '7px 18px',
              borderRadius: 6, background: '#38bdf8', border: 'none', fontWeight: 500,
            }}
          >
            Save & evaluate
          </button>
        </div>
      </div>
    </div>
  );
}
