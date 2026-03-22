// In dev, Vite proxies /api → localhost:3001 so API_BASE is empty.
// In production, set VITE_API_BASE_URL to the Render server URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const ENDPOINTS = {
  wardStats: `${API_BASE}/api/ward-stats`,
  cityStats: `${API_BASE}/api/city-stats`,
  health: `${API_BASE}/health`,
} as const;

export const GEOJSON_URL =
  'https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Bangalore/BBMP.geojson';
