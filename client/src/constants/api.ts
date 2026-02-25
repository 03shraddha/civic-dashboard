// Backend base URL — in development, Vite proxies /api to localhost:3001
export const API_BASE = '';

export const ENDPOINTS = {
  wardStats: '/api/ward-stats',
  cityStats: '/api/city-stats',
  health: '/health',
} as const;

export const GEOJSON_URL =
  'https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Bangalore/BBMP.geojson';
