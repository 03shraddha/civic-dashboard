import { useEffect } from 'react';
import { useStore } from '../store';
import { GEOJSON_URL } from '../constants/api';
import { computeCentroids } from '../utils/centroidCalculator';
import { sessionGet, sessionSet } from '../utils/cache';
import type { FeatureCollection } from 'geojson';

const CACHE_KEY = 'ward_boundaries_geojson';

export function useWardBoundaries() {
  const { setWardBoundaries, setCentroids } = useStore();

  useEffect(() => {
    async function load() {
      // Try session cache first
      const cached = sessionGet<FeatureCollection>(CACHE_KEY);
      if (cached) {
        setWardBoundaries(cached);
        setCentroids(computeCentroids(cached));
        return;
      }

      try {
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
        const geo: FeatureCollection = await res.json();
        sessionSet(CACHE_KEY, geo);
        setWardBoundaries(geo);
        setCentroids(computeCentroids(geo));
      } catch (err) {
        console.error('[useWardBoundaries] Failed to load GeoJSON:', err);
      }
    }
    load();
  }, [setWardBoundaries, setCentroids]);
}
