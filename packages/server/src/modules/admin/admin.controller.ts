import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import * as adminService from './admin.service.js';

export async function getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try { const stats = await adminService.getStats(); res.json(stats); } catch (err) { next(err); }
}
export async function listUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string;
    const result = await adminService.listUsers(page, limit, search);
    res.json(result);
  } catch (err) { next(err); }
}
export async function getUserDetail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try { const user = await adminService.getUserDetail(req.params.id); res.json(user); } catch (err) { next(err); }
}
export async function toggleAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try { const result = await adminService.toggleAdmin(req.params.id); res.json(result); } catch (err) { next(err); }
}
export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try { await adminService.deleteUser(req.params.id); res.status(204).end(); } catch (err) { next(err); }
}
export async function listReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await adminService.listReports(page);
    res.json(result);
  } catch (err) { next(err); }
}
export async function resolveReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try { const result = await adminService.resolveReport(req.params.id, req.body.status); res.json(result); } catch (err) { next(err); }
}
