import { useStore } from '../../store';
import { CardSkeleton } from './MostFrustratedCard';

export function MostImprovedCard() {
  const cityStats = useStore(s => s.cityStats);
  const d = cityStats?.mostImproved;
  if (!d) return <CardSkeleton />;

  const pct = Math.abs(d.changePercent ?? 0);

  return (
    <div className="stat-card">
      <div className="card-icon">✅</div>
      <div className="card-label">Most Improved</div>
      <div className="card-ward">{d.wardName}</div>
      <div className="card-metric" style={{ color: '#22c55e' }}>
        -{pct}% fewer complaints
      </div>
      <div className="card-sub">
        {d.currentTotal} now vs {d.previousTotal} prior
      </div>
    </div>
  );
}
