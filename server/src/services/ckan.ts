import axios, { AxiosError } from 'axios';
import https from 'https';

const CKAN_BASE = 'https://data.opencity.in/api/3/action';
const PAGE_SIZE = 2000;
const MAX_CONCURRENT = 16;
const RETRY_LIMIT = 3;

// Disable keep-alive: prevents EPIPE errors caused by Node reusing a socket
// that CKAN's server has already closed on its end.
const httpsAgent = new https.Agent({ keepAlive: false });

// Network errors worth retrying — all are transient and not the caller's fault.
const TRANSIENT_CODES = new Set(['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'EPIPE', 'ENOTFOUND']);

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

// Global semaphore for lightweight requests (count checks, small datasets).
const sem = new Semaphore(MAX_CONCURRENT);

/**
 * Fetch with retry. Pass a per-resource local semaphore for page requests
 * so two concurrent fetchAllRecords calls don't starve each other's slots.
 */
async function fetchWithRetry<T>(
  url: string,
  params: Record<string, unknown>,
  attempt = 0,
  semaphore: Semaphore = sem
): Promise<T> {
  await semaphore.acquire();
  let released = false;
  try {
    const resp = await axios.get<{ success: boolean; result: T }>(url, {
      params,
      timeout: 30000,
      httpsAgent,
    });
    if (!resp.data.success) throw new Error('CKAN API returned success=false');
    return resp.data.result;
  } catch (err) {
    const axErr = err as AxiosError;
    const errCode = axErr.code ?? (axErr.cause as NodeJS.ErrnoException | undefined)?.code ?? '';
    const is429 = axErr.response?.status === 429;
    const isTransient = TRANSIENT_CODES.has(errCode);

    if (attempt < RETRY_LIMIT && (is429 || isTransient)) {
      const delay = is429 ? (attempt + 1) * 2000 : (attempt + 1) * 1000;
      console.log(`[CKAN] ${is429 ? 'Rate limited' : `Transient error (${errCode})`}, retrying in ${delay}ms (attempt ${attempt + 1})`);
      released = true;
      semaphore.release();
      await new Promise(r => setTimeout(r, delay));
      return fetchWithRetry<T>(url, params, attempt + 1, semaphore);
    }
    throw err;
  } finally {
    if (!released) semaphore.release();
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

  // Step 3: fetch pages in parallel.
  // Each fetchAllRecords call gets its OWN semaphore so two concurrent dataset
  // fetches (2025 + 2024) don't share slots and starve each other.
  const localSem = new Semaphore(MAX_CONCURRENT);
  const pagePromises = offsets.map(offset =>
    fetchWithRetry<CkanSearchResult<T>>(
      `${CKAN_BASE}/datastore_search`,
      { resource_id: resourceId, limit: PAGE_SIZE, offset, fields: fieldParam },
      0,
      localSem
    ).then(r => r.records)
  );

  const settled = await Promise.allSettled(pagePromises);
  const all: T[] = [];
  let failedPages = 0;
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      all.push(...result.value);
    } else {
      failedPages++;
    }
  }
  if (failedPages > 0) {
    console.warn(`[CKAN] ${failedPages}/${settled.length} pages failed for ${resourceId} — using partial data`);
  }
  console.log(`[CKAN] Fetched ${all.length} records from ${resourceId}`);
  return all;
}

/**
 * Get the total record count for a resource without fetching any rows.
 * Used by the smart cron to skip re-aggregation when data is unchanged.
 */
export async function getResourceCount(resourceId: string): Promise<number> {
  const result = await fetchWithRetry<CkanSearchResult<unknown>>(
    `${CKAN_BASE}/datastore_search`,
    { resource_id: resourceId, limit: 0 }
  );
  return result.total;
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
