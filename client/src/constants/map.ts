import { LatLngBoundsLiteral, LatLngTuple } from 'leaflet';

export const BENGALURU_CENTER: LatLngTuple = [12.9716, 77.5946];
export const BENGALURU_DEFAULT_ZOOM = 11;
export const BENGALURU_BOUNDS: LatLngBoundsLiteral = [
  [12.7342, 77.3791], // SW
  [13.1732, 77.8484], // NE
];

// dark_nolabels removes street name clutter — ward boundaries become the primary visual
export const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
