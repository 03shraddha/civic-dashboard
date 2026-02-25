import { useEffect } from 'react';
import { useStore } from '../store';
import { ENDPOINTS } from '../constants/api';
import { CityStatsResponse } from '../types/api';

export function useCityStats() {
  const { timeFilter, setCityStats, setIsLoadingCity } = useStore();

  useEffect(() => {
    let cancelled = false;

    async function fetchCity() {
      setIsLoadingCity(true);
      try {
        const res = await fetch(`${ENDPOINTS.cityStats}?time=${timeFilter}`);
        if (!res.ok) return;
        const data: CityStatsResponse = await res.json();
        if (!cancelled) setCityStats(data);
      } catch (err) {
        console.error('[useCityStats] Error:', err);
      } finally {
        if (!cancelled) setIsLoadingCity(false);
      }
    }

    fetchCity();
    return () => { cancelled = true; };
  }, [timeFilter, setCityStats, setIsLoadingCity]);
}
