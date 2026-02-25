import cron from 'node-cron';
import { aggregateAll } from './services/aggregator';

export async function runAggregation(): Promise<void> {
  console.log('[Cron] Starting aggregation at', new Date().toISOString());
  await aggregateAll();
  console.log('[Cron] Aggregation complete at', new Date().toISOString());
}

export function startCron(): void {
  cron.schedule('*/15 * * * *', () => {
    runAggregation().catch(console.error);
  });
  console.log('[Cron] Scheduled: every 15 minutes');
}
