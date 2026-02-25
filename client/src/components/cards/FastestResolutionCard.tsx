import { useStore } from '../../store';
import { CardSkeleton } from './MostFrustratedCard';

export function FastestResolutionCard() {
  const cityStats = useStore(s => s.cityStats);
  const d = cityStats?.fastestResolution;
  if (!d) return <CardSkeleton />;

  return (
    <div className="stat-card">
      <div className="card-icon">⚡</div>
      <div className="card-label">Fastest Resolution</div>
      <div className="card-ward">{d.wardName}</div>
      <div className="card-metric" style={{ color: '#22c55e' }}>
        {d.resolutionRatePercent?.toFixed(1)}% resolved
      </div>
      {d.totalComplaints != null && (
        <div className="card-sub">{d.totalComplaints.toLocaleString()} total complaints</div>
      )}
    </div>
  );
}
