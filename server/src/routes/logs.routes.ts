import { Router } from 'express';
import { createOrUpdateLog, getLogByDate, getAllLogs } from '../controllers/logs.controller.js';

const router = Router();

router.post('/', createOrUpdateLog);
router.get('/', getAllLogs);
router.get('/:date', getLogByDate);

export default router;
