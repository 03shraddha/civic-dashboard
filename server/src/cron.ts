import cron from 'node-cron';
import { aggregateAll, hasDataChanged } from './services/aggregator';

export async function runAggregation(): Promise<void> {
  console.log('[Cron] Starting aggregation at', new Date().toISOString());
  await aggregateAll();
  console.log('[Cron] Aggregation complete at', new Date().toISOString());
}

export function startCron(): void {
  cron.schedule('*/15 * * * *', async () => {
    try {
      if (!await hasDataChanged()) return;
      await runAggregation();
    } catch (err) {
      console.error('[Cron] Error in scheduled run:', err);
    }
  });
  console.log('[Cron] Scheduled: every 15 min (skips re-fetch when CKAN count is unchanged)');
}
