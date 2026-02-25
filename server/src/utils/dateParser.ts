/**
 * Parse CKAN nanosecond timestamps like "2024-12-31 05:52:00.000000000"
 * Returns a Date object (millisecond precision).
 */
export function parseNanoTimestamp(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  // Strip trailing fractional seconds beyond milliseconds, then parse
  // "2024-12-31 05:52:00.000000000" → "2024-12-31T05:52:00.000Z"
  const trimmed = raw.trim().replace(/(\.\d{3})\d*$/, '$1').replace(' ', 'T') + 'Z';
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns the start Date for a given time window from now.
 */
export function getWindowStart(window: string): Date {
  const now = new Date();
  switch (window) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'seasonal': {
      // Current meteorological season for Bengaluru
      const month = now.getMonth(); // 0-indexed
      if (month >= 2 && month <= 4) {
        // Summer: Mar–May
        return new Date(now.getFullYear(), 2, 1);
      } else if (month >= 5 && month <= 9) {
        // Monsoon: Jun–Oct
        return new Date(now.getFullYear(), 5, 1);
      } else if (month >= 10 && month <= 11) {
        // Post-monsoon: Nov–Dec
        return new Date(now.getFullYear(), 10, 1);
      } else {
        // Winter: Jan–Feb
        return new Date(now.getFullYear(), 0, 1);
      }
    }
    case 'live':
    default:
      // Live: last 24 hours (same as 24h for aggregation purposes)
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}
