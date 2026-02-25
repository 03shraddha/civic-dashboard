export interface WardRawMetrics {
  wardName: string;
  wardNo: number;
  totalComplaints: number;
  unresolvedComplaints: number;
  reopenedComplaints: number;
  closedComplaints: number;
  potholeComplaints: number;
  streetlightComplaints: number;
  areaKm2: number;
  categoryBreakdown: Record<string, number>;
  dominantCategory: string;
  resolutionRatePercent: number;
  recentComplaints: Array<{
    id: string;
    category: string;
    subCategory: string;
    date: string;
    status: string;
  }>;
  trend: 'rising' | 'falling' | 'stable';
  previousPeriodTotal: number;
}

export interface WardStats extends WardRawMetrics {
  frustrationScore: number;
}

function percentile99(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.99);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function minMaxNormalize(values: number[], clip99: boolean = true): number[] {
  if (values.length === 0) return [];
  const cap = clip99 ? percentile99(values) : Math.max(...values);
  const clipped = values.map(v => Math.min(v, cap));
  const min = Math.min(...clipped);
  const max = Math.max(...clipped);
  if (max === min) return values.map(() => 0);
  return clipped.map(v => (v - min) / (max - min));
}

export function computeFrustrationScores(wards: WardRawMetrics[]): WardStats[] {
  if (wards.length === 0) return [];

  const MIN_AREA = 0.5; // km² floor to avoid division by zero

  // Extract raw metric arrays
  const complaintsPerKm2 = wards.map(w => w.totalComplaints / Math.max(w.areaKm2, MIN_AREA));
  const unresolvedRatio = wards.map(w =>
    w.totalComplaints > 0 ? w.unresolvedComplaints / w.totalComplaints : 0
  );
  const potholesPerKm2 = wards.map(w => w.potholeComplaints / Math.max(w.areaKm2, MIN_AREA));
  const streetlightPerKm2 = wards.map(w => w.streetlightComplaints / Math.max(w.areaKm2, MIN_AREA));

  // Normalize each component (clip at 99th percentile to reduce outlier impact)
  const normDensity = minMaxNormalize(complaintsPerKm2, true);
  const normUnresolved = minMaxNormalize(unresolvedRatio, false);
  const normPotholes = minMaxNormalize(potholesPerKm2, true);
  const normStreetlight = minMaxNormalize(streetlightPerKm2, true);

  return wards.map((w, i) => {
    const score =
      normDensity[i] * 0.40 +
      normUnresolved[i] * 0.30 +
      normPotholes[i] * 0.20 +
      normStreetlight[i] * 0.10;

    return {
      ...w,
      frustrationScore: Math.round(score * 1000) / 1000,
    };
  });
}
