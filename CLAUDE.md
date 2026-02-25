# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (run from root)
npm run install:all

# Development (two terminals required)
cd server && npm run dev          # Port 3001, hot-reload via ts-node-dev
cd client && npm run dev          # Port 5173, Vite proxies /api + /health → 3001

# Type-check (no emit)
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit

# Production build
cd client && npm run build        # Outputs to client/dist/
cd server && npm run build        # Outputs to server/dist/

# Start compiled server
cd server && npm start
```

No test runner is configured. TypeScript is the primary correctness check.

## Architecture

This is a full-stack app showing a live choropleth map of BBMP civic complaints across 225 Bengaluru wards.

### Data Flow

```
CKAN API (BBMP 2024 + 2025 datasets, ~300k records)
  └─► server/src/services/grievanceService.ts   ← paginated fetch, 1000/req, 8 concurrent
  └─► server/src/services/potholeService.ts      ← Fix My Street (198 ward rows, single req)
        ↓
      server/src/services/aggregator.ts          ← fetch ONCE, derive all 5 time windows in-memory
        ↓
      server/src/utils/frustrationScore.ts       ← min-max normalised score per ward
      server/src/utils/wardNormalizer.ts         ← fuzzy Levenshtein match across 3 naming schemas
        ↓
      server/src/cache/store.ts                  ← in-memory Map<"ward-stats:{window}", WardStats[]>
        ↓
      server/src/routes/wardStats.ts             ← GET /api/ward-stats?time=7d&category=X
      server/src/routes/cityStats.ts             ← GET /api/city-stats
        ↓
      client: useWardStats / useCityStats        ← fetch on filter change, update Zustand store
      client: useWardBoundaries                  ← DataMeet GeoJSON cached in sessionStorage 24h
        ↓
      ChoroplethLayer.tsx                        ← react-leaflet GeoJSON fill by frustration score
      WardDrawer.tsx                             ← slide-in panel on ward click
      PulseLayer.tsx                             ← animated markers at ward centroids
```

The aggregator fetches all records once and slices by date for each of the 5 windows (`live`, `24h`, `7d`, `30d`, `seasonal`). The cron runs every 15 minutes. On startup the server runs a full aggregation synchronously before accepting requests.

### Key Design Constraints

- **CKAN has no GROUP BY** — all aggregation happens server-side in Node.js
- **No lat/lng in complaints** — pulse markers use polygon centroids computed via Shoelace formula from DataMeet GeoJSON
- **Ward names differ across 3 datasets** — `wardNormalizer.ts` fuzzy-matches with Levenshtein ≥ 0.85; `client/public/ward_name_map.json` handles manual edge cases
- **Dataset is a snapshot** (not live) — anchor date is detected from the max date in fetched records so time-window filtering works correctly even when the dataset is months old
- **GeoJSON key pattern** — `ChoroplethLayer` uses `key={choropleth-${wardStats.size}-${activeWardName}-${activeConstituency}}` to force Leaflet remount when state changes; closures otherwise capture stale values

### State Management

Single Zustand store at `client/src/store/index.ts`. Key slices:

| State | Purpose |
|---|---|
| `wardStats: Map<string, WardStats>` | Keyed by canonical ward name |
| `wardBoundaries` | DataMeet GeoJSON (fetched once) |
| `centroids: WardCentroid[]` | Computed from GeoJSON at load |
| `constituencyWardMap: Map<string, string[]>` | Nearest-centroid assignment of wards to 28 constituencies |
| `activeWardName` | Opens/closes `WardDrawer` |
| `activeConstituency` | Dims non-member wards; triggers `ConstituencyZoomer` |
| `hoveredWardName` | Suppressed when `activeWardName` is set |

### Frustration Score Formula

```
score = normalize(complaint_density) × 0.40
      + normalize(unresolved_ratio)   × 0.30
      + normalize(pothole_density)    × 0.20
      + normalize(streetlight_faults) × 0.10
```

Each component is min-max normalised across all wards; outliers clipped at 99th percentile. Ward area in km² is computed from GeoJSON polygon area (1°lat ≈ 111 km, 1°lng ≈ 108.2 km at 12.97°N); minimum clamped to 0.5 km².

### Color Scale

3-stop interpolation in `client/src/utils/colorScale.ts`:
- `0.0` → `#e2e8f0` (slate, blends with light map)
- `0.5` → `#f59e0b` (amber)
- `1.0` → `#ef4444` (red)

### Neighbourhood Filter

On GeoJSON load, `useWardBoundaries.ts` fetches `client/public/constituency_centres.json` (28 lat/lng anchors) and assigns each ward centroid to its nearest constituency using cosine-corrected squared distance. Selecting a constituency dims non-member wards (`fillOpacity: 0.1`) and `ConstituencyZoomer.tsx` calls `map.flyToBounds()` from within the Leaflet context.

### API

`CLIENT_ORIGIN` env var controls CORS (defaults to `http://localhost:5173`).

```
GET /health                          → { status, cachedWindows[] }
GET /api/ward-stats?time=7d          → { updatedAt, totalComplaints, wards: WardStats[] }
GET /api/ward-stats?time=7d&category=Electrical
GET /api/city-stats?time=7d          → { mostFrustrated, fastestResolution, suddenSpike, mostImproved, cityAvgResolutionRate }
```

`recentComplaints[]` on each `WardStats` is capped at 20 entries.

### CKAN Resource IDs

| Dataset | Resource ID |
|---|---|
| BBMP Grievances 2025 | `1342a93b-9a61-4766-9c34-c8357b7926c2` |
| BBMP Grievances 2024 | `2a3f29ef-a7a1-4fc3-b125-cbcc958a89d1` |
| Fix My Street (potholes) | `22be8fdc-532d-4ec8-8e31-2e6d26d5ce85` |
| Ward Boundaries GeoJSON | `https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Bangalore/BBMP.geojson` |

Date format from CKAN: `"2024-12-31 05:52:00.000000000"` (nanosecond timestamps — strip trailing decimals).
