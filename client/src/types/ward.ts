export interface WardStats {
  wardName: string;
  wardNo: number;
  totalComplaints: number;
  unresolvedComplaints: number;
  reopenedComplaints: number;
  closedComplaints: number;
  potholeComplaints: number;
  streetlightComplaints: number;
  areaKm2: number;
  dominantCategory: string;
  categoryBreakdown: Record<string, number>;
  resolutionRatePercent: number;
  recentComplaints: RecentComplaint[];
  frustrationScore: number;
  trend: 'rising' | 'falling' | 'stable';
  previousPeriodTotal: number;
}

export interface RecentComplaint {
  id: string;
  category: string;
  subCategory: string;
  date: string;
  status: string;
}

export interface WardCentroid {
  wardName: string;
  wardNo: number;
  lat: number;
  lng: number;
}
