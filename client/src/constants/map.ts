import { LatLngBoundsLiteral, LatLngTuple } from 'leaflet';

export const BENGALURU_CENTER: LatLngTuple = [12.9716, 77.5946];
export const BENGALURU_DEFAULT_ZOOM = 11;
export const BENGALURU_BOUNDS: LatLngBoundsLiteral = [
  [12.7342, 77.3791], // SW
  [13.1732, 77.8484], // NE
];

// light_nolabels: clean white base, no competing street labels
export const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
