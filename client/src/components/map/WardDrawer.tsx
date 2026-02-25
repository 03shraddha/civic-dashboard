import { useStore } from '../../store';
import { scoreToColor } from '../../utils/colorScale';
import { CATEGORIES } from '../../constants/categories';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Closed:     { bg: '#dcfce7', text: '#15803d' },
  ReOpen:     { bg: '#fff7ed', text: '#c2410c' },
  Registered: { bg: '#fefce8', text: '#a16207' },
};

function ScoreBadge({ score }: { score: number }) {
  const label = score >= 0.6 ? 'High' : score >= 0.3 ? 'Medium' : 'Low';
  const color = score >= 0.6 ? '#dc2626' : score >= 0.3 ? '#d97706' : '#16a34a';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      padding: '2px 8px', borderRadius: '12px',
      background: color + '18', border: `1px solid ${color}40`,
      fontSize: '11px', fontWeight: 600, color,
    }}>
      {label} · {(score * 100).toFixed(0)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? { bg: '#f1f5f9', text: '#64748b' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 7px', borderRadius: '10px',
      background: colors.bg, color: colors.text,
      fontSize: '10px', fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

export function WardDrawer() {
  const { activeWardName, setActiveWardName, wardStats } = useStore();

  const isOpen = Boolean(activeWardName);
  const stats = activeWardName ? wardStats.get(activeWardName) : undefined;
  const score = stats?.frustrationScore ?? 0;
  const accentColor = score > 0 ? scoreToColor(score) : '#6366f1';

  const allCategories = stats
    ? Object.entries(stats.categoryBreakdown).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: '320px',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        background: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        boxShadow: isOpen ? '-4px 0 24px rgba(0,0,0,0.12)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200,
        overflowY: 'auto',
      }}
    >
      {/* Colour accent bar */}
      <div style={{
        height: '4px',
        background: `linear-gradient(to right, ${accentColor}44, ${accentColor})`,
        flexShrink: 0,
      }} />

      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid #f1f5f9',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              {activeWardName ?? ''}
            </div>
            {stats?.wardNo ? (
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                Ward #{stats.wardNo}
              </div>
            ) : null}
          </div>
          <button
            onClick={() => setActiveWardName(null)}
            style={{
              width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '6px', cursor: 'pointer',
              fontSize: '14px', color: '#64748b',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ marginTop: '8px' }}>
          {stats && <ScoreBadge score={score} />}
        </div>
      </div>

      {stats ? (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* 3-metric row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {[
              { label: 'Total', value: String(stats.totalComplaints), color: '#0f172a' },
              { label: 'Open', value: String(stats.unresolvedComplaints), color: '#f59e0b' },
              { label: 'Resolved%', value: `${stats.resolutionRatePercent}%`, color: '#16a34a' },
            ].map(m => (
              <div key={m.label} style={{
                padding: '10px 6px', textAlign: 'center',
                background: '#f8fafc', borderRadius: '8px',
                border: '1px solid #f1f5f9',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: m.color, lineHeight: 1 }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          {allCategories.length > 0 && (
            <div>
              <SectionLabel>Issues</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {allCategories.map(([cat, count]) => {
                  const meta = CATEGORIES[cat];
                  const pct = stats.totalComplaints > 0
                    ? Math.round((count / stats.totalComplaints) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '4px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {meta?.icon && <span style={{ fontSize: '12px' }}>{meta.icon}</span>}
                          <span style={{ fontSize: '12px', color: '#475569' }}>
                            {meta?.label ?? cat}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{ height: '4px', borderRadius: '2px', background: '#f1f5f9' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          borderRadius: '2px',
                          background: meta?.color ?? '#6366f1',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent complaints */}
          {stats.recentComplaints.length > 0 && (
            <div>
              <SectionLabel>Recent Complaints</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stats.recentComplaints.map((c) => {
                  const meta = CATEGORIES[c.category];
                  return (
                    <div key={c.id} style={{
                      padding: '8px 10px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9',
                    }}>
                      {/* Top row: category badge + status */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '4px',
                      }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          fontSize: '10px', fontWeight: 600,
                          color: meta?.color ?? '#6366f1',
                          background: (meta?.color ?? '#6366f1') + '18',
                          padding: '2px 6px', borderRadius: '8px',
                        }}>
                          {meta?.icon && <span>{meta.icon}</span>}
                          {meta?.label ?? c.category}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      {/* Sub-category (specific complaint description) */}
                      {c.subCategory && (
                        <div style={{
                          fontSize: '12px', color: '#0f172a', fontWeight: 500,
                          lineHeight: 1.4, marginBottom: '3px',
                        }}>
                          {c.subCategory}
                        </div>
                      )}
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {c.date.slice(0, 10)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div style={{ padding: '20px 16px', fontSize: '13px', color: '#94a3b8' }}>
          No complaint data for this ward.
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: 700, color: '#94a3b8',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: '8px',
    }}>
      {children}
    </div>
  );
}
