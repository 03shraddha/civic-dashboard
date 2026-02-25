import { useEffect } from 'react';
import { useStore } from '../store';
import { GEOJSON_URL } from '../constants/api';
import { computeCentroids } from '../utils/centroidCalculator';
import { sessionGet, sessionSet } from '../utils/cache';
import type { FeatureCollection } from 'geojson';
import type { WardCentroid } from '../types/ward';

const CACHE_KEY = 'ward_boundaries_geojson';

interface ConstituencyCentre { lat: number; lng: number; }

function squaredDist(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dlat = lat1 - lat2;
  const dlng = (lng1 - lng2) * Math.cos(lat1 * Math.PI / 180);
  return dlat * dlat + dlng * dlng;
}

function buildConstituencyWardMap(
  centroids: WardCentroid[],
  centres: Record<string, ConstituencyCentre>
): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const name of Object.keys(centres)) result.set(name, []);

  const constituencyNames = Object.keys(centres);

  for (const centroid of centroids) {
    let bestName = constituencyNames[0];
    let bestDist = Infinity;
    for (const name of constituencyNames) {
      const c = centres[name];
      const d = squaredDist(centroid.lat, centroid.lng, c.lat, c.lng);
      if (d < bestDist) { bestDist = d; bestName = name; }
    }
    result.get(bestName)!.push(centroid.wardName);
  }

  return result;
}

export function useWardBoundaries() {
  const { setWardBoundaries, setCentroids, setConstituencyWardMap } = useStore();

  useEffect(() => {
    async function load() {
      // Try session cache first
      const cached = sessionGet<FeatureCollection>(CACHE_KEY);
      if (cached) {
        setWardBoundaries(cached);
        const centroids = computeCentroids(cached);
        setCentroids(centroids);
        await assignConstituencies(centroids);
        return;
      }

      try {
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
        const geo: FeatureCollection = await res.json();
        sessionSet(CACHE_KEY, geo);
        setWardBoundaries(geo);
        const centroids = computeCentroids(geo);
        setCentroids(centroids);
        await assignConstituencies(centroids);
      } catch (err) {
        console.error('[useWardBoundaries] Failed to load GeoJSON:', err);
      }
    }

    async function assignConstituencies(centroids: WardCentroid[]) {
      try {
        const res = await fetch('/constituency_centres.json');
        if (!res.ok) return;
        const centres: Record<string, ConstituencyCentre> = await res.json();
        const map = buildConstituencyWardMap(centroids, centres);
        setConstituencyWardMap(map);
      } catch (err) {
        console.error('[useWardBoundaries] Failed to load constituency centres:', err);
      }
    }

    load();
  }, [setWardBoundaries, setCentroids, setConstituencyWardMap]);
}
