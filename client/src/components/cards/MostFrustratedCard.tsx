import { useStore } from '../../store';
import { scoreToColor } from '../../utils/colorScale';

export function MostFrustratedCard() {
  const cityStats = useStore(s => s.cityStats);
  const d = cityStats?.mostFrustrated;
  if (!d) return <CardSkeleton />;

  const scoreColor = scoreToColor(d.frustrationScore ?? 0);

  return (
    <div className="stat-card">
      <div className="card-icon">🔥</div>
      <div className="card-label">Most Frustrated</div>
      <div className="card-ward">{d.wardName}</div>
      <div className="card-metric" style={{ color: scoreColor }}>
        Score: {((d.frustrationScore ?? 0) * 100).toFixed(0)}
      </div>
      {d.topIssue && (
        <div className="card-pill">{d.topIssue}</div>
      )}
      {d.totalComplaints != null && (
        <div className="card-sub">{d.totalComplaints.toLocaleString()} complaints</div>
      )}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="stat-card stat-card--loading">
      <div style={{ width: '60%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', marginBottom: '8px' }} />
      <div style={{ width: '80%', height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', marginBottom: '6px' }} />
      <div style={{ width: '40%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
    </div>
  );
}
