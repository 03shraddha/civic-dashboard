import { useState } from 'react';
import { useStore } from '../../store';

// 28 BBMP constituencies (approximate groupings)
const CONSTITUENCIES = [
  'Dasarahalli', 'Mahalakshmi Layout', 'Malleshwaram', 'Hebbal',
  'Byatarayanapura', 'Yeshwanthpur', 'RR Nagar', 'Vijayanaagar',
  'Chamrajpet', 'Chickpet', 'Shivajinagar', 'Shanthinagar',
  'Gandhi Nagar', 'Rajajinagar', 'Govindaraja Nagar', 'Basavangudi',
  'Padmanabha Nagar', 'BTM Layout', 'Jayanagar', 'Bommanahalli',
  'Mahadevapura', 'CV Raman Nagar', 'Pulakeshinagar', 'Sarvagnanagar',
  'Bangalore East', 'Bangalore South', 'Anekal', 'KR Puram',
];

export function NeighborhoodSelector() {
  const { activeConstituency, setActiveConstituency } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px',
          background: activeConstituency ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: '8px', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        📍 {activeConstituency || 'Constituency'}
        {activeConstituency && (
          <span
            onClick={e => { e.stopPropagation(); setActiveConstituency(null); }}
            style={{ color: '#94a3b8', cursor: 'pointer', marginLeft: '2px' }}
          >✕</span>
        )}
        {!activeConstituency && <span style={{ color: '#64748b', fontSize: '10px' }}>▼</span>}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: 'rgba(15,23,42,0.98)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px',
          overflow: 'auto', maxHeight: '280px', minWidth: '200px',
          zIndex: 2000, boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}>
          {CONSTITUENCIES.map(c => (
            <button
              key={c}
              onClick={() => { setActiveConstituency(c); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 14px',
                background: activeConstituency === c ? 'rgba(99,102,241,0.2)' : 'transparent',
                border: 'none', borderTop: '1px solid rgba(148,163,184,0.06)',
                color: '#e2e8f0', fontSize: '12px', cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
