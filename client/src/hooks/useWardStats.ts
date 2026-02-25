import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { ENDPOINTS } from '../constants/api';
import { WardStatsResponse } from '../types/api';

const POLL_INTERVAL_MS = 8000; // retry every 8s while warming up

export function useWardStats() {
  const {
    timeFilter,
    activeCategory,
    setWardStats,
    setIsLoadingWards,
    setWardError,
  } = useStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function clearTimer() {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    }

    async function fetchStats() {
      if (cancelled) return;
      setIsLoadingWards(true);
      setWardError(null);

      const params = new URLSearchParams({ time: timeFilter });
      if (activeCategory) params.set('category', activeCategory);

      try {
        const res = await fetch(`${ENDPOINTS.wardStats}?${params}`);

        // 202 = server is still warming up → poll again
        if (res.status === 202) {
          if (!cancelled) {
            timerRef.current = setTimeout(fetchStats, POLL_INTERVAL_MS);
          }
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
        }

        const data: WardStatsResponse = await res.json();
        if (!cancelled) {
          setWardStats(data.wards, data.totalComplaints, data.updatedAt);
          setIsLoadingWards(false);
        }
      } catch (err) {
        if (!cancelled) {
          setWardError(err instanceof Error ? err.message : 'Unknown error');
          setIsLoadingWards(false);
          console.error('[useWardStats] Error:', err);
        }
      }
    }

    clearTimer();
    fetchStats();

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [timeFilter, activeCategory, setWardStats, setIsLoadingWards, setWardError]);
}
