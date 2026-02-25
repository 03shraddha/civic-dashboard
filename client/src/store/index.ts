import { create } from 'zustand';
import { WardStats, WardCentroid } from '../types/ward';
import { CityStatsResponse } from '../types/api';
import { TimeFilter } from '../constants/scoring';
import type { FeatureCollection } from 'geojson';

interface Store {
  // Filters
  activeCategory: string | null;
  timeFilter: TimeFilter;
  activeConstituency: string | null;

  // Data
  wardStats: Map<string, WardStats>;
  wardBoundaries: FeatureCollection | null;
  centroids: WardCentroid[];
  cityStats: CityStatsResponse | null;
  totalComplaints: number;
  updatedAt: string | null;

  // Loading / error state
  isLoadingWards: boolean;
  isLoadingCity: boolean;
  wardError: string | null;

  // UI
  hoveredWardName: string | null;
  showPulses: boolean;

  // Actions
  setActiveCategory: (cat: string | null) => void;
  setTimeFilter: (time: TimeFilter) => void;
  setActiveConstituency: (con: string | null) => void;
  setWardStats: (wards: WardStats[], total: number, updatedAt: string) => void;
  setWardBoundaries: (geo: FeatureCollection) => void;
  setCentroids: (centroids: WardCentroid[]) => void;
  setCityStats: (stats: CityStatsResponse) => void;
  setIsLoadingWards: (loading: boolean) => void;
  setIsLoadingCity: (loading: boolean) => void;
  setWardError: (err: string | null) => void;
  setHoveredWardName: (name: string | null) => void;
  setShowPulses: (show: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  activeCategory: null,
  timeFilter: '7d',
  activeConstituency: null,

  wardStats: new Map(),
  wardBoundaries: null,
  centroids: [],
  cityStats: null,
  totalComplaints: 0,
  updatedAt: null,

  isLoadingWards: false,
  isLoadingCity: false,
  wardError: null,

  hoveredWardName: null,
  showPulses: true,

  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setTimeFilter: (time) => set({ timeFilter: time }),
  setActiveConstituency: (con) => set({ activeConstituency: con }),

  setWardStats: (wards, total, updatedAt) => {
    const map = new Map<string, WardStats>();
    for (const w of wards) map.set(w.wardName, w);
    set({ wardStats: map, totalComplaints: total, updatedAt });
  },

  setWardBoundaries: (geo) => set({ wardBoundaries: geo }),
  setCentroids: (centroids) => set({ centroids }),
  setCityStats: (stats) => set({ cityStats: stats }),
  setIsLoadingWards: (loading) => set({ isLoadingWards: loading }),
  setIsLoadingCity: (loading) => set({ isLoadingCity: loading }),
  setWardError: (err) => set({ wardError: err }),
  setHoveredWardName: (name) => set({ hoveredWardName: name }),
  setShowPulses: (show) => set({ showPulses: show }),
}));
