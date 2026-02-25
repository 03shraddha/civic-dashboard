# Civic Pulse — Bengaluru

A live civic intelligence map that turns 300,000+ raw BBMP complaint records into a real-time ward-by-ward heat map of urban stress across Bengaluru. Built on public government open data.

---

## What It Does

Civic Pulse aggregates all BBMP grievances filed by residents — potholes, garbage, broken streetlights, revenue complaints, lake encroachments, and more — and computes a **Frustration Score** for each of Bengaluru's 225 wards. The map updates every 15 minutes and lets you slice the data by time window and complaint category.

### The Map

Each ward polygon is colour-coded from deep blue (low stress) through amber to dark crimson (high stress). Pulsing circles at ward centroids give an at-a-glance feel for which areas are active right now. Hover over any ward to see a detailed breakdown.

| Colour | What it means |
|--------|---------------|
| Deep blue | Few complaints, high resolution rate |
| Teal | Below-average stress |
| Amber | Moderate — worth watching |
| Orange | High complaint volume or low resolution |
| Crimson | Severe — high density, many unresolved |

### The Sidebar

The left panel gives you live city-wide context at all times:

- **Complaint counter** — total grievances filed in the selected time window across all wards
- **City resolution rate** — what percentage of complaints have been closed city-wide; the bar turns green above 70%, amber between 40–70%, red below 40%
- **Time window** — switch between Live, 24h, 7d, 30d, and Seasonal views; the map recolours instantly
- **Category filter** — drill into a single issue type (Garbage, Electrical/Streetlights, Roads, Revenue, Forest/Trees, Lakes, Khata Services); selecting one shows only complaints of that category and recalculates scores
- **Ward Intelligence** — four auto-calculated spotlights:
  - **Most Stressed** — the ward with the highest frustration score right now, with its dominant issue type
  - **Sudden Spike** — the ward that saw the largest percentage increase in complaints compared to the previous equivalent period
  - **Fastest Resolved** — the ward with the highest complaint resolution rate
  - **Most Improved** — the ward whose complaint volume fell the most compared to the previous period

### The Hover Panel

Mouse over any ward on the map to open a detail panel (top-right of the map). It shows:

- Ward name and number
- Frustration score out of 100
- Total complaints, open/unresolved count, and resolution rate %
- Trend arrow — rising ↑ (more complaints than last period), falling ↓ (fewer), or stable →
- A mini bar chart of the top 4 issue categories for that ward

### Understanding the Frustration Score

The score is not just a raw complaint count. A ward with 500 complaints and a 95% resolution rate is healthier than one with 80 complaints and 0% resolved. The score blends four signals:

| Signal | Weight | Why |
|--------|--------|-----|
| Complaint density (per km²) | 40% | Normalises for ward size; a large ward naturally gets more complaints |
| Unresolved ratio | 30% | Persistent unresolved issues = ongoing resident frustration |
| Pothole density (Fix My Street) | 20% | Road condition is a distinct, high-impact data source |
| Streetlight/electrical faults per km² | 10% | Night-safety indicator |

Each component is normalised 0–1 across all wards before combining, so the final score reflects relative stress, not absolute volume.

### Time Windows Explained

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
| Revenue | Property tax, land records |
| Forest / Trees | Tree falls, encroachments on green cover |
| Lakes | Lake encroachment, water body pollution |
| Khata Services | E-Khata, property registration |

---

## Getting Started (Local Dev)

### Prerequisites

- Node.js 18+
- npm

### 1 — Install dependencies

```bash
# From the repo root
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

Open **http://localhost:5173**. The Vite dev server proxies all `/api` requests to the backend automatically.

### 4 — Using the app

1. Wait for the warm-up screen to clear — the spinner in the top bar disappears when the cache is ready
2. The map loads with the **7-day** view by default
3. Click a time-window button in the sidebar to switch views — map recolours within ~200ms (data already cached)
4. Click a category in the sidebar to filter; click it again (or click "All Categories") to clear
5. Hover any ward polygon on the map for the detail panel

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
        │   ├── useWardBoundaries.ts  GeoJSON fetch + sessionStorage cache
        │   ├── useWardStats.ts       API poll on filter change; 202 → retry
        │   └── useCityStats.ts       City KPI fetch
        ├── components/
        │   ├── layout/
        │   │   ├── TopBar.tsx        44px branding + data freshness
        │   │   └── Sidebar.tsx       KPIs, time filter, category, intelligence
        │   └── map/
        │       ├── MapContainer.tsx  react-leaflet root, CartoDB Dark Matter
        │       ├── ChoroplethLayer.tsx  GeoJSON fill by frustration score
        │       ├── PulseLayer.tsx    Animated div-icon markers at centroids
        │       ├── HoverPanel.tsx    Ward detail overlay (top-right)
        │       └── MapLegend.tsx     Colour scale bar (bottom-left)
        └── utils/
            ├── colorScale.ts     5-stop blue→crimson interpolation
            └── centroidCalculator.ts  Shoelace formula centroid per polygon
```

## Data Sources

| Dataset | CKAN Resource ID | Records | Coverage |
|---------|-----------------|---------|----------|
| BBMP Grievances 2025 | `1342a93b-9a61-4766-9c34-c8357b7926c2` | ~127,000 | Jan–Jun 2025 |
| BBMP Grievances 2024 | `2a3f29ef-a7a1-4fc3-b125-cbcc958a89d1` | ~207,000 | Full year 2024 |
| Fix My Street (potholes) | `22be8fdc-532d-4ec8-8e31-2e6d26d5ce85` | ~198 rows | Ward-level totals |
| Ward Boundaries GeoJSON | DataMeet / Municipal_Spatial_Data (GitHub) | 243 features | 225 BBMP wards |

All CKAN data is fetched from `https://data.opencity.in`. The CKAN API does not support server-side `GROUP BY`, so all aggregation happens in the Node.js backend.

## Backend Data Pipeline

### Cold Start / Cron Cycle

```
aggregateAll()
  ├── Fetch GeoJSON boundaries + ward areas (parallel)
  ├── Fetch Fix My Street totals (1 request)
  ├── Fetch all 2025 grievances + all 2024 grievances (parallel, semaphore-limited)
  │     └── ~334,000 records across ~336 paginated CKAN requests
  ├── For each of 5 time windows [live, 24h, 7d, 30d, seasonal]:
  │     ├── filterToWindow(allRecords, windowStart, anchor)
  │     ├── Normalize ward names (fuzzy match → canonical GeoJSON name)
  │     ├── Group by ward → WardRawMetrics
  │     ├── Compute frustration scores (min-max, 99th-pct clip)
  │     └── setWardStats(window, stats[])
  └── Cache updated; GET /api/ward-stats returns fresh data
```

The key optimisation: all CKAN records are downloaded **once** and all five time windows are derived from that single in-memory dataset. The naïve approach (one full fetch per window) was 3× slower and caused timeouts.

### CKAN Fetcher

- Max 1,000 records per request (API limit)
- Semaphore: 8 concurrent requests maximum
- Field projection: only 4 fields fetched (`Ward Name`, `Category`, `Grievance Status`, `Grievance Date`) — reduces payload ~55%
- Retries on HTTP 429 with exponential backoff

### Date Handling

CKAN timestamps use nanosecond precision: `"2025-01-15 09:23:11.000000000"`. The parser strips the sub-second part and parses via standard `Date`.

**Window anchoring:** Because the datasets end in June 2025 and the current date is ~Feb 2026, all relative windows (`7d`, `30d`, etc.) are anchored to the dataset's maximum date rather than wall-clock time. This ensures windows always contain data.

### Ward Name Normalization

Three datasets use inconsistent naming conventions (e.g. `"B T M Layout"` vs `"BTM Layout"`, `"Halsoor"` vs `"Ulsoor"`). Resolution is multi-stage:

1. Check `client/public/ward_name_map.json` (50+ manual overrides)
2. Exact match after lowercase + strip punctuation
3. Prefix / substring match (unambiguous)
4. Levenshtein similarity ≥ 0.80
5. Unresolved names are logged and excluded from the choropleth

Currently ~169 of 225 wards are matched. Unmatched wards appear grey on the map.

### Frustration Score Formula

```
FrustrationScore(ward) =
  normalize(complaint_density)     × 0.40
  + normalize(unresolved_ratio)    × 0.30
  + normalize(pothole_density)     × 0.20
  + normalize(streetlight_density) × 0.10
```

Where `normalize(x) = (x - p1) / (p99 - p1)`, clipped to [0, 1]. Ward area in km² is derived from the GeoJSON polygon using the shoelace formula at Bengaluru's latitude (12.97°N: 1° lon ≈ 108.2 km).

## API Reference

### `GET /health`

Returns server status and which time windows are cached.

```json
{
  "status": "ok",
  "cachedWindows": ["live", "24h", "7d", "30d", "seasonal"],
  "updatedAt": "2025-06-19T10:00:00Z"
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
      "categoryBreakdown": {
        "Solid Waste (Garbage) Related": 180,
        "Electrical": 72
      },
      "potholeComplaints": 14,
      "frustrationScore": 0.855,
      "resolutionRatePercent": 84.6,
      "trend": "rising",
      "previousPeriodTotal": 198
    }
  ]
}
```

### `GET /api/city-stats?time=7d`

Returns the four Ward Intelligence spotlights plus the city-wide resolution rate.

```json
{
  "mostFrustrated":   { "wardName": "HRBR Layout",   "frustrationScore": 0.855, "topIssue": "Solid Waste (Garbage) Related" },
  "suddenSpike":      { "wardName": "Devasandra",     "changePercent": 350,      "currentTotal": 27 },
  "fastestResolution":{ "wardName": "Bapuji Nagar",   "resolutionRatePercent": 85.0 },
  "mostImproved":     { "wardName": "Gayithri Nagar", "changePercent": -50,      "currentTotal": 12 },
  "cityAvgResolutionRate": 49.4
}
```

## Frontend State (Zustand)

```typescript
interface Store {
  // Filters (drive API refetches)
  timeFilter: 'live' | '24h' | '7d' | '30d' | 'seasonal';
  activeCategory: string | null;

  // Data
  wardStats: Map<string, WardStats>;       // keyed by wardName
  wardBoundaries: FeatureCollection | null;
  centroids: WardCentroid[];
  cityStats: CityStats | null;

  // UI
  hoveredWardName: string | null;
  isLoadingWards: boolean;
  totalComplaints: number;
  updatedAt: string | null;
}
```

The `useWardStats` hook watches `timeFilter` and `activeCategory`. On change it GETs `/api/ward-stats`, handles the 202 warming response by polling every 8 seconds, and updates the store. `ChoroplethLayer` and `PulseLayer` both read from the store and re-render reactively.

## Colour Scale

Five-stop linear interpolation:

| Score | Hex | Label |
|-------|-----|-------|
| 0.00 | `#1e3a5f` | Very low (deep blue) |
| 0.25 | `#0d7377` | Low (teal) |
| 0.50 | `#f4a500` | Medium (amber) |
| 0.75 | `#e85d04` | High (orange) |
| 1.00 | `#9b0000` | Severe (dark crimson) |

## Key Packages

| Package | Role |
|---------|------|
| `express` | HTTP server |
| `node-cron` | 15-minute aggregation schedule |
| `axios` | CKAN HTTP requests (server-side) |
| `react-leaflet` + `leaflet` | Interactive map |
| `zustand` | Client state management |
| `tailwindcss` | Utility CSS |

## Known Limitations

| Limitation | Detail |
|-----------|--------|
| ~56 unmatched wards | Ward names in CKAN don't fuzzy-match GeoJSON; appear grey |
| Data ends Jun 2025 | CKAN snapshots are not yet updated to H2 2025 |
| No real complaint coordinates | Pulses appear at ward polygon centroids, not precise locations |
| Pothole data is ward totals | Fix My Street doesn't expose individual complaint dates |
