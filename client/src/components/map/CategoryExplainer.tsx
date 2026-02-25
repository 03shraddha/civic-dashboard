import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store';
import { CATEGORIES, CATEGORY_EXPLANATIONS } from '../../constants/categories';

const AUTO_DISMISS_MS = 8000;

export function CategoryExplainer() {
  const { activeCategory } = useStore();

  const [visible, setVisible] = useState(false);
  const [displayedCategory, setDisplayedCategory] = useState<string | null>(null);
  const [progress, setProgress] = useState(100);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  function clearAll() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function startCountdown() {
    clearAll();
    setProgress(100);
    startRef.current = Date.now();

    function tick() {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
  }

  useEffect(() => {
    if (activeCategory) {
      setDisplayedCategory(activeCategory);
      setVisible(true);
      startCountdown();
    } else {
      setVisible(false);
    }
    return clearAll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  useEffect(() => () => clearAll(), []);

  if (!displayedCategory) return null;

  const meta = CATEGORIES[displayedCategory];
  const explanation = CATEGORY_EXPLANATIONS[displayedCategory];
  if (!meta || !explanation) return null;

  const accentColor = meta.color;

  return (
    <div
      style={{
        position: 'absolute',
        top: '14px',
        left: '50%',
        transform: visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(-120%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1100,
        width: '420px',
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Auto-dismiss progress bar */}
      <div style={{ height: '3px', background: '#f1f5f9' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(to right, ${accentColor}88, ${accentColor})`,
          transition: 'width 0.1s linear',
        }} />
      </div>

      <div style={{ padding: '14px 16px 16px' }}>

        {/* Header: icon + title + close */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: accentColor + '18',
              border: `1px solid ${accentColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
            }}>
              {meta.icon}
            </div>
            <div>
              <div style={{
                fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2,
              }}>
                {meta.label}
              </div>
              <div style={{
                fontSize: '10px', fontWeight: 600, color: accentColor,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '1px',
              }}>
                {explanation.department}
              </div>
            </div>
          </div>

          <button
            onClick={() => setVisible(false)}
            style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              cursor: 'pointer', fontSize: '14px', color: '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Definition */}
        <p style={{
          fontSize: '12.5px', color: '#334155', lineHeight: 1.6,
          margin: '0 0 12px 0',
        }}>
          {explanation.definition}
        </p>

        {/* Scope */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
          }}>
            What's included
          </div>
          <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.5 }}>
            {explanation.scope}
          </div>
        </div>

        {/* Examples */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
          }}>
            Typical complaints
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {explanation.examples.map((ex, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '7px',
                fontSize: '11.5px', color: '#334155',
              }}>
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: accentColor, flexShrink: 0, marginTop: '5px',
                }} />
                {ex}
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{
          fontSize: '10.5px', color: '#94a3b8',
          borderTop: '1px solid #f1f5f9', paddingTop: '10px',
        }}>
          Showing wards filtered by this category. Click a ward on the map for complaint details.
        </div>

      </div>
    </div>
  );
}
