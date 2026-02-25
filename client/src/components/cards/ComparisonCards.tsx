import { MostFrustratedCard } from './MostFrustratedCard';
import { FastestResolutionCard } from './FastestResolutionCard';
import { SuddenSpikeCard } from './SuddenSpikeCard';
import { MostImprovedCard } from './MostImprovedCard';
import { useStore } from '../../store';

export function ComparisonCards() {
  const cityAvgResolutionRate = useStore(s => s.cityStats?.cityAvgResolutionRate);

  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      gap: '12px',
      maxWidth: '95vw',
      overflowX: 'auto',
      padding: '0 8px',
    }}>
      <MostFrustratedCard />
      <FastestResolutionCard />
      <SuddenSpikeCard />
      <MostImprovedCard />
      {cityAvgResolutionRate != null && (
        <div className="stat-card" style={{ minWidth: '160px' }}>
          <div className="card-icon">🏙️</div>
          <div className="card-label">City Average</div>
          <div className="card-metric" style={{ color: '#6366f1' }}>
            {cityAvgResolutionRate}%
          </div>
          <div className="card-sub">resolution rate</div>
        </div>
      )}
    </div>
  );
}
