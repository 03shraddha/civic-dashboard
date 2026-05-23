# Grievance Map | Bengaluru

**Live:** [civic-dashboard-kappa.vercel.app](https://civic-dashboard-kappa.vercel.app)

Shows every BBMP complaint mapped by ward, with a 0-1 Frustration Score instead of raw complaint counts. Data refreshes every 15 minutes from public government sources.

---

## Frustration Score

| Signal | Weight | Note |
|--------|--------|------|
| Complaint density (per km2) | 40% | Adjusted for ward size |
| Unresolved ratio | 30% | High backlog means problems are not being fixed |
| Pothole density (Fix My Street) | 20% | Road condition from a separate source |
| Streetlight/electrical faults per km2 | 10% | Night safety indicator |

Each signal is scaled from 0 to 1 across all wards before being combined.

### Time Windows

| Window | Coverage |
|--------|----------|
| Live | All complaints up to the most recent sync |
| 24h / 7d / 30d | Rolling windows from the anchor date |
| Seasonal | Current Bengaluru meteorological season |

> The CKAN datasets cover Jan-Jun 2025. All time windows are anchored to the latest date in the dataset, not today's date.

---

## Data Sources

| Source | Format | Records | Key Gap |
|--------|--------|---------|---------|
| BBMP Grievances 2024+2025 (OpenCity CKAN) | One row per complaint | ~334,000 | No location coordinates |
| Potholes - Fix My Street (OpenCity CKAN) | One row per ward | 198 rows | No timestamps; the same count appears in every time window |
| Ward Boundaries (DataMeet GeoJSON) | Polygons | 243 wards | 2022 draft; the current legal count is 225 |
| Ward Name Map | Hand-curated pairs | ~80 entries | Incomplete; known duplicate entry for "Hoodi" |
| Constituency Centres | Hand-placed lat/lng | 28 points | No official boundary polygons exist publicly |

### Ward Count History

| Date | Wards | Event |
|------|-------|-------|
| 2007 | 198 | BBMP formed by merging surrounding municipalities |
| Jul 2022 | 243 (draft) | State government draft delimitation; DataMeet GeoJSON was scraped at this point |
| Sep 2023 | **225** | **Current legal ward count** |
| Oct 2025 | - | BBMP dissolved; Greater Bengaluru Authority (GBA) formed |
| Nov 2025 | 369 | GBA announces 369 wards across 5 new corporations |

The core problem: DataMeet uses 243 wards, CKAN uses 198-ward names from the Sahaaya backend, and the current legal structure has 225. No dataset in this project matches the current legal count.

---

## Ward Name Matching

There are three datasets with three different naming systems. A five-step process tries to match them:

| Stage | Method | Example |
|-------|--------|---------|
| 1 | Manual name map | `Halsoor` to `Ulsoor`, `Indiranagar` to `Domlur` |
| 2 | Exact match after cleanup | `B T M Layout` to `BTM Layout` |
| 3 | Prefix or partial match | Shortened name variants |
| 4 | Fuzzy match (80% threshold) | `Nilasandra` to `Neelasandra` |
| 5 | No match | Logged; appears grey on the map |

About 169 of 225 wards match. The ~56 grey wards have complaints but could not be matched. This happens because Kannada has no standard way to write it in English letters, the 2023 ward renaming changed 15 ward names (one became "Dr. Puneet Rajkumar"), and some CKAN entries use informal names that do not appear in any official ward list.

---

## Accuracy

### Boundary problem

No accurate public GeoJSON file exists for Bangalore's current wards. The DataMeet file uses the 2022 draft, which was never made into law. BBMP, KSRSAC, OpenStreetMap, and BBMP's own internal GIS system all have different boundary files that do not agree with each other. OpenStreetMap still showed 2009 ward boundaries in 2023. Since complaint density makes up 40% of the score, a wrong polygon size makes every density number for that ward wrong.

### No precise complaint locations

BBMP tags complaints to a ward name only. Every pulsing dot on the map sits at the center of the polygon. A 2023 study found only about 40% of Indian addresses can locate a place within 500m using commercial geocoders, and the average address error is about 400m, roughly the width of a large ward. DIGIPIN (India Post, IIT Hyderabad, and ISRO, 2025) assigns 10-character codes to 4x4m squares, but civic apps have not started using it yet.

### Crowdsourced bias

Complaint platforms in India consistently show fewer complaints filed in low-income areas, even though the need is greater. The map shows who has digital access, not where problems are worst. The Fix My Street pothole data covers a 2-month window from 2022. About 4% of BBMP complaints are filed to the wrong agency because no public map shows which agency is responsible for which street or piece of infrastructure.

### Score reliability

"Closed" in BBMP's system may mean an official marked it done, not that the resident's problem was actually fixed. Only 0.3% of complaints are marked "In Progress", which is unusually low for a city this size. The city resolution rate is an unweighted average, so a ward with 5 complaints counts the same as one with 5,000. BBMP had no elected ward councillors from 2020 to the 2026 GBA elections, a 6-year gap in local accountability.

---

## What AI Could Help With

| Problem | Approach |
|---------|----------|
| ~56 unmatched wards | An LLM trained on Kannada place names; the hand-built name map is a useful starting point |
| Outdated ward polygons | AI document processing on BBMP's scanned PDF ward maps, aligned to satellite imagery |
| No complaint locations | Geocoding trained on Bangalore address patterns: informal locality names, Kannada spellings, survey plot numbers |
| No pothole locations | Dashcam footage with GPS timestamp matching (iWatchRoad method, arXiv 2025) |
| Fake resolutions | Flag wards where the "resolved" rate spikes without a matching drop in new complaints |
| Informal settlement edges | Satellite imagery models; 95-99% accuracy shown for Maharashtra slum boundaries |

---

## Getting Started

```bash
cd server && npm install
cd ../client && npm install

# Backend (localhost:3001 - first run fetches ~300k records, takes 2-5 min)
cd server && npm run dev

# Frontend (localhost:5173)
cd client && npm run dev
```

---

## Known Limitations

| Limitation | Detail |
|-----------|--------|
| Obsolete GeoJSON | 243-ward draft; legal count is 225 since Sep 2023 |
| ~56 grey wards | Have complaints; naming mismatch prevents them from showing |
| 198-ward Sahaaya names | CKAN names may not map to current 225-ward structure |
| Data ends Jun 2025 | All time windows anchored to June 19 |
| No complaint coordinates | Pulse markers sit at ward centroids only |
| Pothole data has no timestamps | Same count applied to all time windows |
| "Closed" does not mean resolved | Bulk closures are not detectable |
| No test suite | TypeScript is the primary correctness check |
