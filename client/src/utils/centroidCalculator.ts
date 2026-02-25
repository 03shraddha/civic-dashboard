import type { Feature, FeatureCollection, Geometry, Polygon, MultiPolygon, Position } from 'geojson';
import { WardCentroid } from '../types/ward';

/**
 * Compute centroid of a polygon ring using the Shoelace formula.
 * Returns [lat, lng] (note: GeoJSON coords are [lng, lat]).
 */
function ringCentroid(ring: Position[]): [number, number] {
  let cx = 0, cy = 0, area = 0;
  const n = ring.length;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area /= 2;
  if (Math.abs(area) < 1e-10) {
    // Fallback: simple average
    const avgX = ring.reduce((s, p) => s + p[0], 0) / n;
    const avgY = ring.reduce((s, p) => s + p[1], 0) / n;
    return [avgY, avgX]; // [lat, lng]
  }
  cx /= 6 * area;
  cy /= 6 * area;
  return [cy, cx]; // [lat, lng]
}

function polygonCentroid(polygon: Polygon): [number, number] {
  return ringCentroid(polygon.coordinates[0]);
}

function multiPolygonCentroid(mp: MultiPolygon): [number, number] {
  // Use the largest polygon's outer ring
  let bestRing: Position[] = mp.coordinates[0][0];
  let bestLen = 0;
  for (const poly of mp.coordinates) {
    if (poly[0].length > bestLen) {
      bestLen = poly[0].length;
      bestRing = poly[0];
    }
  }
  return ringCentroid(bestRing);
}

function geometryCentroid(geom: Geometry): [number, number] | null {
  if (geom.type === 'Polygon') return polygonCentroid(geom as Polygon);
  if (geom.type === 'MultiPolygon') return multiPolygonCentroid(geom as MultiPolygon);
  return null;
}

export function computeCentroids(geojson: FeatureCollection): WardCentroid[] {
  const centroids: WardCentroid[] = [];

  for (const feature of geojson.features as Feature[]) {
    if (!feature.geometry) continue;
    const props = feature.properties || {};
    const wardName: string = String(props.KGISWardName ?? props.WARD_NAME ?? '');
    const wardNo: number = parseInt(String(props.KGISWardNo ?? props.WARD_NO ?? '0'), 10) || 0;

    const centroid = geometryCentroid(feature.geometry);
    if (!centroid || !wardName) continue;

    centroids.push({ wardName, wardNo: Number(wardNo), lat: centroid[0], lng: centroid[1] });
  }

  return centroids;
}
