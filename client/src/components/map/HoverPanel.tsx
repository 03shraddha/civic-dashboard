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
  const trendColor = stats?.trend === 'rising' ? '#ef4444' : stats?.trend === 'falling' ? '#22c55e' : '#94a3b8';

  const topCategories = stats
    ? Object.entries(stats.categoryBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
    : [];

  return (
    <div
      className="hover-panel"
      style={{
        position: 'absolute',
        top: '80px',
        right: '16px',
        zIndex: 1000,
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148,163,184,0.2)',
        borderRadius: '12px',
        padding: '16px',
        width: '260px',
        color: 'white',
        fontSize: '13px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Ward name */}
      <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#f1f5f9' }}>
        {hoveredWardName}
        {stats?.wardNo ? (
          <span style={{ fontWeight: 400, color: '#64748b', fontSize: '12px', marginLeft: '6px' }}>
            #{stats.wardNo}
          </span>
        ) : null}
      </div>

      {stats ? (
        <>
          {/* Frustration Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: scoreColor, flexShrink: 0,
            }} />
            <span style={{ color: '#94a3b8' }}>Frustration Score:</span>
            <span style={{ fontWeight: 700, color: scoreColor }}>
              {(score * 100).toFixed(0)}
            </span>
            <span style={{ color: trendColor, marginLeft: 'auto' }}>{trendIcon}</span>
          </div>

          {/* Complaints */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Total</div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{stats.totalComplaints}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Unresolved</div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#f97316' }}>{stats.unresolvedComplaints}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Resolution</div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#22c55e' }}>{stats.resolutionRatePercent}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Potholes</div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{stats.potholeComplaints}</div>
            </div>
          </div>

          {/* Category breakdown */}
          {topCategories.length > 0 && (
            <div>
              <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top Issues
              </div>
              {topCategories.map(([cat, count]) => {
                const meta = CATEGORIES[cat];
                const pct = stats.totalComplaints > 0
                  ? Math.round((count / stats.totalComplaints) * 100)
                  : 0;
                return (
                  <div key={cat} style={{ marginBottom: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '11px' }}>
                        {meta?.icon} {meta?.label ?? cat}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: '2px',
                        background: meta?.color ?? '#64748b',
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
        <div style={{ color: '#64748b' }}>No complaint data for this ward</div>
      )}
    </div>
  );
}
