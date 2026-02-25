/**
 * Main aggregation pipeline: fetches data, normalizes ward names,
 * groups by ward, computes frustration scores.
 */
import axios from 'axios';
import { fetchGrievances, fetchPreviousPeriodGrievances, FilteredGrievance } from './grievanceService';
import { fetchPotholeCounts } from './potholeService';
import { WardNormalizer } from '../utils/wardNormalizer';
import { WardRawMetrics, computeFrustrationScores, WardStats } from '../utils/frustrationScore';

const DATAMEET_GEOJSON_URL =
  'https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Bangalore/BBMP.geojson';

const STREETLIGHT_CATEGORIES = new Set(['Electrical']);

interface GeoFeature {
  type: 'Feature';
  properties: {
    KGISWardNo?: number;
    KGISWardName?: string;
    WARD_NO?: number;
    WARD_NAME?: string;
    [key: string]: unknown;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

// Longitude degree to km at Bengaluru latitude (12.97°N)
const LAT_KM = 111.0;
const LNG_KM = 108.2;

/**
 * Compute area of a polygon in km² using the Shoelace formula.
 */
function polygonAreaKm2(ring: number[][]): number {
  let area = 0;
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % n];
    // Convert to km before computing area
    area += (x1 * LNG_KM) * (y2 * LAT_KM) - (x2 * LNG_KM) * (y1 * LAT_KM);
  }
  return Math.abs(area) / 2;
}

function featureAreaKm2(geometry: GeoFeature['geometry']): number {
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates as number[][][];
    return polygonAreaKm2(coords[0]);
  } else {
    // MultiPolygon: sum largest
    const coords = geometry.coordinates as number[][][][];
    return Math.max(...coords.map(poly => polygonAreaKm2(poly[0])));
  }
}

interface WardGeo {
  name: string;
  wardNo: number;
  areaKm2: number;
}

let _geoCache: WardGeo[] | null = null;

async function fetchWardGeo(): Promise<WardGeo[]> {
  if (_geoCache) return _geoCache;
  try {
    const resp = await axios.get(DATAMEET_GEOJSON_URL, { timeout: 30000 });
    const features: GeoFeature[] = resp.data.features;

    // Deduplicate by KGISWardNo, keep largest area
    const byNo = new Map<number, WardGeo>();
    for (const f of features) {
      const wardNo = f.properties.KGISWardNo ?? f.properties.WARD_NO ?? 0;
      const name = f.properties.KGISWardName ?? f.properties.WARD_NAME ?? '';
      const area = featureAreaKm2(f.geometry);

      const existing = byNo.get(wardNo);
      if (!existing || area > existing.areaKm2) {
        byNo.set(wardNo, { name: String(name), wardNo: Number(wardNo), areaKm2: area });
      }
    }
    _geoCache = Array.from(byNo.values());
    console.log(`[Aggregator] Loaded ${_geoCache.length} ward geometries`);
    return _geoCache;
  } catch (err) {
    console.error('[Aggregator] Failed to fetch ward GeoJSON:', err);
    return [];
  }
}

/**
 * Run full aggregation for a given time window.
 * Returns null if aggregation fails.
 */
export async function aggregate(timeWindow: string): Promise<WardStats[] | null> {
  console.log(`[Aggregator] Starting aggregation for window=${timeWindow}`);

  // Fetch all data in parallel
  const [grievances, prevGrievances, potholeCounts, wardGeos] = await Promise.all([
    fetchGrievances(timeWindow).catch(e => {
      console.error('[Aggregator] Grievance fetch error:', e);
      return [] as FilteredGrievance[];
    }),
    fetchPreviousPeriodGrievances(timeWindow).catch(() => [] as FilteredGrievance[]),
    fetchPotholeCounts().catch(() => []),
    fetchWardGeo(),
  ]);

  if (grievances.length === 0) {
    console.warn('[Aggregator] No grievances fetched, returning empty result');
    return [];
  }

  // Build canonical ward names from GeoJSON
  const canonicalNames = wardGeos.map(w => w.name).filter(Boolean);

  // Load manual ward name map if available
  let manualMap: Record<string, string> = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    manualMap = require('../../client/public/ward_name_map.json') as Record<string, string>;
  } catch {
    // File may not exist yet
  }

  const normalizer = new WardNormalizer(canonicalNames, manualMap);

  // Build ward geo lookup
  const geoByCanonical = new Map<string, WardGeo>();
  for (const geo of wardGeos) {
    geoByCanonical.set(geo.name, geo);
  }

  // Build pothole lookup (normalize names)
  const potholeByCanonical = new Map<string, number>();
  for (const p of potholeCounts) {
    const canonical = normalizer.resolve(p.wardName);
    if (canonical) {
      potholeByCanonical.set(canonical, (potholeByCanonical.get(canonical) || 0) + p.complaints);
    }
  }

  // Build previous period lookup
  const prevByCanonical = new Map<string, number>();
  for (const g of prevGrievances) {
    const canonical = normalizer.resolve(g.wardName);
    if (canonical) {
      prevByCanonical.set(canonical, (prevByCanonical.get(canonical) || 0) + 1);
    }
  }

  // Group grievances by canonical ward
  interface WardAccumulator {
    total: number;
    unresolved: number;
    reopened: number;
    closed: number;
    streetlight: number;
    categories: Map<string, number>;
    recent: Array<{ id: string; category: string; subCategory: string; date: string; status: string }>;
  }

  const wardMap = new Map<string, WardAccumulator>();

  const UNRESOLVED_STATUSES = new Set(['Registered', 'ReOpen']);

  for (const g of grievances) {
    const canonical = normalizer.resolve(g.wardName);
    if (!canonical) continue;

    if (!wardMap.has(canonical)) {
      wardMap.set(canonical, {
        total: 0, unresolved: 0, reopened: 0, closed: 0, streetlight: 0,
        categories: new Map(), recent: [],
      });
    }

    const acc = wardMap.get(canonical)!;
    acc.total++;

    const statusUpper = g.status;
    if (UNRESOLVED_STATUSES.has(statusUpper)) acc.unresolved++;
    if (statusUpper === 'ReOpen') acc.reopened++;
    if (statusUpper === 'Closed') acc.closed++;
    if (STREETLIGHT_CATEGORIES.has(g.category)) acc.streetlight++;

    acc.categories.set(g.category, (acc.categories.get(g.category) || 0) + 1);

    if (acc.recent.length < 5) {
      acc.recent.push({
        id: g.id,
        category: g.category,
        subCategory: g.subCategory,
        date: g.date.toISOString().slice(0, 10),
        status: g.status,
      });
    }
  }

  // Assemble WardRawMetrics
  const rawMetrics: WardRawMetrics[] = [];

  for (const [canonical, acc] of wardMap.entries()) {
    const geo = geoByCanonical.get(canonical);
    const areaKm2 = geo?.areaKm2 ?? 0.5;
    const wardNo = geo?.wardNo ?? 0;

    const categoryBreakdown: Record<string, number> = {};
    let dominantCategory = 'Unknown';
    let maxCount = 0;
    for (const [cat, cnt] of acc.categories.entries()) {
      categoryBreakdown[cat] = cnt;
      if (cnt > maxCount) { maxCount = cnt; dominantCategory = cat; }
    }

    const resolutionRatePercent = acc.total > 0
      ? Math.round((acc.closed / acc.total) * 1000) / 10
      : 0;

    const prevTotal = prevByCanonical.get(canonical) ?? 0;
    const trend: 'rising' | 'falling' | 'stable' =
      prevTotal === 0 ? 'stable' :
      acc.total > prevTotal * 1.1 ? 'rising' :
      acc.total < prevTotal * 0.9 ? 'falling' : 'stable';

    rawMetrics.push({
      wardName: canonical,
      wardNo,
      totalComplaints: acc.total,
      unresolvedComplaints: acc.unresolved,
      reopenedComplaints: acc.reopened,
      closedComplaints: acc.closed,
      potholeComplaints: potholeByCanonical.get(canonical) ?? 0,
      streetlightComplaints: acc.streetlight,
      areaKm2,
      categoryBreakdown,
      dominantCategory,
      resolutionRatePercent,
      recentComplaints: acc.recent,
      trend,
      previousPeriodTotal: prevTotal,
    });
  }

  console.log(`[Aggregator] Aggregated ${rawMetrics.length} wards`);

  const scored = computeFrustrationScores(rawMetrics);
  scored.sort((a, b) => b.frustrationScore - a.frustrationScore);
  return scored;
}
