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
      height: '44px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px 0 0',
      background: '#020617',
      borderBottom: '1px solid rgba(148,163,184,0.08)',
      zIndex: 100,
    }}>
      {/* Logo + title — left-aligned, lives above sidebar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '260px',
        padding: '0 16px',
        borderRight: '1px solid rgba(148,163,184,0.08)',
        height: '100%',
      }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: '6px',
          background: 'linear-gradient(135deg, #6366f1, #e85d04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', flexShrink: 0,
        }}>
          📡
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
            Civic Pulse
          </div>
          <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.4 }}>
            Bengaluru · BBMP
          </div>
        </div>
      </div>

      {/* Status right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isLoadingWards && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              border: '1.5px solid #6366f1', borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '11px', color: '#475569' }}>Updating…</span>
          </div>
        )}
        {timeAgo && !isLoadingWards && (
          <span style={{ fontSize: '11px', color: '#334155' }}>
            Data as of Jun 2025 · refreshed {timeAgo}
          </span>
        )}
      </div>
    </div>
  );
}
