import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { HealthResponse } from '@cyber-focus-coach/shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const startTime = Date.now();

app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (_req, res) => {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: (Date.now() - startTime) / 1000,
  };
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`[Cyber Focus Coach Server] Running on http://localhost:${PORT}`);
});
