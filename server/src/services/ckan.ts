import axios, { AxiosError } from 'axios';

const CKAN_BASE = 'https://data.opencity.in/api/3/action';
const PAGE_SIZE = 1000;
const MAX_CONCURRENT = 8;
const RETRY_LIMIT = 3;

export interface RawGrievanceRecord {
  'Ward Name': string;
  'Category': string;
  'Sub Category'?: string;
  'Grievance Status': string;
  'Grievance Date': string;
  'Complaint ID'?: string;
}

export interface RawPotholeRecord {
  'Ward #'?: string;
  'Ward Name': string;
  'Complaints': string | number;
  [key: string]: unknown;
}

// Simple semaphore for concurrency limiting
class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(max: number) {
    this.permits = max;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    await new Promise<void>(resolve => this.queue.push(resolve));
    this.permits--;
  }

  release(): void {
    this.permits++;
    const next = this.queue.shift();
    if (next) next();
  }
}

const sem = new Semaphore(MAX_CONCURRENT);

async function fetchWithRetry<T>(url: string, params: Record<string, unknown>, attempt = 0): Promise<T> {
  await sem.acquire();
  try {
    const resp = await axios.get<{ success: boolean; result: T }>(url, {
      params,
      timeout: 30000,
    });
    if (!resp.data.success) throw new Error('CKAN API returned success=false');
    return resp.data.result;
  } catch (err) {
    const axErr = err as AxiosError;
    if (attempt < RETRY_LIMIT && axErr.response?.status === 429) {
      const delay = (attempt + 1) * 2000;
      console.log(`[CKAN] Rate limited, retrying in ${delay}ms (attempt ${attempt + 1})`);
      await new Promise(r => setTimeout(r, delay));
      sem.release();
      return fetchWithRetry<T>(url, params, attempt + 1);
    }
    throw err;
  } finally {
    sem.release();
  }
}

interface CkanSearchResult<T> {
  total: number;
  records: T[];
}

/**
 * Fetch all records from a CKAN datastore resource with pagination.
 * Only requests the specified fields to minimize payload.
 */
export async function fetchAllRecords<T = RawGrievanceRecord>(
  resourceId: string,
  fields: string[]
): Promise<T[]> {
  const fieldParam = fields.join(',');

  // Step 1: get total count
  const countResult = await fetchWithRetry<CkanSearchResult<T>>(
    `${CKAN_BASE}/datastore_search`,
    { resource_id: resourceId, limit: 0, fields: fieldParam }
  );
  const total = countResult.total;
  console.log(`[CKAN] Resource ${resourceId}: ${total} total records`);

  if (total === 0) return [];

  // Step 2: calculate offsets
  const offsets: number[] = [];
  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    offsets.push(offset);
  }

  // Step 3: fetch pages in parallel (semaphore limits concurrency)
  const pagePromises = offsets.map(offset =>
    fetchWithRetry<CkanSearchResult<T>>(
      `${CKAN_BASE}/datastore_search`,
      { resource_id: resourceId, limit: PAGE_SIZE, offset, fields: fieldParam }
    ).then(r => r.records)
  );

  const pages = await Promise.all(pagePromises);
  const all = pages.flat();
  console.log(`[CKAN] Fetched ${all.length} records from ${resourceId}`);
  return all;
}

/**
 * Fetch Fix My Street data (single request, small dataset).
 */
export async function fetchPotholeData(resourceId: string): Promise<RawPotholeRecord[]> {
  const result = await fetchWithRetry<CkanSearchResult<RawPotholeRecord>>(
    `${CKAN_BASE}/datastore_search`,
    { resource_id: resourceId, limit: 1000 }
  );
  return result.records;
}
