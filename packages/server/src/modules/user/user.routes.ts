import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import * as userController from './user.controller.js';
import * as blockReportController from './block-report.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => { cb(null, path.resolve('uploads')); },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image/video files are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 30 * 1024 * 1024 } });

const updateSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  tags: z.array(z.string().max(30)).max(15).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  interestedIn: z.enum(['male', 'female', 'both']).optional(),
  birthDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
  maxDistance: z.number().min(1).max(500).optional(),
  minAge: z.number().min(18).max(100).optional(),
  maxAge: z.number().min(18).max(100).optional(),
  mbti: z.string().optional().nullable(),
  bigFive: z.object({
    openness: z.number().min(0).max(1),
    conscientiousness: z.number().min(0).max(1),
    extraversion: z.number().min(0).max(1),
    agreeableness: z.number().min(0).max(1),
    neuroticism: z.number().min(0).max(1),
  }).optional().nullable(),
});

const reorderSchema = z.object({ photoIds: z.array(z.string()) });

const reportSchema = z.object({
  reason: z.enum(['inappropriate', 'fake', 'spam', 'harassment', 'other']),
  detail: z.string().max(1000).optional(),
});

const ratingSchema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

router.use(authMiddleware);

// Profile
router.get('/users/me', userController.getMe);
router.patch('/users/me', validate(updateSchema), userController.updateMe);
router.post('/users/me/photos', upload.single('photo'), userController.addPhoto);
router.delete('/users/me/photos/:id', userController.deletePhoto);
router.patch('/users/me/photos/reorder', validate(reorderSchema), userController.reorderPhotos);
router.get('/users/:id', userController.getUserById);

// P6: Block / Report / Rate
router.post('/blocks/:userId', blockReportController.blockUser);
router.delete('/blocks/:userId', blockReportController.unblockUser);
router.get('/blocks', blockReportController.getBlockedUsers);
router.post('/reports/:userId', validate(reportSchema), blockReportController.reportUser);
router.post('/ratings/:userId', validate(ratingSchema), blockReportController.rateUser);
router.get('/ratings/:userId', blockReportController.getUserRating);

// P0: Logout
router.post('/logout', userController.logout);

export default router;
