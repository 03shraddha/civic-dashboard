import { useState } from 'react';
import { useStore } from '../../store';
import { TIME_FILTERS, TimeFilter } from '../../constants/scoring';
import { CATEGORIES } from '../../constants/categories';
import { scoreToColor, LEGEND_STOPS } from '../../utils/colorScale';

const TIME_LABELS: Record<TimeFilter, string> = {
  live: 'Live', '24h': '24h', '7d': '7d', '30d': '30d', seasonal: 'Season',
};

// Primary chips always visible; secondary chips collapse under "More"
const PRIMARY_CATS = [
  'Solid Waste (Garbage) Related',
  'Electrical',
  'Road Maintenance(Engg)',
  'Revenue Department',
];
const SECONDARY_CATS = [
  'Forest',
  'Lakes',
  'E khata / Khata services',
];

export function Sidebar() {
  const {
    totalComplaints, timeFilter, setTimeFilter,
    activeCategory, setActiveCategory,
    cityStats, isLoadingWards,
    showPulses, setShowPulses,
  } = useStore();

  const [showMore, setShowMore] = useState(false);

  const legendGradient = LEGEND_STOPS.map(s => `${s.color} ${s.score * 100}%`).join(', ');

  return (
    <div style={{
      width: '240px',
      flexShrink: 0,
      height: '100%',
      background: '#080d18',
      borderRight: '1px solid rgba(148,163,184,0.07)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* ── BLOCK 1: Summary ───────────────────── */}
      <div style={{ padding: '20px 16px 16px' }}>

        {/* KPI */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '28px', fontWeight: 800, color: '#f1f5f9',
            lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            {isLoadingWards ? '—' : totalComplaints.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px', fontWeight: 400 }}>
            complaints · {timeFilter} window
          </div>
        </div>

        {/* Resolution rate bar */}
        {cityStats?.cityAvgResolutionRate != null && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              width: '100%', height: '3px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '2px', overflow: 'hidden',
              marginBottom: '5px',
            }}>
              <div style={{
                height: '100%',
                width: `${cityStats.cityAvgResolutionRate}%`,
                background: cityStats.cityAvgResolutionRate > 70 ? '#22c55e'
                  : cityStats.cityAvgResolutionRate > 40 ? '#f59e0b' : '#ef4444',
                borderRadius: '2px',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 400 }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>
                {cityStats.cityAvgResolutionRate}%
              </span>
              {' '}city resolution rate
            </div>
          </div>
        )}

        {/* Inline legend */}
        <div>
          <div style={{
            fontSize: '9px', fontWeight: 600, color: '#334155',
            textTransform: 'uppercase', letterSpacing: '0.09em',
            marginBottom: '5px',
          }}>
            Stress level
          </div>
          <div style={{
            height: '5px', borderRadius: '3px',
            background: `linear-gradient(to right, ${legendGradient})`,
            marginBottom: '4px',
          }} />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '9px', color: '#334155',
          }}>
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <BlockDivider />

      {/* ── BLOCK 2: Filters ───────────────────── */}
      <div style={{ padding: '14px 16px' }}>

        {/* Time window */}
        <SectionLabel>Time</SectionLabel>
        <div style={{
          display: 'flex', gap: '3px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '8px', padding: '3px',
          marginBottom: '16px',
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
                color: tf === timeFilter ? '#fff' : '#475569',
                transition: 'background 0.12s ease, color 0.12s ease',
              }}
            >
              {TIME_LABELS[tf]}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <SectionLabel>Category</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>

          {/* All chip */}
          <Chip
            label="All"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />

          {/* Primary category chips */}
          {PRIMARY_CATS.map(key => {
            const meta = CATEGORIES[key];
            if (!meta) return null;
            return (
              <Chip
                key={key}
                label={meta.label}
                icon={meta.icon}
                active={activeCategory === key}
                onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              />
            );
          })}

          {/* Secondary chips — expand on demand */}
          {showMore && SECONDARY_CATS.map(key => {
            const meta = CATEGORIES[key];
            if (!meta) return null;
            return (
              <Chip
                key={key}
                label={meta.label}
                icon={meta.icon}
                active={activeCategory === key}
                onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              />
            );
          })}

          {/* More / Less toggle */}
          <button
            onClick={() => setShowMore(v => !v)}
            style={{
              padding: '4px 8px',
              borderRadius: '20px',
              border: '1px solid rgba(148,163,184,0.12)',
              background: 'transparent',
              color: '#475569',
              fontSize: '10px', fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.1s ease',
            }}
          >
            {showMore ? '− Less' : `+ ${SECONDARY_CATS.length} more`}
          </button>
        </div>
      </div>

      <BlockDivider />

      {/* ── BLOCK 3: Ward Intelligence ─────────── */}
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <SectionLabel>Ward Insights</SectionLabel>

        {cityStats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {cityStats.mostFrustrated && (
              <InsightRow
                icon="🔥"
                label="Most stressed"
                ward={cityStats.mostFrustrated.wardName}
                metric={`${((cityStats.mostFrustrated.frustrationScore ?? 0) * 100).toFixed(0)}`}
                metricColor={scoreToColor(cityStats.mostFrustrated.frustrationScore ?? 0)}
                metricSuffix="/100"
                sub={cityStats.mostFrustrated.topIssue}
              />
            )}
            {cityStats.suddenSpike && (
              <InsightRow
                icon="↑"
                label="Sudden spike"
                ward={cityStats.suddenSpike.wardName}
                metric={`+${cityStats.suddenSpike.changePercent}%`}
                metricColor="#f59e0b"
                sub={`${cityStats.suddenSpike.currentTotal} complaints`}
              />
            )}
            {cityStats.fastestResolution && (
              <InsightRow
                icon="✓"
                label="Best resolved"
                ward={cityStats.fastestResolution.wardName}
                metric={`${cityStats.fastestResolution.resolutionRatePercent?.toFixed(0)}%`}
                metricColor="#22c55e"
                sub="resolved"
              />
            )}
            {cityStats.mostImproved && (
              <InsightRow
                icon="↓"
                label="Most improved"
                ward={cityStats.mostImproved.wardName}
                metric={`${Math.abs(cityStats.mostImproved.changePercent ?? 0)}% less`}
                metricColor="#22c55e"
                sub={`${cityStats.mostImproved.currentTotal} complaints`}
              />
            )}
          </div>
        ) : (
          <SkeletonRows />
        )}
      </div>

      {/* ── Pulse toggle (bottom) ─────────────── */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(148,163,184,0.07)',
      }}>
        <button
          onClick={() => setShowPulses(!showPulses)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, width: '100%',
          }}
        >
          {/* Toggle pill */}
          <div style={{
            width: '28px', height: '16px', borderRadius: '8px',
            background: showPulses ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${showPulses ? 'rgba(99,102,241,0.6)' : 'rgba(148,163,184,0.15)'}`,
            position: 'relative', flexShrink: 0,
            transition: 'background 0.15s ease, border-color 0.15s ease',
          }}>
            <div style={{
              position: 'absolute',
              top: '2px',
              left: showPulses ? '13px' : '2px',
              width: '10px', height: '10px', borderRadius: '50%',
              background: showPulses ? '#818cf8' : '#475569',
              transition: 'left 0.15s ease, background 0.15s ease',
            }} />
          </div>
          <span style={{ fontSize: '11px', color: '#475569', fontWeight: 400 }}>
            Show activity pulses
          </span>
        </button>
      </div>

    </div>
  );
}

// ── Sub-components ─────────────────────────────────────

function BlockDivider() {
  return <div style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }} />;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: '9px', fontWeight: 600, color: '#334155',
      letterSpacing: '0.1em', textTransform: 'uppercase',
      marginBottom: '8px',
    }}>
      {children}
    </div>
  );
}

interface ChipProps {
  label: string;
  icon?: string;
  active: boolean;
  onClick: () => void;
}

function Chip({ label, icon, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 9px',
        borderRadius: '20px', border: 'none', cursor: 'pointer',
        fontSize: '11px', fontWeight: active ? 600 : 400,
        background: active ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
        color: active ? '#a5b4fc' : '#475569',
        outline: active ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(148,163,184,0.1)',
        outlineOffset: '-1px',
        transition: 'background 0.12s ease, color 0.12s ease, outline-color 0.12s ease',
      }}
    >
      {icon && <span style={{ fontSize: '10px', lineHeight: 1 }}>{icon}</span>}
      {label}
    </button>
  );
}

interface InsightRowProps {
  icon: string;
  label: string;
  ward: string;
  metric: string;
  metricColor: string;
  metricSuffix?: string;
  sub?: string;
}

function InsightRow({ icon, label, ward, metric, metricColor, metricSuffix, sub }: InsightRowProps) {
  return (
    <div style={{
      padding: '8px',
      borderRadius: '6px',
      background: 'rgba(255,255,255,0.025)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: '2px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '10px', opacity: 0.5 }}>{icon}</span>
          <span style={{ fontSize: '9px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: metricColor }}>
          {metric}
          {metricSuffix && (
            <span style={{ fontSize: '9px', color: '#334155', marginLeft: '1px' }}>{metricSuffix}</span>
          )}
        </span>
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', paddingLeft: '15px' }}>
        {ward}
      </div>
      {sub && (
        <div style={{
          fontSize: '10px', color: '#334155', paddingLeft: '15px', marginTop: '1px',
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
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          height: '54px', borderRadius: '6px',
          background: 'rgba(255,255,255,0.025)',
        }} />
      ))}
    </div>
  );
}
