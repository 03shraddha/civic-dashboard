import { Router, Request, Response } from 'express';
import { getWardStats } from '../cache/store';
import { WardStats } from '../utils/frustrationScore';

const router = Router();

const VALID_WINDOWS = new Set(['live', '24h', '7d', '30d', 'seasonal']);

router.get('/', async (req: Request, res: Response) => {
  const time = (req.query.time as string) || '7d';

  if (!VALID_WINDOWS.has(time)) {
    res.status(400).json({ error: 'Invalid time window' });
    return;
  }

  const cached = getWardStats(time);

  if (!cached) {
    res.status(202).json({ warming: true, message: 'Server is warming up. Retry shortly.' });
    return;
  }

  if (cached.data.length === 0) {
    res.status(503).json({ error: 'No data available for this window.' });
    return;
  }

  const wards: WardStats[] = cached.data;

  // Most frustrated ward
  const mostFrustrated = wards.reduce((best, w) =>
    w.frustrationScore > best.frustrationScore ? w : best
  );

  // Fastest resolution (highest resolutionRatePercent, min 10 complaints)
  const eligibleForResolution = wards.filter(w => w.totalComplaints >= 10);
  const fastestResolution = eligibleForResolution.length > 0
    ? eligibleForResolution.reduce((best, w) =>
        w.resolutionRatePercent > best.resolutionRatePercent ? w : best
      )
    : wards[0];

  // Sudden spike: highest % increase from previous period (min 20 complaints)
  const eligibleForSpike = wards.filter(w => w.totalComplaints >= 20 && w.previousPeriodTotal > 0);
  let suddenSpike: WardStats | null = null;
  let maxSpike = 0;
  for (const w of eligibleForSpike) {
    const change = ((w.totalComplaints - w.previousPeriodTotal) / w.previousPeriodTotal) * 100;
    if (change > maxSpike) { maxSpike = change; suddenSpike = w; }
  }

  // Most improved: largest % decrease (min 20 prev complaints)
  const eligibleForImproved = wards.filter(w => w.previousPeriodTotal >= 20);
  let mostImproved: WardStats | null = null;
  let maxImprovement = 0;
  for (const w of eligibleForImproved) {
    const change = ((w.previousPeriodTotal - w.totalComplaints) / w.previousPeriodTotal) * 100;
    if (change > maxImprovement) { maxImprovement = change; mostImproved = w; }
  }

  const cityAvgResolutionRate = wards.length > 0
    ? Math.round(wards.reduce((s, w) => s + w.resolutionRatePercent, 0) / wards.length * 10) / 10
    : 0;

  res.json({
    updatedAt: cached.updatedAt.toISOString(),
    timeWindow: time,
    mostFrustrated: {
      wardName: mostFrustrated.wardName,
      wardNo: mostFrustrated.wardNo,
      frustrationScore: mostFrustrated.frustrationScore,
      topIssue: mostFrustrated.dominantCategory,
      totalComplaints: mostFrustrated.totalComplaints,
    },
    fastestResolution: fastestResolution ? {
      wardName: fastestResolution.wardName,
      wardNo: fastestResolution.wardNo,
      resolutionRatePercent: fastestResolution.resolutionRatePercent,
      totalComplaints: fastestResolution.totalComplaints,
    } : null,
    suddenSpike: suddenSpike ? {
      wardName: suddenSpike.wardName,
      wardNo: suddenSpike.wardNo,
      changePercent: Math.round(maxSpike),
      currentTotal: suddenSpike.totalComplaints,
      previousTotal: suddenSpike.previousPeriodTotal,
    } : null,
    mostImproved: mostImproved ? {
      wardName: mostImproved.wardName,
      wardNo: mostImproved.wardNo,
      changePercent: -Math.round(maxImprovement),
      currentTotal: mostImproved.totalComplaints,
      previousTotal: mostImproved.previousPeriodTotal,
    } : null,
    cityAvgResolutionRate,
  });
});

export default router;
