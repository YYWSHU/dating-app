import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import * as userController from './user.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

// File upload config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const updateSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  interestedIn: z.enum(['male', 'female', 'both']).optional(),
  birthDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
  maxDistance: z.number().min(1).max(500).optional(),
  minAge: z.number().min(18).max(100).optional(),
  maxAge: z.number().min(18).max(100).optional(),
});

const reorderSchema = z.object({
  photoIds: z.array(z.string()),
});

router.use(authMiddleware);

router.get('/users/me', userController.getMe);
router.patch('/users/me', validate(updateSchema), userController.updateMe);
router.post('/users/me/photos', upload.single('photo'), userController.addPhoto);
router.delete('/users/me/photos/:id', userController.deletePhoto);
router.patch('/users/me/photos/reorder', validate(reorderSchema), userController.reorderPhotos);
router.get('/users/:id', userController.getUserById);

export default router;
