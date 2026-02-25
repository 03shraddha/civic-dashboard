# Grievance Map — Bengaluru

Analyse BBMP complaints across Bengaluru. A civic intelligence map that turns 300,000+ raw BBMP complaint records into a ward-by-ward heat map of urban stress, built entirely on public government open data.

---

## What It Does

Grievance Map aggregates all BBMP grievances filed by residents — potholes, garbage, broken streetlights, revenue complaints, lake encroachments, and more — and computes a **Frustration Score** for each of Bengaluru's 225 wards. The map refreshes every 15 minutes and lets you slice the data by time window, complaint category, and neighbourhood (constituency).

### The Map

Each ward polygon is colour-coded from pale slate (low stress) through amber to red (high stress). Pulsing circles at ward centroids give an at-a-glance feel for which areas are under the most strain. Hover any ward for a quick summary; click it for the full detail drawer.

| Colour | What it means |
|--------|---------------|
| Pale slate | Few complaints, high resolution rate |
| Amber | Moderate stress — worth watching |
| Red | High complaint density or many unresolved |

### The Sidebar

The left panel gives you city-wide context and all filters:

- **Complaint counter** — total grievances in the selected time window across all wards
- **City resolution rate** — percentage of complaints closed city-wide; bar turns green above 70%, amber between 40–70%, red below 40%
- **Time window** — switch between Live, 24h, 7d, 30d, and Seasonal; the map recolours instantly
- **Category filter** — 2 most-common categories shown by default; expand to filter by Garbage, Electrical/Streetlights, Roads, Revenue, Forest/Trees, Lakes, or Khata Services; selecting one recalculates all scores for that category only
- **Neighbourhood filter** — 3 constituency chips shown by default; expand to browse all 28 Bengaluru constituencies; selecting one dims unrelated wards and flies the map to that area
- **Ward Intelligence** — four auto-calculated spotlights: Most Stressed, Sudden Spike, Fastest Resolved, Most Improved

### The Hover Panel

Mouse over any ward to open a compact detail panel (top-right of the map):

- Ward name and number
- Frustration score out of 100 with trend arrow (↑ rising / ↓ falling / → stable)
- Total complaints, open count, and resolution rate %
- Mini bar chart of top 4 issue categories

### The Ward Drawer

Click any ward to open a full detail panel that slides in from the right edge of the map:

- Score badge (Low / Medium / High) with numeric score
- 3-metric summary: Total · Open · Resolved %
- Full category breakdown with percentage bars
- Up to 20 most-recent complaints, each showing the specific sub-category description (e.g. "Garbage not cleared from road"), a coloured category badge, status pill, and date

### Category Explainer

Clicking a category filter triggers a contextual overlay at the top of the map. It explains what that category covers, what types of issues are included, example complaints, and which BBMP department is responsible. It auto-dismisses after 8 seconds or can be closed manually.

### Understanding the Frustration Score

The score is not a raw complaint count. A ward with 500 complaints and a 95% resolution rate is healthier than one with 80 complaints and 0% resolved. The score blends four signals:

| Signal | Weight | Why |
|--------|--------|-----|
| Complaint density (per km²) | 40% | Normalises for ward size |
| Unresolved ratio | 30% | Persistent unresolved issues = ongoing frustration |
| Pothole density (Fix My Street) | 20% | Road condition from a distinct data source |
| Streetlight/electrical faults per km² | 10% | Night-safety indicator |

Each component is normalised 0–1 across all wards before combining, so the score reflects relative stress, not absolute volume.

### Time Windows

| Window | What it covers |
|--------|---------------|
| Live | All complaints up to the most recent data sync |
| 24h | Filed in the last 24 hours |
| 7d | Filed in the last 7 days |
| 30d | Filed in the last 30 days |
| Seasonal | Current meteorological season for Bengaluru |

> **Data note:** The underlying CKAN datasets cover January–June 2025. All time windows are anchored to the latest date in the dataset, so the "7d" view shows the 7 days ending on the dataset's most recent entry.

### Category Glossary

| Category | Covers |
|----------|--------|
| Garbage | Solid waste collection, litter, illegal dumping |
| Electrical / Streetlights | Streetlight outages, electrical hazards |
| Roads | Potholes, road damage, footpath issues |
| Revenue | Property tax, land records, encroachments |
| Forest / Trees | Tree falls, pruning requests, park encroachments |
| Lakes | Lake encroachment, water body pollution, drain blockages |
| Khata Services | E-Khata certificates, property registration, mutations |

---

## Getting Started (Local Dev)

### Prerequisites

- Node.js 18+
- npm

### 1 — Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2 — Start the backend

```bash
cd server
npm run dev
```

The server starts on **http://localhost:3001**. On first run it fetches ~300,000 CKAN records and builds the cache — this takes **2–5 minutes**. The frontend shows a warm-up screen with a progress indicator during this period.

### 3 — Start the frontend

```bash
cd client
npm run dev
```

Open **http://localhost:5173**. Vite proxies all `/api` requests to the backend automatically.

### 4 — Using the app

1. Wait for the warm-up screen to clear (spinner disappears when cache is ready)
2. The map loads with the **7-day** view by default
3. Select a time window in the sidebar — map recolours within ~200ms (data already cached)
4. Click a category chip to filter; click it again or click "+ more" to see all categories
5. Expand "Neighbourhood" to zoom the map to a specific constituency
6. Hover any ward for the quick summary panel; click it for the full detail drawer

---

## Deployment

### Backend (Railway / Render)

1. Point to the `server/` directory as the root
2. Build command: `npm run build`
3. Start command: `npm start`
4. Set env var: `CLIENT_ORIGIN=https://your-frontend-url.vercel.app`

The cron job runs automatically every 15 minutes once the server is live.

### Frontend (Vercel / Netlify)

1. Point to the `client/` directory as the root
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set env var: `VITE_API_BASE=https://your-backend-url.railway.app` (if backend is not on same domain)

---

# Technical Documentation

## Architecture

```
civic_pulse/
├── server/          Node.js 18 + Express + TypeScript
│   └── src/
│       ├── index.ts              Express entry, CORS, route mounting
│       ├── cron.ts               node-cron: aggregateAll() every 15 min
│       ├── services/
│       │   ├── ckan.ts           Semaphore-limited paginated CKAN fetcher
│       │   ├── grievanceService.ts  Fetch 2024+2025 datasets in one pass
│       │   ├── potholeService.ts   Fix My Street single-request fetch
│       │   └── aggregator.ts     Core pipeline: fetch → normalize → score → cache
│       ├── utils/
│       │   ├── wardNormalizer.ts  Fuzzy name matching (Levenshtein ≥ 0.80)
│       │   ├── dateParser.ts      Nanosecond timestamp parser + window anchoring
│       │   └── frustrationScore.ts  Score formula, min-max normalization
│       ├── routes/
│       │   ├── wardStats.ts      GET /api/ward-stats
│       │   ├── cityStats.ts      GET /api/city-stats
│       │   └── health.ts         GET /health
│       └── cache/
│           └── store.ts          In-memory Map<cacheKey, {data, updatedAt}>
│
└── client/          React 18 + Vite + TypeScript
    └── src/
        ├── App.tsx               Layout: TopBar + Sidebar + map viewport
        ├── store/index.ts        Zustand global state
        ├── hooks/
        │   ├── useWardBoundaries.ts  GeoJSON fetch + constituency assignment
        │   ├── useWardStats.ts       API poll on filter change; 202 → retry
        │   └── useCityStats.ts       City KPI fetch
        ├── components/
        │   ├── layout/
        │   │   ├── TopBar.tsx           Branding + data freshness indicator
        │   │   └── Sidebar.tsx          Filters, KPIs, Ward Intelligence
        │   ├── controls/
        │   │   └── NeighborhoodSelector.tsx  Constituency chip grid (28 areas)
        │   └── map/
        │       ├── MapContainer.tsx       react-leaflet root, CartoDB tiles
        │       ├── ChoroplethLayer.tsx    GeoJSON fill by frustration score
        │       ├── PulseLayer.tsx         Animated markers at ward centroids
        │       ├── PulseMarker.tsx        Single animated pulse div-icon
        │       ├── HoverPanel.tsx         Ward summary overlay on mouseover
        │       ├── WardDrawer.tsx         Full ward detail panel on click
        │       ├── ConstituencyZoomer.tsx flyToBounds on constituency select
        │       └── CategoryExplainer.tsx  Contextual category overlay
        ├── constants/
        │   ├── categories.ts     Category metadata + plain-language explanations
        │   ├── scoring.ts        Score weights + time filter list
        │   ├── api.ts            Endpoint paths + GeoJSON URL
        │   └── map.ts            Map centre, zoom, tile layer config
        └── utils/
            ├── colorScale.ts         3-stop interpolation (slate→amber→red)
            ├── centroidCalculator.ts Shoelace formula centroid per polygon
            └── cache.ts              sessionStorage wrapper with TTL
```

## Data Sources

| Dataset | CKAN Resource ID | Records | Coverage |
|---------|-----------------|---------|----------|
| BBMP Grievances 2025 | `1342a93b-9a61-4766-9c34-c8357b7926c2` | ~127,000 | Jan–Jun 2025 |
| BBMP Grievances 2024 | `2a3f29ef-a7a1-4fc3-b125-cbcc958a89d1` | ~207,000 | Full year 2024 |
| Fix My Street (potholes) | `22be8fdc-532d-4ec8-8e31-2e6d26d5ce85` | ~198 rows | Ward-level totals |
| Ward Boundaries GeoJSON | DataMeet / Municipal_Spatial_Data (GitHub) | 243 features | 225 BBMP wards |

All CKAN data is fetched from `https://data.opencity.in`. The CKAN API does not support server-side `GROUP BY`, so all aggregation happens in Node.js.

## Backend Data Pipeline

### Cold Start / Cron Cycle

```
aggregateAll()
  ├── Fetch GeoJSON boundaries + ward areas (parallel)
  ├── Fetch Fix My Street totals (1 request)
  ├── Fetch all 2025 grievances + all 2024 grievances (parallel, semaphore-limited)
  │     └── ~334,000 records across ~336 paginated CKAN requests
  ├── Sort all records by date desc (ensures recentComplaints are most-recent)
  ├── For each of 5 time windows [live, 24h, 7d, 30d, seasonal]:
  │     ├── filterToWindow(allRecords, windowStart, anchor)
  │     ├── groupByWard → WardAccumulator (first 20 per ward = most recent)
  │     ├── Normalize ward names (fuzzy match → canonical GeoJSON name)
  │     ├── Compute frustration scores (min-max, 99th-pct clip)
  │     └── setWardStats(window, stats[])
  └── Cache updated; GET /api/ward-stats returns fresh data
```

The key optimisation: all CKAN records are fetched **once** and all five time windows are derived from that single in-memory dataset. The naïve approach (one full fetch per window) was 3× slower.

### CKAN Fetcher

- Max 1,000 records per request (API limit)
- Semaphore: 8 concurrent requests maximum
- Fields projected: `Ward Name`, `Category`, `Sub Category`, `Grievance Status`, `Grievance Date`, `Complaint ID` — reduces payload ~50%
- Retries on HTTP 429 with exponential backoff (2s, 4s, 6s)
- 30-second timeout per request

### Date Handling

CKAN timestamps use nanosecond precision: `"2025-01-15 09:23:11.000000000"`. The parser strips the sub-second part and parses via standard `Date`.

**Window anchoring:** Because the datasets end in June 2025 and the current date is later, all relative windows (`7d`, `30d`, etc.) are anchored to the dataset's maximum date rather than wall-clock time. This ensures windows always contain data.

### Ward Name Normalisation

Three datasets use inconsistent naming conventions (e.g. `"B T M Layout"` vs `"BTM Layout"`, `"Halsoor"` vs `"Ulsoor"`). Resolution is multi-stage:

1. Check `client/public/ward_name_map.json` (manual overrides)
2. Exact match after lowercase + strip punctuation
3. Prefix / substring match (unambiguous)
4. Levenshtein similarity ≥ 0.80
5. Unresolved names are logged and excluded from the choropleth

### Frustration Score Formula

```
FrustrationScore(ward) =
  normalize(complaint_density)     × 0.40
  + normalize(unresolved_ratio)    × 0.30
  + normalize(pothole_density)     × 0.20
  + normalize(streetlight_density) × 0.10
```

Where `normalize(x) = (x − p1) / (p99 − p1)`, clipped to [0, 1]. Ward area in km² is derived from the GeoJSON polygon using the shoelace formula at Bengaluru's latitude (12.97°N: 1° lon ≈ 108.2 km). MultiPolygon areas are summed across all rings.

## API Reference

### `GET /health`

Returns server status and which time windows are cached.

```json
{
  "status": "ok",
  "cachedWindows": ["live", "24h", "7d", "30d", "seasonal"],
  "uptime": 3720
}
```

Returns `{ "warming": true }` with HTTP 200 while the initial aggregation is still running.

### `GET /api/ward-stats?time=7d&category=Electrical`

Returns per-ward statistics for the given time window.

**Query params:**
- `time` — `live` | `24h` | `7d` | `30d` | `seasonal` (default: `7d`)
- `category` — optional; any CKAN category string to filter by

Returns HTTP 202 `{ "warming": true }` if the cache is not yet ready.

```json
{
  "updatedAt": "2025-06-19T10:00:00Z",
  "totalComplaints": 7297,
  "wards": [
    {
      "wardName": "HRBR Layout",
      "wardNo": 24,
      "totalComplaints": 312,
      "unresolvedComplaints": 48,
      "dominantCategory": "Solid Waste (Garbage) Related",
      "categoryBreakdown": { "Solid Waste (Garbage) Related": 180, "Electrical": 72 },
      "potholeComplaints": 14,
      "frustrationScore": 0.855,
      "resolutionRatePercent": 84.6,
      "trend": "rising",
      "previousPeriodTotal": 198,
      "recentComplaints": [
        { "id": "GRV123", "category": "Electrical", "subCategory": "Street Light not Working", "date": "2025-06-18", "status": "Registered" }
      ]
    }
  ]
}
```

### `GET /api/city-stats?time=7d`

Returns the four Ward Intelligence spotlights plus the city-wide resolution rate.

```json
{
  "mostFrustrated":    { "wardName": "HRBR Layout",    "frustrationScore": 0.855, "topIssue": "Solid Waste (Garbage) Related" },
  "suddenSpike":       { "wardName": "Devasandra",      "changePercent": 350,      "currentTotal": 27 },
  "fastestResolution": { "wardName": "Bapuji Nagar",    "resolutionRatePercent": 85.0 },
  "mostImproved":      { "wardName": "Gayithri Nagar",  "changePercent": -50,      "currentTotal": 12 },
  "cityAvgResolutionRate": 49.4
}
```

## Frontend State (Zustand)

```typescript
interface Store {
  // Filters (drive API refetches)
  timeFilter: 'live' | '24h' | '7d' | '30d' | 'seasonal';
  activeCategory: string | null;
  activeConstituency: string | null;

  // Map data
  wardStats: Map<string, WardStats>;        // keyed by canonical ward name
  wardBoundaries: FeatureCollection | null; // DataMeet GeoJSON (sessionStorage cached)
  centroids: WardCentroid[];                // Shoelace centroid per ward polygon
  constituencyWardMap: Map<string, string[]>; // nearest-centroid assignment
  cityStats: CityStatsResponse | null;

  // UI
  hoveredWardName: string | null;   // drives HoverPanel
  activeWardName: string | null;    // drives WardDrawer
  showPulses: boolean;
  isLoadingWards: boolean;
  totalComplaints: number;
  updatedAt: string | null;
}
```

## Colour Scale

3-stop linear interpolation, chosen to blend with the CartoDB light tile layer:

| Score | Hex | Label |
|-------|-----|-------|
| 0.0 | `#e2e8f0` | Low (slate, near-invisible) |
| 0.5 | `#f59e0b` | Medium (amber) |
| 1.0 | `#ef4444` | High (red) |

## Key Packages

| Package | Role |
|---------|------|
| `express` | HTTP server |
| `node-cron` | 15-minute aggregation schedule |
| `axios` | CKAN HTTP requests (server-side) |
| `react-leaflet` + `leaflet` | Interactive map |
| `zustand` | Client state management |

## Known Limitations

| Limitation | Detail |
|-----------|--------|
| ~56 unmatched wards | Ward names in CKAN don't fuzzy-match GeoJSON; appear grey |
| Data ends Jun 2025 | CKAN snapshots not yet updated to H2 2025 |
| No real complaint coordinates | Pulses appear at ward polygon centroids, not precise locations |
| Pothole data is ward totals | Fix My Street doesn't expose individual complaint dates |
