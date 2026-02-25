import { useStore } from '../../store';
import { scoreToColor } from '../../utils/colorScale';
import { CATEGORIES } from '../../constants/categories';

export function HoverPanel() {
  const { hoveredWardName, wardStats } = useStore();

  if (!hoveredWardName) return null;
  const stats = wardStats.get(hoveredWardName);
  const score = stats?.frustrationScore ?? 0;
  const scoreColor = scoreToColor(score);

  const trendIcon = stats?.trend === 'rising' ? '↑' : stats?.trend === 'falling' ? '↓' : '→';
  const trendColor = stats?.trend === 'rising' ? '#ef4444' : stats?.trend === 'falling' ? '#22c55e' : '#475569';

  const topCategories = stats
    ? Object.entries(stats.categoryBreakdown).sort(([, a], [, b]) => b - a).slice(0, 4)
    : [];

  return (
    <div style={{
      position: 'absolute',
      top: '12px',
      right: '12px',
      zIndex: 1000,
      width: '220px',
      background: '#0d1424',
      border: '1px solid rgba(148,163,184,0.12)',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>

      {/* Score bar at top */}
      <div style={{
        height: '3px',
        background: `linear-gradient(to right, ${scoreToColor(0)}, ${scoreColor})`,
        width: `${score * 100}%`,
        transition: 'width 0.3s ease',
      }} />

      <div style={{ padding: '12px' }}>

        {/* Ward name + trend */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', marginBottom: '10px',
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
              {hoveredWardName}
            </div>
            {stats?.wardNo ? (
              <div style={{ fontSize: '10px', color: '#334155', marginTop: '1px' }}>
                Ward #{stats.wardNo}
              </div>
            ) : null}
          </div>
          <span style={{ fontSize: '14px', color: trendColor, fontWeight: 700 }}>{trendIcon}</span>
        </div>

        {stats ? (
          <>
            {/* Frustration score */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '6px',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '11px', color: '#475569' }}>Frustration</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: scoreColor }}>
                {(score * 100).toFixed(0)}
                <span style={{ fontSize: '9px', color: '#334155', marginLeft: '2px' }}>/100</span>
              </span>
            </div>

            {/* 3 key metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginBottom: '10px' }}>
              {[
                { label: 'Total', value: stats.totalComplaints, color: '#94a3b8' },
                { label: 'Open', value: stats.unresolvedComplaints, color: '#f97316' },
                { label: 'Resolved', value: `${stats.resolutionRatePercent}%`, color: '#22c55e' },
              ].map(m => (
                <div key={m.label} style={{
                  padding: '6px 4px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '5px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '9px', color: '#334155', marginTop: '1px' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Category bars */}
            {topCategories.length > 0 && (
              <div>
                <div style={{
                  fontSize: '9px', color: '#334155',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: '5px',
                }}>
                  Issues
                </div>
                {topCategories.map(([cat, count]) => {
                  const meta = CATEGORIES[cat];
                  const pct = stats.totalComplaints > 0
                    ? Math.round((count / stats.totalComplaints) * 100) : 0;
                  return (
                    <div key={cat} style={{ marginBottom: '4px' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '2px',
                      }}>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>
                          {meta?.label ?? cat}
                        </span>
                        <span style={{ fontSize: '10px', color: '#475569' }}>{pct}%</span>
                      </div>
                      <div style={{
                        height: '2px', borderRadius: '1px',
                        background: 'rgba(255,255,255,0.06)',
                      }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          borderRadius: '1px',
                          background: meta?.color ?? '#6366f1',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: '11px', color: '#334155' }}>No complaint data</div>
        )}
      </div>
    </div>
  );
}
