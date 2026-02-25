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
      width: '210px',
      background: '#080d18',
      border: '1px solid rgba(148,163,184,0.1)',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>

      {/* Score accent bar */}
      <div style={{
        height: '2px',
        background: `linear-gradient(to right, transparent, ${scoreColor})`,
        width: `${Math.max(score * 100, 8)}%`,
        transition: 'width 0.25s ease',
      }} />

      <div style={{ padding: '12px' }}>

        {/* Ward name + trend */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '10px',
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
              {hoveredWardName}
            </div>
            {stats?.wardNo ? (
              <div style={{ fontSize: '10px', color: '#334155', marginTop: '2px', fontWeight: 400 }}>
                Ward #{stats.wardNo}
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '1px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: scoreColor }}>
              {(score * 100).toFixed(0)}
            </span>
            <span style={{ fontSize: '13px', color: trendColor, fontWeight: 700, lineHeight: 1 }}>
              {trendIcon}
            </span>
          </div>
        </div>

        {stats ? (
          <>
            {/* 3-metric grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: '4px', marginBottom: '10px',
            }}>
              {[
                { label: 'Total', value: stats.totalComplaints, color: '#94a3b8' },
                { label: 'Open', value: stats.unresolvedComplaints, color: '#f59e0b' },
                { label: 'Resolved', value: `${stats.resolutionRatePercent}%`, color: '#22c55e' },
              ].map(m => (
                <div key={m.label} style={{
                  padding: '6px 4px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '5px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: m.color }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '9px', color: '#334155', marginTop: '1px', fontWeight: 400 }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Category breakdown bars */}
            {topCategories.length > 0 && (
              <div>
                <div style={{
                  fontSize: '9px', color: '#334155', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: '6px',
                }}>
                  Issues
                </div>
                {topCategories.map(([cat, count]) => {
                  const meta = CATEGORIES[cat];
                  const pct = stats.totalComplaints > 0
                    ? Math.round((count / stats.totalComplaints) * 100) : 0;
                  return (
                    <div key={cat} style={{ marginBottom: '5px' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '3px',
                      }}>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 400 }}>
                          {meta?.label ?? cat}
                        </span>
                        <span style={{ fontSize: '10px', color: '#475569', fontWeight: 600 }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{
                        height: '2px', borderRadius: '1px',
                        background: 'rgba(255,255,255,0.05)',
                      }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          borderRadius: '1px',
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
          <div style={{ fontSize: '11px', color: '#334155', fontWeight: 400 }}>
            No complaint data
          </div>
        )}
      </div>
    </div>
  );
}
