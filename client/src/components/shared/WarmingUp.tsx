import { useEffect, useState } from 'react';

interface Props {
  onReady: () => void;
}

export function WarmingUp({ onReady }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(s => s + 1);
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll the health endpoint every 5 seconds to check if cache is ready
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch('/health');
        const data = await res.json();
        if (!cancelled && data.cachedWindows && data.cachedWindows.length > 0) {
          onReady();
          return;
        }
      } catch { /* ignore */ }
      if (!cancelled) setTimeout(poll, 5000);
    }
    // First poll after 10s (give server time to start fetching)
    const t = setTimeout(poll, 10000);
    return () => { cancelled = true; clearTimeout(t); };
  }, [onReady]);

  const pct = Math.min(elapsed / 90, 1); // assume ~90s max
  const barWidth = Math.round(pct * 100);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#020617',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Logo */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '14px',
        background: 'linear-gradient(135deg, #6366f1, #e85d04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px', marginBottom: '24px',
        boxShadow: '0 0 40px rgba(99,102,241,0.4)',
      }}>
        📡
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#f1f5f9' }}>
        Civic Pulse — Bengaluru
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px', textAlign: 'center', maxWidth: '340px' }}>
        Server is aggregating 300,000+ BBMP complaint records
        from CKAN{dots}
      </p>

      {/* Progress bar */}
      <div style={{
        width: '280px', height: '4px', background: 'rgba(255,255,255,0.08)',
        borderRadius: '2px', overflow: 'hidden', marginBottom: '12px',
      }}>
        <div style={{
          height: '100%', width: `${barWidth}%`,
          background: 'linear-gradient(to right, #6366f1, #e85d04)',
          borderRadius: '2px',
          transition: 'width 1s linear',
        }} />
      </div>

      <p style={{ color: '#475569', fontSize: '12px', marginBottom: '32px' }}>
        {elapsed < 10 ? 'Starting up…' :
         elapsed < 40 ? 'Fetching ward boundaries and complaint data…' :
         elapsed < 70 ? 'Normalizing ward names, computing scores…' :
         'Almost ready…'}
        {' '}({elapsed}s)
      </p>

      {/* What's happening */}
      <div style={{
        background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: '10px', padding: '16px 20px', maxWidth: '320px', fontSize: '12px',
        color: '#475569', lineHeight: 1.7,
      }}>
        <div style={{ color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
          This only happens once per server start
        </div>
        After warm-up, all map data is cached and loads in &lt;500ms for every user.
        The cache refreshes every 15 minutes automatically.
      </div>
    </div>
  );
}
