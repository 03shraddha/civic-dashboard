import { useState } from 'react';
import { useStore } from '../../store';
import { TIME_FILTERS, TimeFilter } from '../../constants/scoring';
import { CATEGORIES } from '../../constants/categories';
import { scoreToColor, LEGEND_STOPS } from '../../utils/colorScale';
import { NeighborhoodSelector } from '../controls/NeighborhoodSelector';

const TIME_LABELS: Record<TimeFilter, string> = {
  live: 'Live', '24h': '24h', '7d': '7d', '30d': '30d', seasonal: 'Season',
};

const VISIBLE_CATS = [
  'Solid Waste (Garbage) Related',
  'Electrical',
];
const MORE_CATS = [
  'Road Maintenance(Engg)',
  'Revenue Department',
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
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* ── BLOCK 1: Summary ─────────────────── */}
      <div style={{ padding: '20px 16px 16px' }}>

        {/* KPI */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            fontSize: '28px', fontWeight: 700, color: '#0f172a',
            lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            {isLoadingWards ? '—' : totalComplaints.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            complaints · {timeFilter} window
          </div>
        </div>

        {/* Resolution rate */}
        {cityStats?.cityAvgResolutionRate != null && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              width: '100%', height: '4px',
              background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden',
              marginBottom: '6px',
            }}>
              <div style={{
                height: '100%',
                width: `${cityStats.cityAvgResolutionRate}%`,
                background: cityStats.cityAvgResolutionRate > 70 ? '#16a34a'
                  : cityStats.cityAvgResolutionRate > 40 ? '#f59e0b' : '#ef4444',
                borderRadius: '2px',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>
                {cityStats.cityAvgResolutionRate}%
              </span>
              {' '}city resolution rate
            </div>
          </div>
        )}

        {/* Stress legend */}
        <div>
          <div style={{
            fontSize: '11px', fontWeight: 600, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '6px',
          }}>
            Stress level
          </div>
          <div style={{
            height: '6px', borderRadius: '3px',
            background: `linear-gradient(to right, ${legendGradient})`,
            marginBottom: '5px',
            border: '1px solid #e2e8f0',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <Divider />

      {/* ── BLOCK 2: Filters ─────────────────── */}
      <div style={{ padding: '16px' }}>

        {/* Time window */}
        <Label>Time Window</Label>
        <div style={{
          display: 'flex', gap: '3px',
          background: '#f8fafc',
          borderRadius: '8px', padding: '3px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
        }}>
          {TIME_FILTERS.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              style={{
                flex: 1, padding: '6px 0',
                borderRadius: '5px', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                background: tf === timeFilter ? '#6366f1' : 'transparent',
                color: tf === timeFilter ? '#ffffff' : '#64748b',
                transition: 'background 0.12s ease, color 0.12s ease',
              }}
            >
              {TIME_LABELS[tf]}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <Label>Category</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          <Chip label="All" active={activeCategory === null} onClick={() => setActiveCategory(null)} />
          {VISIBLE_CATS.map(key => {
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
          {showMore && MORE_CATS.map(key => {
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
          <button
            onClick={() => setShowMore(v => !v)}
            style={{
              padding: '5px 10px', borderRadius: '20px',
              border: '1px solid #e2e8f0', background: 'transparent',
              color: '#6366f1', fontSize: '11px', fontWeight: 500,
              cursor: 'pointer', transition: 'color 0.1s, border-color 0.1s',
            }}
          >
            {showMore ? '− Less' : `+ ${MORE_CATS.length} more`}
          </button>
        </div>
      </div>

      <Divider />

      {/* ── BLOCK 3: Neighbourhood ───────────── */}
      <div style={{ padding: '16px' }}>
        <NeighborhoodSelector />
      </div>

      <Divider />

      {/* ── BLOCK 4: Ward Insights ───────────── */}
      <div style={{ padding: '16px', flex: 1 }}>
        <Label>Ward Insights</Label>

        {cityStats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {cityStats.mostFrustrated && (
              <InsightRow
                icon="🔥" label="Most stressed"
                ward={cityStats.mostFrustrated.wardName}
                metric={`${((cityStats.mostFrustrated.frustrationScore ?? 0) * 100).toFixed(0)}/100`}
                metricColor={scoreToColor(cityStats.mostFrustrated.frustrationScore ?? 0)}
                sub={cityStats.mostFrustrated.topIssue}
              />
            )}
            {cityStats.suddenSpike && (
              <InsightRow
                icon="↑" label="Sudden spike"
                ward={cityStats.suddenSpike.wardName}
                metric={`+${cityStats.suddenSpike.changePercent}%`}
                metricColor="#f59e0b"
                sub={`${cityStats.suddenSpike.currentTotal} complaints`}
              />
            )}
            {cityStats.fastestResolution && (
              <InsightRow
                icon="✓" label="Best resolved"
                ward={cityStats.fastestResolution.wardName}
                metric={`${cityStats.fastestResolution.resolutionRatePercent?.toFixed(0)}%`}
                metricColor="#16a34a"
                sub="resolved"
              />
            )}
            {cityStats.mostImproved && (
              <InsightRow
                icon="↓" label="Most improved"
                ward={cityStats.mostImproved.wardName}
                metric={`${Math.abs(cityStats.mostImproved.changePercent ?? 0)}% less`}
                metricColor="#16a34a"
                sub={`${cityStats.mostImproved.currentTotal} complaints`}
              />
            )}
          </div>
        ) : (
          <SkeletonRows />
        )}
      </div>

      {/* ── Pulse toggle ─────────────────────── */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setShowPulses(!showPulses)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <div style={{
            width: '32px', height: '18px', borderRadius: '9px',
            background: showPulses ? '#6366f1' : '#e2e8f0',
            position: 'relative', flexShrink: 0,
            transition: 'background 0.15s ease',
          }}>
            <div style={{
              position: 'absolute', top: '3px',
              left: showPulses ? '15px' : '3px',
              width: '12px', height: '12px', borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 0.15s ease',
            }} />
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Show activity pulses</span>
        </button>
      </div>

    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function Divider() {
  return <div style={{ borderTop: '1px solid #f1f5f9' }} />;
}

function Label({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: 600, color: '#94a3b8',
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
    }}>
      {children}
    </div>
  );
}

interface ChipProps { label: string; icon?: string; active: boolean; onClick: () => void; }

function Chip({ label, icon, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '5px 10px', borderRadius: '20px', border: 'none',
        cursor: 'pointer', fontSize: '12px', fontWeight: active ? 600 : 400,
        background: active ? '#eef2ff' : '#f8fafc',
        color: active ? '#6366f1' : '#64748b',
        outline: active ? '1.5px solid #c7d2fe' : '1.5px solid #e2e8f0',
        outlineOffset: '-1.5px',
        transition: 'background 0.12s, color 0.12s, outline-color 0.12s',
      }}
    >
      {icon && <span style={{ fontSize: '11px' }}>{icon}</span>}
      {label}
    </button>
  );
}

interface InsightRowProps {
  icon: string; label: string; ward: string;
  metric: string; metricColor: string; sub?: string;
}

function InsightRow({ icon, label, ward, metric, metricColor, sub }: InsightRowProps) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: '8px',
      background: '#f8fafc', border: '1px solid #f1f5f9',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px' }}>{icon}</span>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: metricColor }}>{metric}</span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', paddingLeft: '16px' }}>
        {ward}
      </div>
      {sub && (
        <div style={{
          fontSize: '11px', color: '#94a3b8', paddingLeft: '16px', marginTop: '1px',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ height: '62px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }} />
      ))}
    </div>
  );
}
