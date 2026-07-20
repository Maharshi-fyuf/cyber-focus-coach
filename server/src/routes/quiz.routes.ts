import { Router } from 'express';
import { getQuizzesByTopic, submitQuizAttempt } from '../controllers/quiz.controller.js';

const router = Router();

router.get('/topic/:topicId', getQuizzesByTopic);
router.post('/:id/attempt', submitQuizAttempt);

export default router;
