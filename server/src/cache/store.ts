import { WardStats } from '../utils/frustrationScore';

interface CacheEntry<T> {
  data: T;
  updatedAt: Date;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function setCacheEntry<T>(key: string, data: T): void {
  cache.set(key, { data, updatedAt: new Date() });
}

export function getCacheEntry<T>(key: string): CacheEntry<T> | undefined {
  return cache.get(key) as CacheEntry<T> | undefined;
}

export function hasCacheEntry(key: string): boolean {
  return cache.has(key);
}

export function clearCache(): void {
  cache.clear();
}

// Typed helpers for ward stats
export function setWardStats(timeWindow: string, stats: WardStats[]): void {
  setCacheEntry(`ward-stats:${timeWindow}`, stats);
}

export function getWardStats(timeWindow: string): { data: WardStats[]; updatedAt: Date } | null {
  const entry = getCacheEntry<WardStats[]>(`ward-stats:${timeWindow}`);
  if (!entry) return null;
  return entry as { data: WardStats[]; updatedAt: Date };
}

export function getAllCachedWindows(): string[] {
  return Array.from(cache.keys())
    .filter(k => k.startsWith('ward-stats:'))
    .map(k => k.replace('ward-stats:', ''));
}
