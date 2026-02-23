// src/components/StreakDebugPanel.jsx
// Solo visible en modo desarrollo (import.meta.env.DEV)

export function StreakDebugPanel({ currentStreak, onAdd, onReset, onTestToast }) {
  if (!import.meta.env.DEV) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 16px',
      fontSize: '13px',
      fontFamily: 'monospace',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '160px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ opacity: 0.6, fontSize: '11px', marginBottom: '2px' }}>🛠 Streak Debug</div>
      <div style={{ fontSize: '22px', fontWeight: 700, textAlign: 'center' }}>
        🔥 {currentStreak}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => onAdd(1)} style={btnStyle('#1a6b2a')}>+1</button>
        <button onClick={() => onAdd(5)} style={btnStyle('#1a4a6b')}>+5</button>
        <button onClick={onReset} style={btnStyle('#6b1a1a')}>Reset</button>
      </div>
      <button onClick={onTestToast} style={{ ...btnStyle('#4a1a6b'), width: '100%' }}>
        Test Toast
      </button>
    </div>
  );
}

const btnStyle = (bg) => ({
  flex: 1,
  padding: '5px 8px',
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: '12px',
  fontWeight: 700,
});
