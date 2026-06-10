import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import * as userService from './user.service.js';

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.getMe(req.userId!);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.updateMe(req.userId!, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function addPhoto(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const photo = await userService.addPhoto(req.userId!, req.file.filename);
    res.status(201).json(photo);
  } catch (err) {
    next(err);
  }
}

export async function deletePhoto(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await userService.deletePhoto(req.userId!, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function reorderPhotos(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await userService.reorderPhotos(req.userId!, req.body.photoIds);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function getUserById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.getUserById(req.userId!, req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
