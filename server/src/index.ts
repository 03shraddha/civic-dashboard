import express from 'express';
import cors from 'cors';
import wardStatsRouter from './routes/wardStats';
import cityStatsRouter from './routes/cityStats';
import healthRouter from './routes/health';
import { startCron, runAggregation } from './cron';
import { loadFromDisk } from './services/aggregator';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET'],
  credentials: false,
}));

app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/ward-stats', wardStatsRouter);
app.use('/api/city-stats', cityStatsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`[Server] Civic Pulse API running on port ${PORT}`);
  console.log(`[Server] Client origin: ${CLIENT_ORIGIN}`);

  const diskReady = loadFromDisk();

  if (diskReady) {
    console.log('[Server] Serving from disk cache immediately. Background refresh queued.');
  } else {
    console.log('[Server] No disk cache found — first-run aggregation starting (~2-5 min)...');
  }

  runAggregation().catch(console.error);
  startCron();
});

export default app;
