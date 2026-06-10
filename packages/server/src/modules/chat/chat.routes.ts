import { Router } from 'express';
import { z } from 'zod';
import * as chatController from './chat.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

router.use(authMiddleware);

router.get('/matches/:matchId/messages', chatController.getMessages);
router.post('/matches/:matchId/messages', validate(sendMessageSchema), chatController.sendMessage);
router.patch('/messages/:id/read', chatController.markAsRead);

export default router;
