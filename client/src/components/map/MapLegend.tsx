import { LEGEND_STOPS } from '../../utils/colorScale';

export function MapLegend() {
  const gradient = LEGEND_STOPS.map(s => `${s.color} ${s.score * 100}%`).join(', ');

  return (
    <div style={{
      position: 'absolute',
      bottom: '32px',
      left: '16px',
      zIndex: 1000,
      background: 'rgba(15,23,42,0.9)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(148,163,184,0.2)',
      borderRadius: '10px',
      padding: '12px 14px',
      color: 'white',
      fontSize: '11px',
    }}>
      <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Frustration Score
      </div>
      <div style={{
        width: '160px',
        height: '10px',
        borderRadius: '5px',
        background: `linear-gradient(to right, ${gradient})`,
        marginBottom: '4px',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}
