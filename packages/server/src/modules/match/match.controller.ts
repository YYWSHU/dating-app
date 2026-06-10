import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import * as matchService from './match.service.js';

export async function discover(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const users = await matchService.discover(req.userId!, limit);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function likeUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await matchService.likeUser(req.userId!, req.params.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function passUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await matchService.passUser(req.userId!, req.params.userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function getMatches(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const matches = await matchService.getMatches(req.userId!);
    res.json(matches);
  } catch (err) {
    next(err);
  }
}

export async function getMatchDetail(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const match = await matchService.getMatchDetail(req.userId!, req.params.matchId);
    res.json(match);
  } catch (err) {
    next(err);
  }
}
