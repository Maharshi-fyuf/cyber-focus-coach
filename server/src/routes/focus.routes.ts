import { Router } from 'express';
import { logFocusEvent } from '../controllers/focus.controller.js';

const router = Router();

router.post('/', logFocusEvent);

export default router;
