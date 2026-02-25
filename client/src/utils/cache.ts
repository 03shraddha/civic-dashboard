const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export function sessionGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const item: CacheItem<T> = JSON.parse(raw);
    if (Date.now() > item.expiresAt) {
      sessionStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch {
    return null;
  }
}

export function sessionSet<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  try {
    const item: CacheItem<T> = { data, expiresAt: Date.now() + ttlMs };
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch {
    // sessionStorage quota exceeded — ignore
  }
}
