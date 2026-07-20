import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { HealthResponse } from '@cyber-focus-coach/shared';
import sessionRoutes from './routes/session.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const startTime = Date.now();

app.use(cors());
app.use(express.json());

// Setup routes
app.get('/api/health', (req, res) => {
  const healthResponse: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: (Date.now() - startTime) / 1000
  };
  res.json(healthResponse);
});

// API Routes
app.use('/api/session', sessionRoutes);

app.listen(PORT, () => {
  console.log(`[Cyber Focus Coach Server] Running on http://localhost:${PORT}`);
});
