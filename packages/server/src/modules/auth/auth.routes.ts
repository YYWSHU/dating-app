import { Router } from 'express';
import { z } from 'zod';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  nickname: z.string().min(1).max(50),
  gender: z.enum(['male', 'female', 'other']),
  interestedIn: z.enum(['male', 'female', 'both']),
  birthDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refreshToken);

export default router;
