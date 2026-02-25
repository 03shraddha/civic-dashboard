import { useStore } from '../../store';
import { TIME_FILTERS, TimeFilter } from '../../constants/scoring';
import { CATEGORIES } from '../../constants/categories';
import { scoreToColor } from '../../utils/colorScale';

const TIME_LABELS: Record<TimeFilter, string> = {
  live: 'Live', '24h': '24h', '7d': '7d', '30d': '30d', seasonal: 'Season',
};

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: 600, color: '#334155',
      letterSpacing: '0.09em', textTransform: 'uppercase',
      marginBottom: '8px',
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ borderTop: '1px solid rgba(148,163,184,0.07)', margin: '16px 0' }} />
  );
}

export function Sidebar() {
  const {
    totalComplaints, timeFilter, setTimeFilter,
    activeCategory, setActiveCategory,
    cityStats, isLoadingWards,
  } = useStore();

  return (
    <div style={{
      width: '260px',
      flexShrink: 0,
      height: '100%',
      background: '#0a0f1e',
      borderRight: '1px solid rgba(148,163,184,0.08)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      <div style={{ padding: '16px' }}>

        {/* ── CITY KPIs ─────────────────────────────── */}
        <div style={{ marginBottom: '4px' }}>
          <div style={{
            fontSize: '32px', fontWeight: 800, color: '#f1f5f9',
            lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            {isLoadingWards ? '—' : totalComplaints.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
            complaints in selected window
          </div>
        </div>

        {cityStats?.cityAvgResolutionRate != null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginTop: '10px',
          }}>
            <div style={{
              width: '100%', height: '3px', background: 'rgba(255,255,255,0.06)',
              borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${cityStats.cityAvgResolutionRate}%`,
                background: cityStats.cityAvgResolutionRate > 70 ? '#22c55e' :
                             cityStats.cityAvgResolutionRate > 40 ? '#f4a500' : '#ef4444',
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}
        {cityStats?.cityAvgResolutionRate != null && (
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>
              {cityStats.cityAvgResolutionRate}%
            </span>
            {' '}city resolution rate
          </div>
        )}

        <Divider />

        {/* ── TIME FILTER ───────────────────────────── */}
        <SectionLabel>Time Window</SectionLabel>
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '7px', padding: '3px',
        }}>
          {TIME_FILTERS.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              style={{
                flex: 1, padding: '5px 0',
                borderRadius: '5px', border: 'none',
                cursor: 'pointer', fontSize: '11px', fontWeight: 500,
                background: tf === timeFilter ? '#6366f1' : 'transparent',
                color: tf === timeFilter ? 'white' : '#475569',
                transition: 'all 0.12s ease',
              }}
            >
              {TIME_LABELS[tf]}
            </button>
          ))}
        </div>

        <Divider />

        {/* ── CATEGORY FILTER ───────────────────────── */}
        <SectionLabel>Category</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>

          {/* All */}
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 8px', borderRadius: '6px', border: 'none',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              background: !activeCategory ? 'rgba(99,102,241,0.15)' : 'transparent',
              transition: 'background 0.1s',
            }}
          >
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: !activeCategory ? '#6366f1' : '#334155', flexShrink: 0,
            }} />
            <span style={{
              fontSize: '12px',
              color: !activeCategory ? '#e2e8f0' : '#64748b',
              fontWeight: !activeCategory ? 500 : 400,
            }}>
              All Categories
            </span>
          </button>

          {Object.entries(CATEGORIES).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 8px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                background: activeCategory === key ? 'rgba(99,102,241,0.15)' : 'transparent',
                transition: 'background 0.1s',
              }}
            >
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: meta.color, flexShrink: 0,
              }} />
              <span style={{
                fontSize: '12px',
                color: activeCategory === key ? '#e2e8f0' : '#64748b',
                fontWeight: activeCategory === key ? 500 : 400,
              }}>
                {meta.label}
              </span>
            </button>
          ))}
        </div>

        <Divider />

        {/* ── WARD INTELLIGENCE ─────────────────────── */}
        <SectionLabel>Ward Intelligence</SectionLabel>

        {cityStats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>

            {/* Most frustrated */}
            {cityStats.mostFrustrated && (
              <WardStatRow
                icon="🔥"
                label="Most stressed"
                ward={cityStats.mostFrustrated.wardName}
                metric={`Score ${((cityStats.mostFrustrated.frustrationScore ?? 0) * 100).toFixed(0)}`}
                metricColor={scoreToColor(cityStats.mostFrustrated.frustrationScore ?? 0)}
                sub={cityStats.mostFrustrated.topIssue}
              />
            )}

            {/* Sudden spike */}
            {cityStats.suddenSpike && (
              <WardStatRow
                icon="↑"
                label="Sudden spike"
                ward={cityStats.suddenSpike.wardName}
                metric={`+${cityStats.suddenSpike.changePercent}%`}
                metricColor="#f97316"
                sub={`${cityStats.suddenSpike.currentTotal} complaints`}
              />
            )}

            {/* Fastest resolution */}
            {cityStats.fastestResolution && (
              <WardStatRow
                icon="✓"
                label="Fastest resolved"
                ward={cityStats.fastestResolution.wardName}
                metric={`${cityStats.fastestResolution.resolutionRatePercent?.toFixed(0)}%`}
                metricColor="#22c55e"
                sub="resolved"
              />
            )}

            {/* Most improved */}
            {cityStats.mostImproved && (
              <WardStatRow
                icon="↓"
                label="Most improved"
                ward={cityStats.mostImproved.wardName}
                metric={`${Math.abs(cityStats.mostImproved.changePercent ?? 0)}% less`}
                metricColor="#22c55e"
                sub={`${cityStats.mostImproved.currentTotal} complaints now`}
              />
            )}
          </div>
        ) : (
          <SkeletonRows />
        )}

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

interface WardStatRowProps {
  icon: string;
  label: string;
  ward: string;
  metric: string;
  metricColor: string;
  sub?: string;
}

function WardStatRow({ icon, label, ward, metric, metricColor, sub }: WardStatRowProps) {
  return (
    <div style={{
      padding: '8px',
      borderRadius: '7px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(148,163,184,0.06)',
      marginBottom: '4px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '2px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px', opacity: 0.6 }}>{icon}</span>
          <span style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: metricColor }}>
          {metric}
        </span>
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', paddingLeft: '16px' }}>
        {ward}
      </div>
      {sub && (
        <div style={{ fontSize: '10px', color: '#475569', paddingLeft: '16px', marginTop: '1px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {[60, 80, 70, 65].map((w, i) => (
        <div key={i} style={{
          height: '52px', borderRadius: '7px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(148,163,184,0.06)',
        }} />
      ))}
    </div>
  );
}
