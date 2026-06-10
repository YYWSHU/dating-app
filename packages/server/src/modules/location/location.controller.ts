import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import * as locationService from './location.service.js';

export async function updateLocation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { latitude, longitude } = req.body;
    const user = await locationService.updateLocation(
      req.userId!,
      latitude,
      longitude
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getNearbyUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const distance = parseInt(req.query.distance as string) || undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const users = await locationService.getNearbyUsers(
      req.userId!,
      distance,
      limit
    );
    res.json(users);
  } catch (err) {
    next(err);
  }
}
