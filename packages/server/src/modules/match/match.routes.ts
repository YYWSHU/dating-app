import { Router } from 'express';
import * as matchController from './match.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { likeLimiter } from '../../lib/rate-limiter.js';

const router = Router();
router.use(authMiddleware);

router.get('/discover', matchController.discover);
router.get('/matches', matchController.getMatches);
router.get('/matches/:matchId', matchController.getMatchDetail);

// Rate-limited like endpoints
router.post('/likes/:userId', likeLimiter, matchController.likeUser);
router.post('/superlikes/:userId', likeLimiter, matchController.superLikeUser);
router.delete('/likes/:userId', matchController.passUser);

// P1: Undo last pass
router.post('/undo-pass', matchController.undoLastPass);

export default router;
