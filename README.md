

# Civic Pulse — Bengaluru

Live BBMP civic complaint map for Bengaluru. Shows a choropleth "Frustration Score" map per ward,
animated complaint pulses, hover detail panels, and ward comparison cards.

## Architecture

```
civic_pulse/
├── server/    Node.js + Express + TypeScript (cron + API)
└── client/    React + Vite + TypeScript (map + UI)
```

## Quick Start

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start the backend

```bash
cd server
npm run dev
# Server starts on http://localhost:3001
# Initial 7d aggregation runs automatically (takes ~2-5 min first time)
```

### 3. Start the frontend

```bash
cd client
npm run dev
# Opens http://localhost:5173
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Server health + cached windows |
| `GET /api/ward-stats?time=7d&category=Electrical` | Per-ward frustration scores |
| `GET /api/city-stats?time=7d` | Comparison card data |

**Valid `time` values**: `live`, `24h`, `7d`, `30d`, `seasonal`

## Data Sources

- **BBMP Grievances 2025**: CKAN `1342a93b-4d7b-4dba-9f9a-2a06bf64dc85`
- **BBMP Grievances 2024**: CKAN `2a3f29ef-dbad-4e38-a6e7-c6e29d4c23e8`
- **Fix My Street (potholes)**: CKAN `22be8fdc-8c5d-4a0d-b4e2-04b6da0e1c5b`
- **Ward Boundaries**: DataMeet BBMP GeoJSON (GitHub CDN)

## Frustration Score Formula

```
FrustrationScore =
  normalize(complaint_density)    × 0.40
  + normalize(unresolved_ratio)   × 0.30
  + normalize(pothole_density)    × 0.20
  + normalize(streetlight_faults) × 0.10
```

Each component is min-max normalized across all wards with 99th-percentile outlier clipping.

## Deployment

- **Backend**: Railway or Render (set `CLIENT_ORIGIN` env var to your frontend URL)
- **Frontend**: Vercel or Netlify (set `VITE_API_BASE` if backend is not on same origin)

## Development Notes

- The Vite dev server proxies `/api` → `http://localhost:3001`
- First data load takes 2–5 minutes (fetching 200k+ CKAN records)
- Subsequent refreshes use in-memory cache (15-minute cron)
- Ward GeoJSON is cached in sessionStorage for 24 hours
