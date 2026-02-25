import { fetchAllRecords, RawGrievanceRecord } from './ckan';
import { parseNanoTimestamp, getWindowStart } from '../utils/dateParser';

// Confirmed CKAN resource IDs (data.opencity.in)
const RESOURCE_2025 = '1342a93b-9a61-4766-9c34-c8357b7926c2';
const RESOURCE_2024 = '2a3f29ef-a7a1-4fc3-b125-cbcc958a89d1';

const GRIEVANCE_FIELDS = ['Ward Name', 'Category', 'Sub Category', 'Grievance Status', 'Grievance Date', 'Complaint ID'];

export interface FilteredGrievance {
  wardName: string;
  category: string;
  subCategory: string;
  status: string;
  date: Date;
  id: string;
}

/**
 * Select which resource IDs to query based on the time window.
 * For windows that span into 2024 we also include the 2024 dataset.
 */
function selectResourceIds(timeWindow: string): string[] {
  const now = new Date();
  const windowStart = getWindowStart(timeWindow);
  const ids: string[] = [RESOURCE_2025];
  // If window goes back into 2024, also fetch 2024 data
  if (windowStart.getFullYear() < now.getFullYear() || timeWindow === 'seasonal') {
    ids.push(RESOURCE_2024);
  }
  return ids;
}

/**
 * Fetch and date-filter BBMP grievance records for a given time window.
 */
export async function fetchGrievances(timeWindow: string): Promise<FilteredGrievance[]> {
  const windowStart = getWindowStart(timeWindow);
  const resourceIds = selectResourceIds(timeWindow);

  console.log(`[GrievanceService] Fetching for window=${timeWindow}, from=${windowStart.toISOString()}`);

  const allRecords: RawGrievanceRecord[] = [];
  for (const rid of resourceIds) {
    const records = await fetchAllRecords<RawGrievanceRecord>(rid, GRIEVANCE_FIELDS);
    allRecords.push(...records);
  }

  console.log(`[GrievanceService] Raw records fetched: ${allRecords.length}`);

  const filtered: FilteredGrievance[] = [];
  for (const r of allRecords) {
    const date = parseNanoTimestamp(r['Grievance Date']);
    if (!date) continue;
    if (date < windowStart) continue;
    if (!r['Ward Name']) continue;

    filtered.push({
      wardName: r['Ward Name'],
      category: r['Category'] || 'Unknown',
      subCategory: r['Sub Category'] || '',
      status: r['Grievance Status'] || 'Unknown',
      date,
      id: r['Complaint ID'] || '',
    });
  }

  console.log(`[GrievanceService] After date filter: ${filtered.length} records`);
  return filtered;
}

/**
 * Fetch for the previous equivalent period (for trend calculation).
 */
export async function fetchPreviousPeriodGrievances(timeWindow: string): Promise<FilteredGrievance[]> {
  const windowStart = getWindowStart(timeWindow);
  const windowDuration = Date.now() - windowStart.getTime();

  // Previous period = same duration, shifted back
  const prevEnd = windowStart;
  const prevStart = new Date(windowStart.getTime() - windowDuration);

  const resourceIds = [RESOURCE_2025, RESOURCE_2024];

  const allRecords: RawGrievanceRecord[] = [];
  for (const rid of resourceIds) {
    try {
      const records = await fetchAllRecords<RawGrievanceRecord>(rid, GRIEVANCE_FIELDS);
      allRecords.push(...records);
    } catch {
      // Best effort
    }
  }

  const filtered: FilteredGrievance[] = [];
  for (const r of allRecords) {
    const date = parseNanoTimestamp(r['Grievance Date']);
    if (!date) continue;
    if (date < prevStart || date >= prevEnd) continue;
    if (!r['Ward Name']) continue;

    filtered.push({
      wardName: r['Ward Name'],
      category: r['Category'] || 'Unknown',
      subCategory: r['Sub Category'] || '',
      status: r['Grievance Status'] || 'Unknown',
      date,
      id: r['Complaint ID'] || '',
    });
  }

  return filtered;
}
