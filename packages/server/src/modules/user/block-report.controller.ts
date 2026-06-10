import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import * as brService from './block-report.service.js';

export async function blockUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try { await brService.blockUser(req.userId!, req.params.userId); res.status(204).end(); } catch (err) { next(err); }
}
export async function unblockUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try { await brService.unblockUser(req.userId!, req.params.userId); res.status(204).end(); } catch (err) { next(err); }
}
export async function getBlockedUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try { const blocks = await brService.getBlockedUsers(req.userId!); res.json(blocks); } catch (err) { next(err); }
}
export async function reportUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await brService.reportUser(req.userId!, req.params.userId, req.body.reason, req.body.detail);
    res.status(201).json({ message: 'Report submitted' });
  } catch (err) { next(err); }
}
export async function rateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await brService.rateUser(req.userId!, req.params.userId, req.body.score, req.body.comment);
    res.json({ message: 'Rating submitted' });
  } catch (err) { next(err); }
}
export async function getUserRating(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try { const r = await brService.getUserRating(req.params.userId); res.json(r); } catch (err) { next(err); }
}
