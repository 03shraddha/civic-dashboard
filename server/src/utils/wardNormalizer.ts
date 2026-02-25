/**
 * Normalizes BBMP ward names from different data sources to a canonical form.
 * Uses a multi-step matching strategy:
 *   1. Exact match after normalization
 *   2. Prefix / contains match
 *   3. Levenshtein similarity ≥ 0.85
 */

const _unmappedLog = new Set<string>();

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bward\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

export class WardNormalizer {
  private canonicalNames: string[];
  private normalizedToCanonical: Map<string, string>;
  private manualMap: Record<string, string>;

  constructor(canonicalNames: string[], manualMap: Record<string, string> = {}) {
    this.canonicalNames = canonicalNames;
    this.manualMap = manualMap;
    this.normalizedToCanonical = new Map(
      canonicalNames.map(n => [normalize(n), n])
    );
  }

  resolve(rawName: string): string | null {
    if (!rawName) return null;

    // Check manual map first
    if (this.manualMap[rawName]) return this.manualMap[rawName];

    const norm = normalize(rawName);

    // 1. Exact normalized match
    const exact = this.normalizedToCanonical.get(norm);
    if (exact) return exact;

    // 2. Prefix / contains match (unambiguous)
    const prefixMatches = this.canonicalNames.filter(c => {
      const cn = normalize(c);
      return cn.startsWith(norm) || norm.startsWith(cn) || cn.includes(norm) || norm.includes(cn);
    });
    if (prefixMatches.length === 1) return prefixMatches[0];

    // 3. Levenshtein similarity
    let best: string | null = null;
    let bestScore = 0;
    for (const c of this.canonicalNames) {
      const s = similarity(norm, normalize(c));
      if (s > bestScore) {
        bestScore = s;
        best = c;
      }
    }
    if (bestScore >= 0.85 && best) return best;

    // Unmapped
    if (!_unmappedLog.has(rawName)) {
      _unmappedLog.add(rawName);
      console.warn(`[WardNormalizer] Unmapped ward: "${rawName}" (best match "${best}" @ ${(bestScore * 100).toFixed(1)}%)`);
    }
    return null;
  }

  getUnmapped(): string[] {
    return Array.from(_unmappedLog);
  }
}
