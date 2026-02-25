import { useEffect } from 'react';
import { useStore } from '../store';
import { ENDPOINTS } from '../constants/api';
import { WardStatsResponse } from '../types/api';

export function useWardStats() {
  const {
    timeFilter,
    activeCategory,
    setWardStats,
    setIsLoadingWards,
    setWardError,
  } = useStore();

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setIsLoadingWards(true);
      setWardError(null);

      const params = new URLSearchParams({ time: timeFilter });
      if (activeCategory) params.set('category', activeCategory);

      try {
        const res = await fetch(`${ENDPOINTS.wardStats}?${params}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
        }
        const data: WardStatsResponse = await res.json();
        if (!cancelled) {
          setWardStats(data.wards, data.totalComplaints, data.updatedAt);
        }
      } catch (err) {
        if (!cancelled) {
          setWardError(err instanceof Error ? err.message : 'Unknown error');
          console.error('[useWardStats] Error:', err);
        }
      } finally {
        if (!cancelled) setIsLoadingWards(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [timeFilter, activeCategory, setWardStats, setIsLoadingWards, setWardError]);
}
