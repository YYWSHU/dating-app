import { Router } from 'express';
import * as matchController from './match.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/discover', matchController.discover);
router.get('/matches', matchController.getMatches);
router.get('/matches/:matchId', matchController.getMatchDetail);
router.post('/likes/:userId', matchController.likeUser);
router.delete('/likes/:userId', matchController.passUser);

export default router;
