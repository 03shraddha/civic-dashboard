import { useStore } from '../../store';
import { scoreToColor } from '../../utils/colorScale';
import { CATEGORIES } from '../../constants/categories';

export function HoverPanel() {
  const { hoveredWardName, wardStats } = useStore();

  if (!hoveredWardName) return null;
  const stats = wardStats.get(hoveredWardName);
  const score = stats?.frustrationScore ?? 0;
  const scoreColor = score >= 0.6 ? '#ef4444' : score >= 0.3 ? '#f59e0b' : '#16a34a';

  const trendIcon = stats?.trend === 'rising' ? '↑' : stats?.trend === 'falling' ? '↓' : '→';
  const trendColor = stats?.trend === 'rising' ? '#ef4444' : stats?.trend === 'falling' ? '#16a34a' : '#94a3b8';

  const topCategories = stats
    ? Object.entries(stats.categoryBreakdown).sort(([, a], [, b]) => b - a).slice(0, 4)
    : [];

  return (
    <div style={{
      position: 'absolute',
      top: '12px', right: '12px',
      zIndex: 1000,
      width: '220px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
    }}>

      {/* Score accent bar at top */}
      <div style={{
        height: '3px',
        background: `linear-gradient(to right, #f1f5f9, ${scoreToColor(score)})`,
        width: `${Math.max(score * 100, 6)}%`,
        transition: 'width 0.25s ease',
      }} />

      <div style={{ padding: '14px' }}>

        {/* Ward name + trend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              {hoveredWardName}
            </div>
            {stats?.wardNo ? (
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Ward #{stats.wardNo}
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingTop: '1px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: scoreColor }}>
              {(score * 100).toFixed(0)}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: trendColor }}>{trendIcon}</span>
          </div>
        </div>

        {stats ? (
          <>
            {/* 3-metric grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
              {[
                { label: 'Total', value: stats.totalComplaints, color: '#0f172a' },
                { label: 'Open', value: stats.unresolvedComplaints, color: '#f59e0b' },
                { label: 'Resolved', value: `${stats.resolutionRatePercent}%`, color: '#16a34a' },
              ].map(m => (
                <div key={m.label} style={{
                  padding: '8px 4px', textAlign: 'center',
                  background: '#f8fafc', borderRadius: '6px',
                  border: '1px solid #f1f5f9',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Category bars */}
            {topCategories.length > 0 && (
              <div>
                <div style={{
                  fontSize: '11px', fontWeight: 600, color: '#94a3b8',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px',
                }}>
                  Issues
                </div>
                {topCategories.map(([cat, count]) => {
                  const meta = CATEGORIES[cat];
                  const pct = stats.totalComplaints > 0
                    ? Math.round((count / stats.totalComplaints) * 100) : 0;
                  return (
                    <div key={cat} style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', color: '#475569' }}>{meta?.label ?? cat}</span>
                        <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div style={{ height: '3px', borderRadius: '2px', background: '#f1f5f9' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`, borderRadius: '2px',
                          background: meta?.color ?? '#6366f1',
                          transition: 'width 0.25s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>No complaint data for this ward.</div>
        )}
      </div>
    </div>
  );
}
