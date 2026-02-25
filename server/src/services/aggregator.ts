/**
 * Main aggregation pipeline.
 *
 * Key design: fetch CKAN records ONCE, compute all 5 time windows in-memory.
 * This avoids the previous 3+ minute cold-start caused by fetching the same
 * 300k+ records multiple times.
 */
import path from 'path';
import axios from 'axios';
import { fetchAllGrievanceRecords, filterToWindow, ParsedGrievance } from './grievanceService';
import { fetchPotholeCounts } from './potholeService';
import { WardNormalizer } from '../utils/wardNormalizer';
import { WardRawMetrics, computeFrustrationScores, WardStats } from '../utils/frustrationScore';
import { getWindowStart, findDatasetMaxDate } from '../utils/dateParser';
import { setWardStats } from '../cache/store';

const DATAMEET_GEOJSON_URL =
  'https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Bangalore/BBMP.geojson';

const STREETLIGHT_CATEGORIES = new Set(['Electrical']);
const UNRESOLVED_STATUSES = new Set(['Registered', 'ReOpen']);

const TIME_WINDOWS = ['live', '24h', '7d', '30d', 'seasonal'] as const;

interface GeoFeature {
  type: 'Feature';
  properties: {
    KGISWardNo?: string | number;
    KGISWardName?: string;
    WARD_NO?: string | number;
    WARD_NAME?: string;
    [key: string]: unknown;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

const LAT_KM = 111.0;
const LNG_KM = 108.2;

function polygonAreaKm2(ring: number[][]): number {
  let area = 0;
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % n];
    area += (x1 * LNG_KM) * (y2 * LAT_KM) - (x2 * LNG_KM) * (y1 * LAT_KM);
  }
  return Math.abs(area) / 2;
}

function featureAreaKm2(geometry: GeoFeature['geometry']): number {
  if (geometry.type === 'Polygon') {
    return polygonAreaKm2((geometry.coordinates as number[][][])[0]);
  }
  const coords = geometry.coordinates as number[][][][];
  return coords.reduce((sum, poly) => sum + polygonAreaKm2(poly[0]), 0);
}

interface WardGeo { name: string; wardNo: number; areaKm2: number }

let _geoCache: WardGeo[] | null = null;

async function fetchWardGeo(): Promise<WardGeo[]> {
  if (_geoCache) return _geoCache;
  try {
    const resp = await axios.get(DATAMEET_GEOJSON_URL, { timeout: 30000 });
    const byNo = new Map<number, WardGeo>();
    for (const f of resp.data.features as GeoFeature[]) {
      const wardNo = parseInt(String(f.properties.KGISWardNo ?? f.properties.WARD_NO ?? '0'), 10) || 0;
      const name = String(f.properties.KGISWardName ?? f.properties.WARD_NAME ?? '');
      const area = featureAreaKm2(f.geometry);
      const existing = byNo.get(wardNo);
      if (!existing || area > existing.areaKm2) byNo.set(wardNo, { name, wardNo, areaKm2: area });
    }
    _geoCache = Array.from(byNo.values());
    console.log(`[Aggregator] Loaded ${_geoCache.length} ward geometries`);
    return _geoCache;
  } catch (err) {
    console.error('[Aggregator] Failed to fetch ward GeoJSON:', err);
    return [];
  }
}

interface WardAccumulator {
  total: number;
  unresolved: number;
  reopened: number;
  closed: number;
  streetlight: number;
  categories: Map<string, number>;
  recent: Array<{ id: string; category: string; subCategory: string; date: string; status: string }>;
}

function groupByWard(
  records: ParsedGrievance[],
  normalizer: WardNormalizer
): Map<string, WardAccumulator> {
  const wardMap = new Map<string, WardAccumulator>();

  for (const g of records) {
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
    if (UNRESOLVED_STATUSES.has(g.status)) acc.unresolved++;
    if (g.status === 'ReOpen') acc.reopened++;
    if (g.status === 'Closed') acc.closed++;
    if (STREETLIGHT_CATEGORIES.has(g.category)) acc.streetlight++;
    acc.categories.set(g.category, (acc.categories.get(g.category) || 0) + 1);
    if (acc.recent.length < 20) {
      acc.recent.push({
        id: g.id, category: g.category, subCategory: g.subCategory,
        date: g.date.toISOString().slice(0, 10), status: g.status,
      });
    }
  }

  return wardMap;
}

function buildWardStats(
  wardMap: Map<string, WardAccumulator>,
  prevByCanonical: Map<string, number>,
  potholeByCanonical: Map<string, number>,
  geoByCanonical: Map<string, WardGeo>
): WardStats[] {
  const rawMetrics: WardRawMetrics[] = [];

  for (const [canonical, acc] of wardMap.entries()) {
    const geo = geoByCanonical.get(canonical);
    const categoryBreakdown: Record<string, number> = {};
    let dominantCategory = 'Unknown';
    let maxCount = 0;

    for (const [cat, cnt] of acc.categories.entries()) {
      categoryBreakdown[cat] = cnt;
      if (cnt > maxCount) { maxCount = cnt; dominantCategory = cat; }
    }

    const prevTotal = prevByCanonical.get(canonical) ?? 0;
    const trend: 'rising' | 'falling' | 'stable' =
      prevTotal === 0 ? 'stable' :
      acc.total > prevTotal * 1.1 ? 'rising' :
      acc.total < prevTotal * 0.9 ? 'falling' : 'stable';

    rawMetrics.push({
      wardName: canonical,
      wardNo: geo?.wardNo ?? 0,
      totalComplaints: acc.total,
      unresolvedComplaints: acc.unresolved,
      reopenedComplaints: acc.reopened,
      closedComplaints: acc.closed,
      potholeComplaints: potholeByCanonical.get(canonical) ?? 0,
      streetlightComplaints: acc.streetlight,
      areaKm2: geo?.areaKm2 ?? 0.5,
      categoryBreakdown,
      dominantCategory,
      resolutionRatePercent: acc.total > 0
        ? Math.round((acc.closed / acc.total) * 1000) / 10 : 0,
      recentComplaints: acc.recent,
      trend,
      previousPeriodTotal: prevTotal,
    });
  }

  const scored = computeFrustrationScores(rawMetrics);
  scored.sort((a, b) => b.frustrationScore - a.frustrationScore);
  return scored;
}

/**
 * Run the full aggregation pipeline ONCE and populate cache for ALL time windows.
 *
 * Previously each window triggered its own CKAN fetch (double-fetching 300k+ records).
 * Now we fetch all records once in parallel with the GeoJSON and potholes,
 * then derive each time window via in-memory date filtering.
 */
export async function aggregateAll(): Promise<void> {
  console.log('[Aggregator] Starting full aggregation (all windows)');
  const startMs = Date.now();

  // Always include 2024 dataset — anchor detection happens after fetch
  const need2024 = true;

  // ── Fetch everything in parallel ──────────────────────────────────────────
  const [allRecords, potholeCounts, wardGeos] = await Promise.all([
    fetchAllGrievanceRecords(need2024).catch(err => {
      console.error('[Aggregator] Grievance fetch failed:', err);
      return [] as ParsedGrievance[];
    }),
    fetchPotholeCounts().catch(() => []),
    fetchWardGeo(),
  ]);

  if (allRecords.length === 0) {
    console.warn('[Aggregator] No records fetched, aborting.');
    return;
  }

  console.log(`[Aggregator] Fetch complete in ${((Date.now() - startMs) / 1000).toFixed(1)}s — ${allRecords.length} records`);

  // ── Build lookup tables (done once, reused per window) ───────────────────
  const canonicalNames = wardGeos.map(w => w.name).filter(Boolean);
  let manualMap: Record<string, string> = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    manualMap = require(path.join(__dirname, '../../../client/public/ward_name_map.json')) as Record<string, string>;
  } catch { /* fine if missing */ }

  const normalizer = new WardNormalizer(canonicalNames, manualMap);

  const geoByCanonical = new Map<string, WardGeo>(wardGeos.map(g => [g.name, g]));

  const potholeByCanonical = new Map<string, number>();
  for (const p of potholeCounts) {
    const canonical = normalizer.resolve(p.wardName);
    if (canonical) potholeByCanonical.set(canonical, (potholeByCanonical.get(canonical) || 0) + p.complaints);
  }

  // ── Anchor time windows to dataset's max date, not today ─────────────────
  // The CKAN datasets are snapshots (e.g. Jan–Jun 2025). If today is months
  // later, filtering relative to "now" yields 0 records. Instead we anchor
  // all windows to the most recent complaint date in the data.
  const datasetMaxDate = findDatasetMaxDate(allRecords.map(r => r.date));
  const realNow = new Date();
  // Use dataset max date if it's more than 7 days in the past
  const anchor = (realNow.getTime() - datasetMaxDate.getTime()) > 7 * 24 * 60 * 60 * 1000
    ? datasetMaxDate
    : realNow;

  console.log(`[Aggregator] Data anchor: ${anchor.toISOString()} (dataset max: ${datasetMaxDate.toISOString()})`);

  for (const window of TIME_WINDOWS) {
    const windowStart = getWindowStart(window, anchor);
    const windowDurationMs = anchor.getTime() - windowStart.getTime();
    const prevStart = new Date(windowStart.getTime() - windowDurationMs);

    // Sort desc so the first 20 records added per ward in groupByWard are most recent
    const current = filterToWindow(allRecords, windowStart, anchor)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    const previous = filterToWindow(allRecords, prevStart, windowStart);

    console.log(`[Aggregator] Window=${window}: current=${current.length}, previous=${previous.length}`);

    const wardMap = groupByWard(current, normalizer);

    // Previous period totals per ward
    const prevByCanonical = new Map<string, number>();
    for (const g of previous) {
      const canonical = normalizer.resolve(g.wardName);
      if (canonical) prevByCanonical.set(canonical, (prevByCanonical.get(canonical) || 0) + 1);
    }

    const stats = buildWardStats(wardMap, prevByCanonical, potholeByCanonical, geoByCanonical);
    setWardStats(window, stats);
    console.log(`[Aggregator] Cached ${stats.length} wards for window=${window}`);
  }

  console.log(`[Aggregator] All windows done in ${((Date.now() - startMs) / 1000).toFixed(1)}s`);
}

/**
 * Legacy single-window aggregation — kept for on-demand route fallback.
 * Calls aggregateAll() and returns results for the requested window.
 */
export async function aggregate(timeWindow: string): Promise<WardStats[] | null> {
  await aggregateAll();
  const { getWardStats } = await import('../cache/store');
  return getWardStats(timeWindow)?.data ?? [];
}
