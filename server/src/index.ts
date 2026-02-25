import express from 'express';
import cors from 'cors';
import wardStatsRouter from './routes/wardStats';
import cityStatsRouter from './routes/cityStats';
import healthRouter from './routes/health';
import { startCron, runAggregation } from './cron';

const app = express();
const PORT = process.env.PORT || 3001;

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET'],
  credentials: false,
}));

app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/api/ward-stats', wardStatsRouter);
app.use('/api/city-stats', cityStatsRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, async () => {
  console.log(`[Server] Civic Pulse API running on port ${PORT}`);
  console.log(`[Server] Client origin: ${CLIENT_ORIGIN}`);

  // Kick off initial aggregation for the most common window in background
  console.log('[Server] Running initial aggregation for 7d window...');
  runAggregation(['7d']).catch(console.error);

  // Start cron for subsequent refreshes
  startCron();
});

export default app;
