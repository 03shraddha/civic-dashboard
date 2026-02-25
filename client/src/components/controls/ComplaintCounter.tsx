import { useStore } from '../../store';
import { useEffect, useRef, useState } from 'react';

function animateCounter(from: number, to: number, duration: number, onUpdate: (v: number) => void) {
  const start = performance.now();
  function step(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(from + (to - from) * progress);
    onUpdate(value);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function ComplaintCounter() {
  const { totalComplaints, isLoadingWards, updatedAt } = useStore();
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (totalComplaints !== prevRef.current) {
      animateCounter(prevRef.current, totalComplaints, 600, setDisplayed);
      prevRef.current = totalComplaints;
    }
  }, [totalComplaints]);

  const timeAgo = updatedAt
    ? (() => {
        const diff = Date.now() - new Date(updatedAt).getTime();
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        return `${Math.floor(diff / 3600000)}h ago`;
      })()
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
          {isLoadingWards ? '—' : displayed.toLocaleString()}
        </span>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>complaints</span>
      </div>
      {timeAgo && (
        <span style={{ fontSize: '10px', color: '#475569' }}>Updated {timeAgo}</span>
      )}
    </div>
  );
}
