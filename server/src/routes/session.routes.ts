import { Router } from 'express';
import { startSession, pauseSession, resumeSession, endSession, getActiveSession } from '../controllers/session.controller.js';

const router = Router();

// /api/session/...
router.post('/start', startSession);
router.post('/pause', pauseSession);
router.post('/resume', resumeSession);
router.post('/end', endSession);
router.get('/active', getActiveSession);

export default router;
