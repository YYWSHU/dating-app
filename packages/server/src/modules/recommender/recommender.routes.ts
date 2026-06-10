import { Router } from 'express';
import * as recController from './recommender.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// AI features
router.get('/recommender/health', recController.health);
router.get('/recommender/daily-picks', recController.dailyPicks);
router.post('/recommender/match-explanation', recController.matchExplanation);
router.post('/recommender/chat-suggestion', recController.chatSuggestion);
router.post('/recommender/embed-me', recController.embedMe);

export default router;
