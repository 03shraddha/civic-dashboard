import { fetchAllRecords, RawGrievanceRecord } from './ckan';
import { parseNanoTimestamp, getWindowStart } from '../utils/dateParser';

// Confirmed CKAN resource IDs (data.opencity.in)
const RESOURCE_2025 = '1342a93b-9a61-4766-9c34-c8357b7926c2';
const RESOURCE_2024 = '2a3f29ef-a7a1-4fc3-b125-cbcc958a89d1';

const GRIEVANCE_FIELDS = [
  'Ward Name', 'Category', 'Sub Category',
  'Grievance Status', 'Grievance Date', 'Complaint ID',
];

export interface ParsedGrievance {
  wardName: string;
  category: string;
  subCategory: string;
  status: string;
  date: Date;
  id: string;
}

/**
 * Fetch ALL grievance records from both 2025 and 2024 datasets ONCE.
 * Returns all parsed records; callers filter by date as needed.
 * This avoids the double-fetch that was causing 3+ minute load times.
 */
export async function fetchAllGrievanceRecords(include2024 = true): Promise<ParsedGrievance[]> {
  const resourceIds = include2024
    ? [RESOURCE_2025, RESOURCE_2024]
    : [RESOURCE_2025];

  console.log(`[GrievanceService] Fetching resources: ${resourceIds.join(', ')}`);

  // Fetch resources concurrently
  const fetched = await Promise.all(
    resourceIds.map(rid =>
      fetchAllRecords<RawGrievanceRecord>(rid, GRIEVANCE_FIELDS).catch(err => {
        console.error(`[GrievanceService] Failed to fetch ${rid}:`, err);
        return [] as RawGrievanceRecord[];
      })
    )
  );

  const allRaw = fetched.flat();
  console.log(`[GrievanceService] Total raw records fetched: ${allRaw.length}`);

  // Parse dates once — filter out records with no ward or unparseable date
  const parsed: ParsedGrievance[] = [];
  for (const r of allRaw) {
    if (!r['Ward Name']) continue;
    const date = parseNanoTimestamp(r['Grievance Date']);
    if (!date) continue;
    parsed.push({
      wardName: r['Ward Name'],
      category: r['Category'] || 'Unknown',
      subCategory: r['Sub Category'] || '',
      status: r['Grievance Status'] || 'Unknown',
      date,
      id: r['Complaint ID'] || '',
    });
  }

  console.log(`[GrievanceService] Parsed ${parsed.length} records`);
  return parsed;
}

/**
 * Filter a pre-fetched list of records to a specific time window.
 */
export function filterToWindow(
  records: ParsedGrievance[],
  windowStart: Date,
  windowEnd: Date = new Date()
): ParsedGrievance[] {
  return records.filter(r => r.date >= windowStart && r.date < windowEnd);
}

export { getWindowStart };
