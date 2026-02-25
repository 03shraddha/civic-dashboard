import { Router } from 'express';
import { getAllCachedWindows } from '../cache/store';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    cachedWindows: getAllCachedWindows(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
