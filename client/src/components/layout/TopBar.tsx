import { ComplaintCounter } from '../controls/ComplaintCounter';
import { TimeSlider } from '../controls/TimeSlider';
import { FilterDropdown } from '../controls/FilterDropdown';
import { NeighborhoodSelector } from '../controls/NeighborhoodSelector';
import { useStore } from '../../store';

export function TopBar() {
  const { isLoadingWards, wardError } = useStore();

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 1000,
      background: 'rgba(2,6,23,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(148,163,184,0.15)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    }}>
      {/* Logo + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1, #e85d04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
        }}>📡</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#f1f5f9', lineHeight: 1.2 }}>
            Civic Pulse
          </div>
          <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.2 }}>
            Bengaluru BBMP
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '36px', background: 'rgba(148,163,184,0.15)', flexShrink: 0 }} />

      {/* Complaint counter */}
      <ComplaintCounter />

      {/* Loading indicator */}
      {isLoadingWards && (
        <div style={{
          width: '16px', height: '16px', borderRadius: '50%',
          border: '2px solid #6366f1', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
          flexShrink: 0,
        }} />
      )}

      {/* Error */}
      {wardError && (
        <div style={{ color: '#f97316', fontSize: '12px', maxWidth: '200px' }}>
          ⚠ {wardError}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Controls */}
      <TimeSlider />
      <FilterDropdown />
      <NeighborhoodSelector />
    </div>
  );
}
