import cron from 'node-cron';
import { aggregate } from './services/aggregator';
import { setWardStats } from './cache/store';

const TIME_WINDOWS = ['live', '24h', '7d', '30d', 'seasonal'];

export async function runAggregation(windows: string[] = TIME_WINDOWS): Promise<void> {
  console.log('[Cron] Starting aggregation run at', new Date().toISOString());
  for (const window of windows) {
    try {
      const stats = await aggregate(window);
      if (stats !== null) {
        setWardStats(window, stats);
        console.log(`[Cron] Cached ${stats.length} wards for window=${window}`);
      }
    } catch (err) {
      console.error(`[Cron] Aggregation failed for window=${window}:`, err);
    }
  }
  console.log('[Cron] Aggregation run complete at', new Date().toISOString());
}

export function startCron(): void {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    runAggregation().catch(console.error);
  });
  console.log('[Cron] Scheduled: every 15 minutes');
}
