import { useStore } from '../../store';

export function TopBar() {
  const { isLoadingWards, updatedAt } = useStore();

  const timeAgo = updatedAt
    ? (() => {
        const diff = Date.now() - new Date(updatedAt).getTime();
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        return `${Math.floor(diff / 3600000)}h ago`;
      })()
    : null;

  return (
    <div style={{
      height: '48px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px 0 0',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      zIndex: 100,
    }}>
      {/* Logo + title */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        width: '240px', padding: '0 16px',
        borderRight: '1px solid #e2e8f0', height: '100%',
      }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '7px',
          background: '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', flexShrink: 0,
        }}>
          📡
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
            Civic Pulse
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3 }}>
            Bengaluru · BBMP
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isLoadingWards && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              border: '2px solid #6366f1', borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '12px', color: '#475569' }}>Updating…</span>
          </div>
        )}
        {timeAgo && !isLoadingWards && (
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Data as of Jun 2025 · refreshed {timeAgo}
          </span>
        )}
      </div>
    </div>
  );
}
