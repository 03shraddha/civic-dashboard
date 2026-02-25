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
    const t = setTimeout(poll, 10000);
    return () => { cancelled = true; clearTimeout(t); };
  }, [onReady]);

  const pct = Math.min(elapsed / 90, 1);
  const barWidth = Math.round(pct * 100);

  const statusText =
    elapsed < 10 ? 'Starting up…' :
    elapsed < 40 ? 'Fetching ward boundaries and complaint data…' :
    elapsed < 70 ? 'Normalising ward names, computing scores…' :
    'Almost ready…';

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Logo */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: '#6366f1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '26px', marginBottom: '24px',
      }}>
        📡
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
        Grievance Map
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px', textAlign: 'center', maxWidth: '340px', lineHeight: 1.6 }}>
        Aggregating 300,000+ BBMP complaint records{dots}
      </p>

      {/* Progress bar */}
      <div style={{
        width: '280px', height: '4px', background: '#e2e8f0',
        borderRadius: '2px', overflow: 'hidden', marginBottom: '10px',
      }}>
        <div style={{
          height: '100%', width: `${barWidth}%`,
          background: '#6366f1', borderRadius: '2px',
          transition: 'width 1s linear',
        }} />
      </div>

      <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '32px' }}>
        {statusText} ({elapsed}s)
      </p>

      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '10px', padding: '16px 20px', maxWidth: '320px',
        fontSize: '13px', color: '#64748b', lineHeight: 1.7,
      }}>
        <div style={{ color: '#0f172a', fontWeight: 600, marginBottom: '4px' }}>
          This only happens once per server start
        </div>
        After warm-up, all map data is cached and loads in &lt;500ms for every user.
        The cache refreshes every 15 minutes automatically.
      </div>
    </div>
  );
}
