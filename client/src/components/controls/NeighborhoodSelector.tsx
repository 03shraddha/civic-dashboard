import { useState } from 'react';
import { useStore } from '../../store';

const CONSTITUENCIES = [
  'Dasarahalli', 'Mahalakshmi Layout', 'Malleshwaram', 'Hebbal',
  'Byatarayanapura', 'Yeshwanthpur', 'RR Nagar', 'Vijayanaagar',
  'Chamrajpet', 'Chickpet', 'Shivajinagar', 'Shanthinagar',
  'Gandhi Nagar', 'Rajajinagar', 'Govindaraja Nagar', 'Basavangudi',
  'Padmanabha Nagar', 'BTM Layout', 'Jayanagar', 'Bommanahalli',
  'Mahadevapura', 'CV Raman Nagar', 'Pulakeshinagar', 'Sarvagnanagar',
  'Bangalore East', 'Bangalore South', 'Anekal', 'KR Puram',
];

const PREVIEW_COUNT = 3;

export function NeighborhoodSelector() {
  const { activeConstituency, setActiveConstituency } = useStore();
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? CONSTITUENCIES : CONSTITUENCIES.slice(0, PREVIEW_COUNT);
  const remaining = CONSTITUENCIES.length - PREVIEW_COUNT;

  return (
    <div>
      {/* Label row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Neighbourhood
          </span>
          {activeConstituency && (
            <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>
              · {activeConstituency}
            </span>
          )}
        </div>
        {activeConstituency && (
          <button
            onClick={() => setActiveConstituency(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '11px', color: '#94a3b8', padding: 0,
            }}
          >
            Clear ×
          </button>
        )}
      </div>

      {/* Chips — always visible */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {visible.map(c => {
          const active = activeConstituency === c;
          return (
            <button
              key={c}
              onClick={() => setActiveConstituency(active ? null : c)}
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '5px 10px', borderRadius: '20px', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: active ? 600 : 400,
                background: active ? '#eef2ff' : '#f8fafc',
                color: active ? '#6366f1' : '#64748b',
                outline: active ? '1.5px solid #c7d2fe' : '1.5px solid #e2e8f0',
                outlineOffset: '-1.5px',
                transition: 'background 0.12s, color 0.12s, outline-color 0.12s',
              }}
            >
              {c}
            </button>
          );
        })}

        {/* View more / less toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            padding: '5px 10px', borderRadius: '20px',
            border: '1px solid #e2e8f0', background: 'transparent',
            color: '#6366f1', fontSize: '11px', fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {expanded ? '− Less' : `+ ${remaining} more`}
        </button>
      </div>
    </div>
  );
}
