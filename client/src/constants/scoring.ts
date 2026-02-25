export const SCORE_WEIGHTS = {
  complaintDensity: 0.40,
  unresolvedRatio: 0.30,
  potholeDensity: 0.20,
  streetlightFaults: 0.10,
} as const;

export const PULSE_THRESHOLD = 0.2; // Minimum score to show pulse
export const TIME_FILTERS = ['live', '24h', '7d', '30d', 'seasonal'] as const;
export type TimeFilter = typeof TIME_FILTERS[number];
