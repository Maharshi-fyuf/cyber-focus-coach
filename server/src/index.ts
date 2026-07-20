import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { HealthResponse } from '@cyber-focus-coach/shared';
import sessionRoutes from './routes/session.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import logsRoutes from './routes/logs.routes.js';
import streakRoutes from './routes/streak.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import focusRoutes from './routes/focus.routes.js';

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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/focus-event', focusRoutes);

app.listen(PORT, () => {
  console.log(`[Cyber Focus Coach Server] Running on http://localhost:${PORT}`);
});
