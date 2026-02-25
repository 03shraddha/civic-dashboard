import { useState } from 'react';
import { useStore } from '../../store';
import { CATEGORIES, ALL_CATEGORY } from '../../constants/categories';

export function FilterDropdown() {
  const { activeCategory, setActiveCategory } = useStore();
  const [open, setOpen] = useState(false);

  const currentLabel = activeCategory
    ? (CATEGORIES[activeCategory]?.label ?? activeCategory)
    : ALL_CATEGORY;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: '8px',
          color: '#e2e8f0',
          fontSize: '13px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <span>
          {activeCategory && CATEGORIES[activeCategory]?.icon
            ? `${CATEGORIES[activeCategory].icon} `
            : '🏙️ '}
        </span>
        {currentLabel}
        <span style={{ color: '#64748b', fontSize: '10px' }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          background: 'rgba(15,23,42,0.98)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: '10px',
          overflow: 'hidden',
          minWidth: '220px',
          zIndex: 2000,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}>
          <button
            onClick={() => { setActiveCategory(null); setOpen(false); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '10px 14px', background: !activeCategory ? 'rgba(99,102,241,0.2)' : 'transparent',
              border: 'none', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer',
            }}
          >
            🏙️ {ALL_CATEGORY}
          </button>
          {Object.entries(CATEGORIES).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => { setActiveCategory(key); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px',
                background: activeCategory === key ? 'rgba(99,102,241,0.2)' : 'transparent',
                border: 'none', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer',
                borderTop: '1px solid rgba(148,163,184,0.08)',
              }}
            >
              {meta.icon} {meta.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
