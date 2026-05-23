# Grievance Map | Bengaluru

**Live:** [civic-dashboard-kappa.vercel.app](https://civic-dashboard-kappa.vercel.app)

## What is this?

- **It shows you where Bangalore is suffering.** Every BBMP complaint filed by a resident - potholes, garbage, broken streetlights, lake encroachments - is pulled from open government data and plotted on a map, ward by ward
- **It scores each ward, not just counts complaints.** A ward with 500 complaints and a 95% resolution rate is healthier than one with 80 complaints and 0% resolved. The "Frustration Score" blends complaint volume, unresolved rate, pothole density, and streetlight failures into a single 0-1 number per ward
- **It's built entirely on public data, refreshed every 15 minutes.** No proprietary data, no scraping, no private APIs - only datasets any citizen or researcher can access

---

## The Frustration Score

| Signal | Weight | Why |
|--------|--------|-----|
| Complaint density (per km2) | 40% | Normalises for ward size |
| Unresolved ratio | 30% | Persistent unresolved issues = ongoing frustration |
| Pothole density (Fix My Street) | 20% | Road condition from a separate data source |
| Streetlight/electrical faults per km2 | 10% | Night-safety indicator |

Each signal is scaled 0 to 1 across all wards before combining, so the score reflects how stressed a ward is relative to others - not raw numbers.

### Time Windows

| Window | What it covers |
|--------|---------------|
| Live | All complaints up to the most recent sync |
| 24h | Filed in the last 24 hours |
| 7d | Filed in the last 7 days |
| 30d | Filed in the last 30 days |
| Seasonal | Current meteorological season for Bengaluru |

> **Note:** The CKAN datasets cover January-June 2025. All time windows are anchored to the latest date in the dataset, not today's date.

---

## Data Sources

Three independent sources, three organisations, three naming conventions. Getting them to work together is the bulk of the engineering work.

| Source | Provider | Format | Records | Key Gap |
|--------|----------|--------|---------|---------|
| BBMP Grievances 2024+2025 | OpenCity CKAN | One row per complaint | ~334,000 | No location coordinates |
| Potholes (Fix My Street) | OpenCity CKAN | One row per ward | ~198 rows | No timestamps |
| Ward Boundaries | DataMeet GeoJSON | Map polygons | 243 (obsolete) | Reflects 2022 draft, not current 225 wards |
| Ward Name Mapping | Hand-curated file | Name pairs | ~80+ entries | Manual, known to be incomplete |
| Constituency Centres | Hand-curated file | Lat/lng points | 28 points | No official boundary polygons exist |

### BBMP Grievances (OpenCity CKAN)

- **Portal:** [data.opencity.in](https://data.opencity.in) - run by the Oorvani Foundation. Hosts 1,272+ datasets, 151 from BBMP directly
- **Underlying source:** BBMP Sahaaya 2.0 ("Namma Bengaluru") - the unified BBMP grievance app. No public API exists; data reaches OpenCity via periodic file releases, not a live connection
- **Critical gap:** No location data for any complaint. Every complaint is tagged only to a ward name - a string of text. Nothing more precise than that

| Dataset | Resource ID | Coverage |
|---------|------------|----------|
| BBMP Grievances 2025 | `1342a93b-9a61-4766-9c34-c8357b7926c2` | Jan-Jun 2025 |
| BBMP Grievances 2024 | `2a3f29ef-a7a1-4fc3-b125-cbcc958a89d1` | Full year 2024 |

### Fix My Street (Pothole Data)

- **Resource ID:** `22be8fdc-532d-4ec8-8e31-2e6d26d5ce85`
- **Key limitation:** This dataset is pre-totalled by ward - one number per ward, not individual reports. There are no dates per complaint, so it cannot be filtered by time window. The same pothole count appears in the 24-hour view and the 30-day view. A ward that fixed all its potholes last month looks identical to one that filed them yesterday

### Ward Boundaries (DataMeet GeoJSON)

- **Source:** `github.com/datameet/Municipal_Spatial_Data` - a volunteer-run civic open data project, originally scraped from KSRSAC (the state government's mapping authority)
- **Critical: this file is outdated.** BBMP officially moved to **225 wards on September 25, 2023**. The DataMeet file reflects the **243-ward draft from July 2022** - a version that was never legally enacted. It has not been updated. Every ward polygon on this map may be drawn in the wrong place relative to current administrative reality
- **Why it is used anyway:** No official BBMP GeoJSON exists in any publicly accessible format. DataMeet is the only option available to anyone building civic tech on Bangalore
- **DataMeet's own disclaimer:** "The data is not perfect and contains many errors both in data and boundaries." The KSRSAC source it was scraped from states: "shall not be used for any legal purpose"

### Ward Delimitation History

| Date | Ward count | What happened |
|------|-----------|---------------|
| 2007 | 198 | BBMP formed by merging surrounding municipalities; 198 wards established |
| 2015 | 198 | Last BBMP elections held |
| July 2022 | 243 (draft) | State government announces draft delimitation - DataMeet GeoJSON was scraped at this point |
| Sep 25, 2023 | **225** | **Official final delimitation; current legal ward count** |
| Oct 2025 | - | BBMP dissolved; Greater Bengaluru Authority (GBA) replaces it |
| Nov 2025 | 369 (GBA) | GBA announces 369 wards across 5 new corporations |

The key problem: the DataMeet GeoJSON (243 wards), the CKAN grievance data (tagged to 198-ward names from the Sahaaya backend), and the current official structure (225 wards) are three different things. No dataset in this project uses the current legal ward count.

---

## Combining the Data: What We Had to Do

### The Ward Naming Problem

Three datasets refer to the same wards but use completely different names. A multi-stage matching pipeline handles this:

| Stage | Technique | What it catches |
|-------|-----------|----------------|
| 1 | Manual lookup in a hand-built name map | Completely different names - e.g. `Halsoor` to `Ulsoor`, `Indiranagar` to `Domlur` |
| 2 | Normalised exact match (lowercase, remove punctuation) | Spacing differences - e.g. `B T M Layout` to `BTM Layout` |
| 3 | Prefix or partial match | Cases where one name is a shortened version of the other |
| 4 | Fuzzy text matching (80% similarity threshold) | Spelling variants - e.g. `Nilasandra` to `Neelasandra` |
| 5 | No match | Logged and excluded; appear grey on the map |

After all stages, roughly 169 of 225 wards match. About 56 wards appear grey on the map - not because they have zero complaints, but because their name cannot be matched.

**Why this is hard:**
- Kannada has no single standard way to spell place names in English. The same ward can be spelled 3-5 different ways across different government departments
- The 2023 delimitation renamed 15 wards outright. One was renamed to "Dr. Puneet Rajkumar" after the actor's death. Political renames have no automatic mapping
- Some CKAN entries use neighbourhood names (`Indiranagar`) or colloquial names (`HMT Ward`, `K R Market`) that do not appear in any official ward list
- There is a known bug: `"Hoodi"` appears twice in the name map file. The second entry silently replaces the first

### Other Things That Had to Be Fixed

- **Timestamp format:** CKAN stores dates with nanosecond precision (`"2025-01-15 09:23:11.000000000"`) - a non-standard format that most code rejects. The nanosecond part has to be stripped before parsing
- **Stale data handling:** The dataset ends in June 2025 but the app runs later. Without a fix, the "last 7 days" filter would return zero results. The app anchors all time windows to the last date in the dataset instead of today
- **Ward area:** The GeoJSON does not include ward sizes. Area has to be calculated from the polygon coordinates using a standard geometry formula. Minimum size is capped at 0.5 km2 to avoid division-by-zero errors in density calculations
- **No constituency boundaries:** Assembly constituency boundaries are not available as public data for Bangalore. The neighbourhood filter works by assigning each ward to its nearest constituency centre point (28 hand-placed coordinates)

### CKAN Data Fetch

| Setting | Value |
|---------|-------|
| Max records per request | 1,000 (API limit) |
| Total requests needed | ~336 to get all ~334,000 records |
| Requests at a time | 8 |
| Retry strategy | Waits 2s, then 4s, then 6s on failure |
| Fields fetched | 6 of ~20 available (cuts download size in half) |
| Fetch strategy | All records fetched once; all 5 time windows built from that single copy |

---

## Accuracy & Limitations: A Map Data Perspective

### The boundary problem

- **There is no accurate GeoJSON for Bangalore's wards.** The volunteer-maintained DataMeet file is the only publicly available option. BBMP, the state GIS authority, OpenStreetMap, and BBMP's own internal mapping system all maintain separate ward boundary files - none of them match each other. A 2017 OpenCity audit found 18 different representations in 6 different formats across agencies for the same spatial data
- **Historical context:** Until 2021, 43% of India was legally off-limits for mapping under the Official Secrets Act (1923). Municipal bodies needed government clearance - which took 18 months or more - to digitise their own maps. This created decades of institutional GIS weakness that has not been repaired
- **OSM showed 2009 ward boundaries in 2023** when the delimitation exercise happened - 14 years out of date. The 2023 delimitation itself was based on 2011 Census population data for a city that had roughly doubled in size since then
- **Coordinate system mismatch:** Indian government mapping files have been published in multiple coordinate systems over the years - the global GPS standard (WGS-84) and older India-specific systems. If files from different eras are combined without knowing which system each uses, boundaries can be misaligned by 200-500m

### No precise complaint locations

- BBMP records which ward a complaint belongs to, but not where within the ward. Every pulsing dot on the map sits at the centre of the ward polygon. A complaint from one end of a 10 km2 ward looks identical to one from the other end. The map cannot show hotspots within a ward
- Even if street addresses were added to complaints tomorrow, locating them accurately would still be difficult:
  - Only ~40% of Indian addresses pinpoint a location within 500m when run through commercial mapping tools
  - 80% of Indian addresses use a landmark as the primary reference point ("near XYZ school"), which puts the location 50-1,500m from where you actually are. The average error is roughly 400m - about the width of a large ward
  - GPS readings on phones in India are accurate within 50m only about half the time
- **DIGIPIN** (India Post + IIT Hyderabad + ISRO, launched May 2025) assigns a unique 10-character code to every 4x4 metre square in India - the first nationally standardised precise address system. Civic apps have not integrated it yet

### Crowdsourced bias

- Research on civic complaint platforms in India consistently shows that low-income and minority neighbourhoods file fewer complaints despite having greater need. The map reflects who has digital access and uses complaint apps - not where problems are actually worst
- The Fix My Street pothole data used here comes from a 2-month window in 2022. No longer historical dataset exists publicly
- 4% of BBMP complaints are filed to the wrong agency. Citizens often cannot tell whether an issue belongs to BBMP, BESCOM, BWSSB, or BMTC - because there is no publicly available map showing which agency is responsible for which streets and infrastructure

### Why the scores might be wrong

- Complaint density is 40% of the score. If a ward polygon is drawn too large or too small (which the obsolete GeoJSON makes likely), every density-based number for that ward is off
- "Closed" in BBMP's system may mean an official marked it as done, not that the resident's problem was fixed. Only 0.3% of complaints are marked "In Progress" - which seems very low for a city-scale bureaucracy
- The city-wide resolution rate is a simple average across all wards, weighted equally. A small ward with 5 complaints counts the same as a large ward with 5,000
- BBMP had no elected ward councillors from 2020 to the 2026 GBA elections - a 6-year gap with no democratic accountability at the ward level for data quality or service delivery

---

## What AI Could Help With

- **Fixing the ward name matching:** A language model trained on Kannada place names could resolve the ~56 unmatched wards far more reliably than spelling-similarity alone. The hand-built name map in this project is a useful starting dataset for this
- **Rebuilding ward boundaries from government PDFs:** BBMP publishes official ward maps as scanned PDFs. AI document processing and satellite image alignment could produce a more accurate and up-to-date GeoJSON than the volunteer-maintained one
- **Smarter address geocoding for India:** Models trained on Bangalore's address patterns - informal locality names, Kannada spellings, survey plot numbers - could assign GPS coordinates to complaints. Google's Address Descriptors API (2025) and Delhivery's AddFix system (over 90% accuracy within 200m) show this is already achievable at scale
- **Pothole detection from video and satellite:** A 2025 research project (iWatchRoad, arXiv) uses AI to detect potholes from dashcam footage, matches the video timestamps to GPS logs, and produces a per-road pothole map. This directly solves the problem that Fix My Street has no location data
- **Flagging fake resolutions:** A model could detect wards where the "resolved" rate suddenly spikes without a corresponding drop in new complaints - a signal that an official bulk-closed a backlog without actually fixing anything
- **Mapping informal settlements:** AI models applied to satellite imagery have mapped slum boundaries in Maharashtra cities with 95-99% accuracy. The outer edges of Bangalore - where most BBMP expansion happened - are the areas that map worst in existing civic data

---

## Getting Started

```bash
# Install
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
| GeoJSON uses obsolete 243-ward draft | Official ward count has been 225 since Sep 2023 |
| ~56 unmatched wards appear grey | Naming mismatch - these wards have complaints, they just do not show |
| Sahaaya backend uses 198-ward names | CKAN ward names may not map to current 225-ward structure |
| Data ends Jun 2025 | H2 2025 not published; all time windows anchored to June 19 |
| No complaint coordinates | Pulse markers sit at ward centres, not actual complaint locations |
| Pothole data has no timestamps | Same count applied to all time windows |
| "Closed" does not mean actually resolved | Bulk administrative closures are not detectable |
| No test suite | TypeScript type checking is the primary correctness check |
