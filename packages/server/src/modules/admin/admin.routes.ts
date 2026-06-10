import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { adminMiddleware } from '../../middleware/admin.js';

const router = Router();
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/admin/stats', adminController.getStats);
router.get('/admin/users', adminController.listUsers);
router.get('/admin/users/:id', adminController.getUserDetail);
router.put('/admin/users/:id/toggle-admin', adminController.toggleAdmin);
router.delete('/admin/users/:id', adminController.deleteUser);
router.get('/admin/reports', adminController.listReports);
router.put('/admin/reports/:id', adminController.resolveReport);

export default router;
