import { Router } from 'express';
import { z } from 'zod';
import * as locationController from './location.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

router.use(authMiddleware);

router.patch('/users/me/location', validate(locationSchema), locationController.updateLocation);
router.get('/nearby', locationController.getNearbyUsers);

export default router;
