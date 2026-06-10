import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from './error.js';

export async function adminMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { admin: true },
    });
    if (!user?.admin) return next(new AppError(403, 'Admin access required'));
    next();
  } catch (err) {
    next(err);
  }
}
