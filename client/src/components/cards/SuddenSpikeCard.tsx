import { useStore } from '../../store';
import { CardSkeleton } from './MostFrustratedCard';

export function SuddenSpikeCard() {
  const cityStats = useStore(s => s.cityStats);
  const d = cityStats?.suddenSpike;
  if (!d) return <CardSkeleton />;

  const pct = d.changePercent ?? 0;

  return (
    <div className="stat-card">
      <div className="card-icon">📈</div>
      <div className="card-label">Sudden Spike</div>
      <div className="card-ward">{d.wardName}</div>
      <div className="card-metric" style={{ color: '#f97316' }}>
        +{pct}% increase
      </div>
      <div className="card-sub">
        {d.currentTotal} now vs {d.previousTotal} prior
      </div>
    </div>
  );
}
