import { Router, Request, Response } from 'express';
import { getWardStats } from '../cache/store';
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

  const cached = getWardStats(time);

  // Return 202 immediately when cache is cold — client will poll /health and retry
  if (!cached) {
    res.status(202).json({
      warming: true,
      message: 'Server is aggregating data (~60s on first start). Please retry shortly.',
    });
    return;
  }

  let wards: WardStats[] = cached.data;

  if (category) {
    const normalizedCat = category.toLowerCase();
    wards = wards.filter(w =>
      Object.keys(w.categoryBreakdown).some(k => k.toLowerCase().includes(normalizedCat))
    );
  }

  res.json({
    updatedAt: cached.updatedAt.toISOString(),
    totalComplaints: wards.reduce((s, w) => s + w.totalComplaints, 0),
    timeWindow: time,
    category: category || null,
    wards,
  });
});

export default router;
