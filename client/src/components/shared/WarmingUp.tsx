import { useEffect, useState, useRef } from 'react';
import { ENDPOINTS } from '../../constants/api';

interface Props {
  onReady: () => void;
}

const STEPS = [
  { until: 10,  label: 'Waking up the server...',                      detail: 'The free hosting tier sleeps after inactivity. Shouldn\'t take long.' },
  { until: 35,  label: 'Fetching 300,000+ BBMP complaint records...',  detail: 'Pulling grievance data from the BBMP open data portal in batches.' },
  { until: 60,  label: 'Matching ward names across datasets...',        detail: 'Three datasets use different spellings - fuzzy-matching them now.' },
  { until: 85,  label: 'Computing frustration scores per ward...',      detail: 'Weighing complaint density, resolution rates, potholes & streetlights.' },
  { until: Infinity, label: 'Almost ready - finishing up...',           detail: 'Caching results so every subsequent load takes under a second.' },
];

export function WarmingUp({ onReady }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const TYPED_MSG = 'This only happens once - subsequent loads take under a second.';
  const [typedText, setTypedText] = useState('');
  const typedRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect — starts after 2s, types one char every 40ms
  useEffect(() => {
    const start = setTimeout(() => {
      const ticker = setInterval(() => {
        typedRef.current += 1;
        setTypedText(TYPED_MSG.slice(0, typedRef.current));
        if (typedRef.current >= TYPED_MSG.length) clearInterval(ticker);
      }, 40);
      return () => clearInterval(ticker);
    }, 2000);
    return () => clearTimeout(start);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(ENDPOINTS.health);
        const data = await res.json();
        if (!cancelled && data.cachedWindows && data.cachedWindows.length > 0) {
          onReady();
          return;
        }
      } catch { /* server still starting — keep polling */ }
      if (!cancelled) setTimeout(poll, 5000);
    }
    const t = setTimeout(poll, 8000);
    return () => { cancelled = true; clearTimeout(t); };
  }, [onReady]);

  const step = STEPS.find(s => elapsed < s.until) ?? STEPS[STEPS.length - 1];
  const stepIndex = STEPS.indexOf(step);
  const pct = Math.min(elapsed / 90, 0.95); // cap at 95% until truly ready
  const barWidth = Math.round(pct * 100);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      {/* Icon */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '18px',
        background: '#6366f1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '32px', marginBottom: '28px',
        boxShadow: '0 4px 24px rgba(99,102,241,0.25)',
      }}>
        📡
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', marginBottom: '6px', textAlign: 'center' }}>
        Grievance Map
      </h1>
      <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '40px', textAlign: 'center' }}>
        Bengaluru · 225 wards · BBMP civic data
      </p>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: '8px' }}>
        <div style={{
          width: '100%', height: '6px', background: '#e2e8f0',
          borderRadius: '3px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${barWidth}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            borderRadius: '3px',
            transition: 'width 1s linear',
          }} />
        </div>
      </div>

      {/* Current step label */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: '28px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: '0 0 2px' }}>
          {step.label}
        </p>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          {step.detail}
        </p>
      </div>

      {/* Step checklist */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '12px', padding: '20px 24px', width: '100%', maxWidth: '420px',
        marginBottom: '24px',
      }}>
        {STEPS.slice(0, -1).map((s, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              marginBottom: i < STEPS.length - 2 ? '12px' : 0,
              opacity: done || active ? 1 : 0.35,
            }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                background: done ? '#22c55e' : active ? '#6366f1' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: '#fff', fontWeight: 700,
              }}>
                {done ? '✓' : active ? '.' : ''}
              </div>
              <span style={{ fontSize: '13px', color: done ? '#22c55e' : active ? '#1e293b' : '#94a3b8', fontWeight: active ? 600 : 400 }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ color: '#64748b', fontSize: '15px', textAlign: 'center', fontFamily: 'monospace', minHeight: '24px' }}>
        {elapsed}s elapsed ·{' '}
        <span style={{ color: '#6366f1' }}>
          {typedText}
          {typedText.length < TYPED_MSG.length && (
            <span style={{ borderRight: '2px solid #6366f1', marginLeft: '1px', animation: 'blink 0.8s step-end infinite' }}>&nbsp;</span>
          )}
        </span>
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </p>
    </div>
  );
}
