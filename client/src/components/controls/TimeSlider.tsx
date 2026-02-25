import { useStore } from '../../store';
import { TIME_FILTERS, TimeFilter } from '../../constants/scoring';

const LABELS: Record<TimeFilter, string> = {
  live: 'Live',
  '24h': '24h',
  '7d': '7 Days',
  '30d': '30 Days',
  seasonal: 'Season',
};

export function TimeSlider() {
  const { timeFilter, setTimeFilter } = useStore();

  return (
    <div style={{
      display: 'flex',
      gap: '2px',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '8px',
      padding: '3px',
    }}>
      {TIME_FILTERS.map(tf => (
        <button
          key={tf}
          onClick={() => setTimeFilter(tf)}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: tf === timeFilter ? 600 : 400,
            background: tf === timeFilter ? 'rgba(99,102,241,0.8)' : 'transparent',
            color: tf === timeFilter ? 'white' : '#94a3b8',
            transition: 'all 0.15s ease',
          }}
        >
          {LABELS[tf]}
        </button>
      ))}
    </div>
  );
}
