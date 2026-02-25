import { WardStats } from './ward';

export interface WardStatsResponse {
  updatedAt: string;
  totalComplaints: number;
  timeWindow: string;
  category: string | null;
  wards: WardStats[];
}

export interface CityStatsWard {
  wardName: string;
  wardNo: number;
  frustrationScore?: number;
  topIssue?: string;
  totalComplaints?: number;
  resolutionRatePercent?: number;
  changePercent?: number;
  currentTotal?: number;
  previousTotal?: number;
}

export interface CityStatsResponse {
  updatedAt: string;
  timeWindow: string;
  mostFrustrated: CityStatsWard;
  fastestResolution: CityStatsWard | null;
  suddenSpike: CityStatsWard | null;
  mostImproved: CityStatsWard | null;
  cityAvgResolutionRate: number;
}
