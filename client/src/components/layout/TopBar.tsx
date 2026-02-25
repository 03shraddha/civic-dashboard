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
      height: '60px',
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
        display: 'flex', alignItems: 'center', gap: '12px',
        width: '240px', padding: '0 16px',
        borderRight: '1px solid #e2e8f0', height: '100%',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
        }}>
          🗺️
        </div>
        <div>
          <div style={{
            fontSize: '15px', fontWeight: 800, color: '#0f172a',
            lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            Grievance Map
          </div>
          <div style={{
            fontSize: '10.5px', color: '#64748b', lineHeight: 1.4,
            fontWeight: 500, marginTop: '1px',
          }}>
            BBMP complaints · Bengaluru
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
