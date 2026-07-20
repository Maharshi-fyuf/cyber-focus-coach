import { Router } from 'express';
import { getRoadmap, completeTopic } from '../controllers/roadmap.controller.js';

const router = Router();

router.get('/', getRoadmap);
router.patch('/:id/complete', completeTopic);

export default router;
