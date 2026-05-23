# Grievance Map | Bengaluru

**Live:** [civic-dashboard-kappa.vercel.app](https://civic-dashboard-kappa.vercel.app)

## What is this?

- **It shows you where Bangalore is suffering.** Every BBMP complaint filed by a resident - potholes, garbage, broken streetlights, lake encroachments - is pulled from open government data and plotted on a map, ward by ward, so you can see at a glance which neighbourhoods are under the most civic stress
- **It scores each ward, not just counts complaints.** A ward with 500 complaints and a 95% resolution rate is healthier than one with 80 complaints and 0% resolved. The "Frustration Score" blends complaint volume, unresolved rate, pothole density, and streetlight failures into a single 0–1 number per ward
- **It's built entirely on public data, refreshed every 15 minutes.** No proprietary data, no scraping, no private APIs - only datasets that any citizen or researcher can access themselves

---

## What It Does

Grievance Map aggregates all BBMP grievances filed by residents - potholes, garbage, broken streetlights, revenue complaints, lake encroachments, and more - and computes a **Frustration Score** for each of Bengaluru's 225 wards. The map refreshes every 15 minutes and lets you slice the data by time window, complaint category, and neighbourhood (constituency).

### The Map

Each ward polygon is colour-coded from pale slate (low stress) through amber to red (high stress). Pulsing circles at ward centroids give an at-a-glance feel for which areas are under the most strain. Hover any ward for a quick summary; click it for the full detail drawer.

| Colour | What it means |
|--------|---------------|
| Pale slate | Few complaints, high resolution rate |
| Amber | Moderate stress - worth watching |
| Red | High complaint density or many unresolved |

### The Sidebar

The left panel gives you city-wide context and all filters:

- **Complaint counter** - total grievances in the selected time window across all wards
- **City resolution rate** - percentage of complaints closed city-wide; bar turns green above 70%, amber between 40–70%, red below 40%
- **Time window** - switch between Live, 24h, 7d, 30d, and Seasonal; the map recolours instantly
- **Category filter** - 2 most-common categories shown by default; expand to filter by Garbage, Electrical/Streetlights, Roads, Revenue, Forest/Trees, Lakes, or Khata Services; selecting one recalculates all scores for that category only
- **Neighbourhood filter** - 3 constituency chips shown by default; expand to browse all 28 Bengaluru constituencies; selecting one dims unrelated wards and flies the map to that area
- **Ward Intelligence** - four auto-calculated spotlights: Most Stressed, Sudden Spike, Fastest Resolved, Most Improved

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

## Data Sources

This project combines three independent sources, each maintained by a different organisation, each using different naming conventions and formats. Getting them to align is a significant fraction of the engineering work.

### 1. BBMP Grievances - OpenCity CKAN

- **Portal:** [data.opencity.in](https://data.opencity.in) - a programme of the **Oorvani Foundation** (which also runs Citizen Matters); built with technical support from CivicDataLab and the DataMeet community. Hosts 1,272+ datasets, 500+ Bengaluru-specific, 151 from BBMP directly
- **Mechanism:** CKAN REST API (`/api/3/action/datastore_search`); there is no official government API for this data - OpenCity sources it from BBMP portals, RTI responses, and community scraping
- **Complaint source:** The underlying complaints come from **BBMP Sahaaya 2.0** ("Namma Bengaluru"), a unified grievance portal integrating BBMP, BESCOM, BWSSB, BMTC, and BMRCL. No public API exists for Sahaaya; data reaches OpenCity via periodic data releases, not a live feed
- **Datasets used:**

| Dataset | CKAN Resource ID | Records | Coverage |
|---------|-----------------|---------|----------|
| BBMP Grievances 2025 | `1342a93b-9a61-4766-9c34-c8357b7926c2` | ~127,000 | Jan–Jun 2025 |
| BBMP Grievances 2024 | `2a3f29ef-a7a1-4fc3-b125-cbcc958a89d1` | ~207,000 | Full year 2024 |

- **Fields used:** `Ward Name`, `Category`, `Sub Category`, `Grievance Status`, `Grievance Date`, `Complaint ID`
- **Format issues:** Timestamps are stored with nanosecond precision (`"2025-01-15 09:23:11.000000000"`) - non-standard, requires custom parsing
- **Complaint statuses tracked:** `Registered` (open), `ReOpen` (re-escalated), `Closed` (resolved)
- **What is NOT in this data:** No latitude/longitude for individual complaints. Every complaint is tagged only to a ward name - a string - with no precise geolocation

### 2. Pothole Data - Fix My Street via OpenCity CKAN

- **CKAN Resource ID:** `22be8fdc-532d-4ec8-8e31-2e6d26d5ce85`
- **What it contains:** ~198 rows of ward-level pothole complaint totals - one row per ward, not per complaint
- **Key limitation:** Fix My Street data is a pre-aggregated ward total with no individual complaint dates, so it cannot be filtered by time window. The same ward-level pothole count is applied to all five time windows (Live, 24h, 7d, 30d, Seasonal)
- **Coverage:** Ward-level only, no coordinates, no timestamps per complaint

### 3. Ward Boundary Polygons - DataMeet / Municipal Spatial Data

- **Source:** `github.com/datameet/Municipal_Spatial_Data` - a volunteer-maintained civic geo-data repository, maintained by the DataMeet community (data scraped originally from KSRSAC, the government GIS authority)
- **URL used:** `https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Bangalore/BBMP.geojson`
- **What it contains:** 243 GeoJSON features, scraped from KSRSAC at the time of the **July 2022 draft delimitation** - which was later superseded
- **Critical caveat - this file is obsolete:** BBMP officially moved to **225 wards** on September 25, 2023. The DataMeet repo has not been updated to reflect this. There is no 225-ward GeoJSON in the DataMeet repo as of writing. The file used here represents a ward structure that no longer exists. This is the single most important data quality caveat in the entire project
- **Ward naming scheme:** Uses KGIS (Karnataka Geographic Information System) canonical ward names - the government's official GIS naming standard for spatial features
- **Why this source:** No official BBMP GeoJSON is publicly available in any machine-readable format. The DataMeet file is the only accessible ward boundary dataset used across Bangalore's civic tech community, despite its known staleness
- **DataMeet's own disclaimer:** The repository README states "The data is not perfect as there are many errors both in data and boundaries." The underlying KSRSAC source itself carries: "shall not be used for any legal purpose as they are just representational maps and information which are to be validated"
- **Fetch strategy:** Fetched once per cold start; cached in `sessionStorage` for 24 hours client-side

### 4. Ward Name Mapping - Hand-curated (`ward_name_map.json`)

- **What it is:** A manually maintained JSON file (~80+ entries) that maps CKAN ward name strings to their KGIS-canonical equivalents in the GeoJSON
- **Why it exists:** The automated fuzzy matcher alone was insufficient - too many CKAN names have no obvious algorithmic path to the correct GeoJSON name
- **Examples of entries:**

| CKAN name (raw) | GeoJSON canonical | Type of mismatch |
|-----------------|-------------------|------------------|
| `B T M Layout` | `BTM Layout` | Spacing in acronym |
| `Halsoor` | `Ulsoor` | Completely different name (historical rename) |
| `Nilasandra` | `Neelasandra` | Kannada transliteration variant |
| `Shivaji Nagar` | `Pulikeshinagar` | Entirely different name |
| `Indiranagar` | `Domlur` | Neighbourhood name vs. ward name |
| `HMT Ward` | `Peenya` | Colloquial/industrial name vs. administrative |
| `K R Market` | `Chickpete` | Landmark name vs. ward name |
| `Jayanagara` | `Jayamahal` | Historical vs. current administrative name |
| `Yeshwanthpura` | `Malleswaram` | Reorganisation artifact |
| `Deepanjali Nagar` | `Nandini Layout` | Locality name vs. ward name |

### 5. A Note on Ward Counts: The Delimitation History

Understanding which ward structure applies to any given dataset is the first question to ask before working with Bangalore civic data. The ward count has changed multiple times:

| Date | Ward count | Status |
|------|-----------|--------|
| 2007 | 198 | BBMP formed by merger; 198 wards established |
| 2015 | 198 | Last BBMP elections held; official ward maps published as PDF |
| July 2022 | 243 (draft) | State government notifies draft delimitation; DataMeet GeoJSON scraped here |
| Sep 25, 2023 | **225** | **Official final delimitation; current legal ward count as of writing** |
| Oct 2025 | BBMP dissolved | Greater Bengaluru Authority (GBA) replaces BBMP under new Act |
| Nov 2025 | 369 (GBA) | GBA notifies 369 wards across 5 new corporations |

Key implications:
- The DataMeet GeoJSON used in this project reflects **243 wards** (2022 draft) - not the current 225
- BBMP's Sahaaya grievance portal still uses the **198-ward** structure in its backend as of mid-2025
- OSM was updated to 225 wards by March 2024 (a 6-month lag after the official notification)
- OpenCity hosts datasets for all three versions (198, 243, 225) without clear deprecation labelling
- No elected ward councillors existed from 2020 to the 2026 GBA elections - a 6-year governance vacuum during which ward-level data accountability was absent

### 6. Constituency Centres - Static (`constituency_centres.json`)

- **What it is:** 28 hand-placed lat/lng points representing the approximate centres of Bengaluru's 28 assembly constituencies
- **Why it is static:** No official GeoJSON for assembly constituency boundaries is publicly available for Bangalore
- **How it is used:** Each of the 225 ward centroids is assigned to whichever constituency centre is nearest (by great-circle distance), building the neighbourhood filter

---

## Combining the Data: What We Had to Do

Three independent datasets, three independent naming conventions, no shared key. Here is the full normalization stack that makes them interoperate.

### The Ward Naming Problem

The central data harmonisation challenge: BBMP complaint records, Fix My Street totals, and KGIS ward polygons all refer to the same 225 wards but use incompatible names. Joining them requires a multi-stage resolution pipeline:

1. **Manual map lookup** - check `ward_name_map.json` first. Catches completely different names (e.g. `Halsoor` → `Ulsoor`) that no algorithm will find
2. **Exact normalised match** - lowercase both sides, strip the word "ward", strip non-alphanumeric characters, collapse whitespace. Catches spacing and punctuation differences
3. **Prefix/substring match** - if the normalised CKAN name is a prefix of, or contained within, a normalised GeoJSON name (or vice versa), and that match is unique, accept it. Catches truncations
4. **Levenshtein similarity ≥ 0.80** - full dynamic-programming edit-distance ratio. Catches transliteration variants (`Nilasandra` → `Neelasandra`)
5. **Unresolved** - names that pass through all four stages without a match are logged and excluded. Those wards appear grey on the map

After all four stages plus the manual map, approximately 169 of 225 wards match. ~56 wards remain grey due to naming that is too divergent for automated resolution.

**Why this is hard:**
- Kannada has no single standardised Roman transliteration scheme - the same ward name can be spelled 3–5 different ways across different government systems ("Chowdeshwari" vs "Chowdeswari", "Rajajinagar" vs "Rajaji Nagar")
- The 2023 delimitation renamed 15 wards outright - names from older datasets refer to wards that no longer exist or have been renamed. One ward (Ward 47) was renamed to "Dr. Puneet Rajkumar" after the actor's death; others after temples. These political renames have no algorithmic path
- Some CKAN entries use neighbourhood names (e.g. `Indiranagar`) that are smaller than a ward and map to a different ward name (`Domlur`) in KGIS
- Some entries use landmark or colloquial names (`HMT Ward`, `K R Market`) that appear nowhere in official ward lists
- The CKAN data may reflect the 198-ward Sahaaya backend, while the GeoJSON reflects 243 wards - these are different delimitations, not just different spellings
- BBMP's own official documents have been publicly criticised for containing Kannada translation errors and inconsistencies

### Date Parsing

- **Problem:** CKAN timestamps use nanosecond precision (`"2025-01-15 09:23:11.000000000"`) - rejected by JavaScript's `Date` constructor
- **Fix:** Strip sub-millisecond digits before parsing
- **Window anchoring:** Datasets end in June 2025 but wall-clock time is later; all windows (`7d`, `30d`, etc.) are anchored to the dataset's maximum date rather than `Date.now()` - without this, every window returns zero records
- **Seasonal windows** use Bengaluru's meteorological calendar:
  - Summer: Mar–May
  - Monsoon: Jun–Oct
  - Post-monsoon: Nov
  - Winter: Dec–Feb

### Area Calculation

- **Problem:** Ward areas are not stored in the GeoJSON - must be computed from polygon coordinates
- **Method:** Shoelace formula on raw GeoJSON coordinates
- **Bengaluru-specific constants:** `1° latitude = 111.0 km`, `1° longitude = 108.2 km` (cosine-corrected for 12.97°N)
- **MultiPolygon handling:** Areas of all rings are summed
- **Safety floor:** Minimum `0.5 km²` to prevent division-by-zero in density calculations

### Constituency Assignment

- **Problem:** No official GeoJSON exists for assembly constituency boundaries
- **Solution:** Nearest-centroid assignment - each ward centroid is compared to 28 hand-placed constituency anchor points and assigned to the closest one
- **Accuracy correction:** Longitude difference is cosine-corrected for Bengaluru's latitude before computing distance
- **Result:** Approximate only - a ward right on a constituency border may be assigned to the wrong one

### CKAN Pagination

- **Constraint:** CKAN API returns at most 1,000 records per request
- **Scale:** ~334,000 total records requires ~336 sequential page fetches per dataset
- **Rate limit handling:** Semaphore of 8 concurrent requests maximum; exponential backoff (2s → 4s → 6s) on HTTP 429
- **Payload optimisation:** Only 6 of ~20 available fields are requested, reducing transfer size by ~50%
- **Single-fetch strategy:** All records fetched once; all 5 time windows derived from that in-memory dataset - the naïve approach (one fetch per window) was 3× slower

---

## Accuracy & Limitations: A Map Data Perspective

This project is a case study in what happens when civic data is assembled from independently-maintained, informally-structured open datasets. The following limitations are not fixable within this project - they are upstream data quality problems.

### Data that is missing entirely

- **No complaint coordinates** - BBMP's grievance system records which ward a complaint belongs to, but not where within the ward. Every pulse marker on the map sits at the ward's polygon centroid. A complaint filed from one end of a large ward and a complaint from the other end are indistinguishable. The map cannot show complaint hotspots within a ward
- **No ward boundary GeoJSON from BBMP directly** - BBMP does not publish authoritative ward boundaries as open data. The DataMeet GeoJSON used here is a community-maintained file of uncertain provenance and update cadence
- **No real-time data** - the CKAN snapshots are updated periodically (not continuously). The dataset used covers Jan–Jun 2025; H2 2025 data was not available at the time of writing
- **Fix My Street data has no timestamps per complaint** - the pothole dataset is pre-aggregated. Individual complaint dates are not available, so pothole data cannot be filtered by the same time windows as grievance data

### Ward boundary accuracy issues

- **At least four independent datasets, none matching** - DataMeet, KGIS/KSRSAC, OpenStreetMap, and BBMP's own ArcGIS server (`gisapp.bbmpgov.in`) all maintain separate ward boundary files. A 2017 OpenCity framework document found "multiple agencies representing the same spatial data in 18 different ways and 6 different formats, with none being an exact match to the other"
- **DataMeet's own disclaimer** - the repository explicitly states "The data is not perfect and contains many errors both in data and boundaries." The KSRSAC source it was scraped from carries: "shall not be used for any legal purpose." These are the caveats on the dataset used to draw every ward polygon in this map
- **The delimitation churn problem** - Bangalore's ward count changed from 198 → 243 (July 2022, draft) → 225 (September 2023, final). Each transition invalidates existing datasets. OSM was showing **2009 ward boundaries** in 2023 when the delimitation exercise happened - 14 years out of date. The 2023 delimitation used 2011 Census data for a city whose population had roughly doubled since then
- **The GeoJSON in this project reflects an obsolete ward structure** - the DataMeet file uses the 2022 draft (243 wards). The current official structure is 225 (since September 2023). BBMP was dissolved in October 2025 and replaced by the Greater Bengaluru Authority with 369 wards. Every ward polygon on this map may be drawing in the wrong place relative to current administrative reality
- **Colonial-era mapping restriction legacy** - until 2021, 43% of India's territory was under mapping restrictions (Official Secrets Act 1923, MoD application since 1967). Municipal bodies could not digitize maps without clearance taking 18+ months. This systematically prevented BBMP from building accurate spatial infrastructure for decades. The institutional GIS capacity gap this created has not closed
- **No official coordinate projection documentation** - Indian government GIS data has been published in both WGS-84 (GPS standard) and older Indian coordinate systems (Everest 1956, Kalyanpur). Mixing projections without documentation can shift boundaries by 200–500m
- **MultiPolygon wards** - some wards are non-contiguous. The centroid of a MultiPolygon ward may fall outside the ward itself or in a geographically misleading location. This project uses vertex count, not area, to pick which ring to compute the centroid from - placing the centroid in a small fragment rather than the main body for some wards

### Ward naming accuracy issues

- **~56 of 225 wards are unmatched** - these appear grey on the map with zero data, even if thousands of complaints were filed there. The grey map is not evidence of a low-complaint area; it is evidence of a naming mismatch
- **Duplicate key bug in `ward_name_map.json`** - `"Hoodi"` appears twice in the manual mapping file. The second entry silently overwrites the first in JSON parsers, which may cause subtle mismatches
- **Fuzzy matching false positives** - a Levenshtein threshold of 0.80 will sometimes match the wrong ward, especially for short ward names or names that differ by one common suffix. There is no automated way to detect these silently wrong matches
- **No canonical authoritative source** - there is no single government-published, machine-readable list that maps CKAN ward names to KGIS names to ward numbers. The manual mapping file in this repo is assembled from trial and error

### Geocoding and address accuracy (why complaints can't be precisely located)

Even if BBMP added complaint addresses to the dataset tomorrow, locating them accurately on a map would remain deeply difficult:

- **Only ~40% of Indian addresses resolve to within 500m** when tested against commercial geocoding APIs at scale. In Bangalore, informal locality names, inconsistent transliteration, and missing or wrong pin codes degrade this further
- **80% of Indian addresses use landmarks** as primary identifiers, positioned 50–1,500 metres from the actual location. The structural average error from landmark-based geocoding is ~400m - roughly the width of a large ward
- **Pin codes are useless for sub-ward precision** - median pin code area is ~90–179 sq km, containing up to 1 million households. 20–30% of written addresses contain incorrect pin codes
- **GPS capture is also unreliable** - research on large-scale GPS log collection in India found only 50% of captured GPS points accurate within 50m; only 10% accurate within 5m
- **DIGIPIN** (launched May 2025, India Post + IIT Hyderabad + ISRO) introduces a 10-character alphanumeric code for every 4×4m grid in India - the first nationally standardised precise address system. Civic data systems have not yet integrated it

### Crowdsourced data bias

- **Demographic under-representation is structural** - research on crowdsourced civic complaint platforms in India confirms that "low-income and minority neighbourhoods are less likely to report street condition or nuisance issues" despite greater need. Civic apps disproportionately receive reports from higher-educated, affluent areas with better digital access
- **The Fix My Street data used here is from May–June 2022** - a 2-month snapshot. No longitudinal public dataset exists. The app itself was relaunched in 2022 after a period of inactivity, so historical data continuity is broken
- **4% of BBMP complaints are misfiled (wrong agency)** - citizens cannot determine whether an issue belongs to BBMP, BESCOM, BWSSB, or BMTC. This reflects the ward/boundary data problem: there is no clear public map of which agency is responsible for which roads and infrastructure in which areas

### Scoring accuracy issues

- **Complaint density depends on area accuracy** - the Frustration Score weights complaint density at 40%. If the GeoJSON polygon for a ward is drawn incorrectly (too large or too small), every density-based metric for that ward is wrong
- **Pothole data is time-window-agnostic** - because Fix My Street does not expose complaint dates, the same pothole count is used for the 24-hour, 7-day, and 30-day views. A ward that fixed all its potholes last month will still show the same pothole density as a ward that filed them yesterday
- **Resolution rate opacity** - only 0.3% of BBMP complaints are marked "In Progress" (suspicious for a large bureaucracy), and 1.3% are reopened by citizens who dispute resolution. The "Closed" status in BBMP data may reflect administrative closure, not actual resolution. No citizen satisfaction data is collected alongside resolution claims
- **Resolution rate uses only `Closed` status** - complaints in `ReOpen` status are counted as unresolved, but the resolution rate percentage is computed only from `Closed / total`. The two metrics are not complementary
- **City average resolution rate is an unweighted mean** - averaging per-ward resolution rates equally ignores the fact that some wards have 5 complaints and others have 5,000

### Structural data quality issues

- **CKAN has no server-side aggregation** - the API does not support `GROUP BY`. All 334,000+ records must be downloaded and aggregated in Node.js on every 15-minute refresh cycle. OpenCity's data refresh cadence is irregular - the 2025 dataset stops in June; H2 2025 data was not published as of writing
- **Fragmented institutional GIS** - BBMP, KGIS/KSRSAC, BDA, and BMRDA all maintain independent GIS systems that are not synchronised. A 2017 OpenCity audit found 18 different representations and 6 different formats for the same spatial data across agencies, with none matching
- **6-year governance vacuum** - BBMP had no elected ward councillors from 2020 to the 2026 GBA elections. During this period - encompassing the COVID pandemic, a major delimitation, and BBMP's fastest expansion period - there was no ward-level democratic accountability for service delivery or data quality
- **Volunteer-maintained data has no SLA** - the DataMeet GeoJSON and OpenCity CKAN portal are maintained by civic volunteers. There is no guaranteed refresh schedule or quality gate

### What AI could help with

- **Automated ward name reconciliation** - an LLM with Kannada place-name context could resolve the ~56 unmatched wards more reliably than Levenshtein distance alone. The manually curated `ward_name_map.json` in this project is a starting training signal
- **Boundary reconstruction from PDFs** - BBMP publishes official ward maps as scanned PDFs. Computer vision (document layout models + satellite imagery alignment) could produce a more accurate and current GeoJSON than the volunteer-maintained DataMeet file
- **India-aware complaint geocoding** - models trained on Bangalore's address patterns (informal locality names, Kannada transliterations, survey numbers) could assign GPS coordinates to complaints. Google's Address Descriptors (2025) and Delhivery's AddFix (>90% accuracy within 200m) are examples of what is now achievable at scale
- **Pothole detection from dashcam/satellite** - iWatchRoad (2025, arXiv) fine-tunes YOLO on Indian road frames, synchronizes dashcam timestamps with GPS logs, and outputs per-road-segment pothole heatmaps - directly solving the "Fix My Street has no coordinates" problem
- **Anomaly detection in resolution rates** - models could flag wards where resolution rates suspiciously spike without corresponding reduction in new complaints, signalling bulk administrative closure rather than actual resolution
- **Slum boundary mapping** - U-Net models on Sentinel-2 imagery have achieved 95–99% accuracy for slum delineation in Maharashtra cities. Peripheral Bangalore - where much BBMP boundary expansion is concentrated - maps poorly in existing civic data

---

## Getting Started (Local Dev)

### Prerequisites

- Node.js 18+
- npm

### 1 - Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2 - Start the backend

```bash
cd server
npm run dev
```

The server starts on **http://localhost:3001**. On first run it fetches ~300,000 CKAN records and builds the cache - this takes **2–5 minutes**. The frontend shows a warm-up screen with a progress indicator during this period.

### 3 - Start the frontend

```bash
cd client
npm run dev
```

Open **http://localhost:5173**. Vite proxies all `/api` requests to the backend automatically.

### 4 - Using the app

1. Wait for the warm-up screen to clear (spinner disappears when cache is ready)
2. The map loads with the **7-day** view by default
3. Select a time window in the sidebar - map recolours within ~200ms (data already cached)
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
- Fields projected: `Ward Name`, `Category`, `Sub Category`, `Grievance Status`, `Grievance Date`, `Complaint ID` - reduces payload ~50%
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
- `time` - `live` | `24h` | `7d` | `30d` | `seasonal` (default: `7d`)
- `category` - optional; any CKAN category string to filter by

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
| GeoJSON is obsolete (243-ward draft) | DataMeet file reflects 2022 draft delimitation; official wards are 225 since Sep 2023 |
| ~56 unmatched wards | Ward names in CKAN don't fuzzy-match GeoJSON; appear grey with no data |
| Sahaaya backend uses 198-ward structure | CKAN ward names may reflect old ward numbering, not current 225 |
| Data ends Jun 2025 | CKAN snapshots not updated to H2 2025; all windows anchored to June 19 |
| No real complaint coordinates | Pulses appear at ward polygon centroids, not actual complaint locations |
| Pothole data is ward totals, no timestamps | Fix My Street is a 2022 snapshot; same count applied to all time windows |
| MultiPolygon centroid inaccuracy | Centroid computed from ring with most vertices, not largest area |
| Unweighted city resolution rate | Simple mean of per-ward rates, skewed by small wards |
| Resolution `Closed` ≠ actually resolved | Only 0.3% marked "In Progress"; bulk administrative closures not detectable |
| No test runner | TypeScript is the primary correctness check |
