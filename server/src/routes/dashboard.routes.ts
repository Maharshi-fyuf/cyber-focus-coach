import { Router } from 'express';
import { getTodayDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/today', getTodayDashboard);

export default router;
