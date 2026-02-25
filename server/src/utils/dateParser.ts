/**
 * Parse CKAN nanosecond timestamps like "2024-12-31 05:52:00.000000000"
 * Returns a Date object (millisecond precision).
 */
export function parseNanoTimestamp(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/(\.\d{3})\d*$/, '$1').replace(' ', 'T') + 'Z';
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Find the most recent date in a set of parsed records.
 * Used to compute time windows relative to the data (not today's date),
 * which matters when the CKAN dataset is historical and not live-updated.
 */
export function findDatasetMaxDate(dates: Date[]): Date {
  if (dates.length === 0) return new Date();
  let max = dates[0].getTime();
  for (let i = 1; i < dates.length; i++) {
    const t = dates[i].getTime();
    if (t > max) max = t;
  }
  return new Date(max);
}

/**
 * Returns the start Date for a given time window, anchored to `anchor`
 * (defaults to now, but pass the dataset's max date for historical data).
 */
export function getWindowStart(window: string, anchor: Date = new Date()): Date {
  switch (window) {
    case '24h':
    case 'live':
      return new Date(anchor.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(anchor.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(anchor.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'seasonal': {
      const month = anchor.getMonth();
      if (month >= 2 && month <= 4) return new Date(anchor.getFullYear(), 2, 1);   // Summer Mar–May
      if (month >= 5 && month <= 9) return new Date(anchor.getFullYear(), 5, 1);   // Monsoon Jun–Oct
      if (month >= 10 && month <= 11) return new Date(anchor.getFullYear(), 10, 1); // Post-monsoon
      return new Date(anchor.getFullYear(), 0, 1);                                   // Winter Jan–Feb
    }
    default:
      return new Date(anchor.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}
