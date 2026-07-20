import { Router } from 'express';
import { getStreaks } from '../controllers/streak.controller.js';

const router = Router();

router.get('/', getStreaks);

export default router;
