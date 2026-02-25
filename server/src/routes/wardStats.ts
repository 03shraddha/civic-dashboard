import { Router, Request, Response } from 'express';
import { getWardStats } from '../cache/store';
import { runAggregation } from '../cron';
import { WardStats } from '../utils/frustrationScore';

const router = Router();

const VALID_WINDOWS = new Set(['live', '24h', '7d', '30d', 'seasonal']);

router.get('/', async (req: Request, res: Response) => {
  const time = (req.query.time as string) || '7d';
  const category = req.query.category as string | undefined;

  if (!VALID_WINDOWS.has(time)) {
    res.status(400).json({ error: `Invalid time window. Valid: ${Array.from(VALID_WINDOWS).join(', ')}` });
    return;
  }

  // Check cache
  let cached = getWardStats(time);

  // If not cached, run aggregation synchronously (first-time or stale)
  if (!cached) {
    console.log(`[WardStats] Cache miss for ${time}, running aggregation...`);
    await runAggregation([time]);
    cached = getWardStats(time);
  }

  if (!cached) {
    res.status(503).json({ error: 'Data not yet available. Please try again shortly.' });
    return;
  }

  let wards: WardStats[] = cached.data;

  // Filter by category if requested
  if (category) {
    const normalizedCat = category.toLowerCase();
    wards = wards.filter(w =>
      Object.keys(w.categoryBreakdown).some(k => k.toLowerCase().includes(normalizedCat))
    );
  }

  const totalComplaints = wards.reduce((sum, w) => sum + w.totalComplaints, 0);

  res.json({
    updatedAt: cached.updatedAt.toISOString(),
    totalComplaints,
    timeWindow: time,
    category: category || null,
    wards,
  });
});

export default router;
