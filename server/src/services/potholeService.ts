import { fetchPotholeData, RawPotholeRecord } from './ckan';

const FIX_MY_STREET_RESOURCE = '22be8fdc-532d-4ec8-8e31-2e6d26d5ce85';

export interface WardPotholeCount {
  wardName: string;
  wardNo: number;
  complaints: number;
}

/**
 * Fetch Fix My Street pothole data and return per-ward complaint counts.
 */
export async function fetchPotholeCounts(): Promise<WardPotholeCount[]> {
  let records: RawPotholeRecord[];
  try {
    records = await fetchPotholeData(FIX_MY_STREET_RESOURCE);
  } catch (err) {
    console.error('[PotholeService] Failed to fetch Fix My Street data:', err);
    return [];
  }

  return records.map(r => ({
    wardName: String(r['Ward Name'] || ''),
    wardNo: parseInt(String(r['Ward #'] || '0'), 10) || 0,
    complaints: parseInt(String(r['Complaints'] || '0'), 10) || 0,
  })).filter(w => w.wardName);
}
