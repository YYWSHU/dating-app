import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import * as chatService from './chat.service.js';

export async function getMessages(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const result = await chatService.getMessages(
      req.userId!,
      req.params.matchId,
      cursor,
      limit
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { content } = req.body;
    const result = await chatService.sendMessage(
      req.userId!,
      req.params.matchId,
      content
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await chatService.markAsRead(req.params.id, req.userId!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
