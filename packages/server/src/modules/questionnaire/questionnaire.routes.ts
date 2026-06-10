import { Router } from 'express';
import * as qController from './questionnaire.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/questionnaire/questions', qController.getQuestions);
router.get('/questionnaire/me', qController.getMyQuestionnaire);
router.post('/questionnaire', qController.submit);

export default router;
