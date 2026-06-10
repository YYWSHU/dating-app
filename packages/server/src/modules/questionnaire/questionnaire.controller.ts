import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import * as qService from './questionnaire.service.js';

export async function getQuestions(_req: AuthRequest, res: Response): Promise<void> {
  res.json({
    attachment: qService.ATTACHMENT_QUESTIONS,
    loveLanguage: qService.LOVE_LANGUAGE_QUESTIONS,
    conflict: qService.CONFLICT_QUESTIONS,
    communication: qService.COMMUNICATION_QUESTIONS,
    social: qService.SOCIAL_QUESTIONS,
    values: qService.VALUE_ITEMS,
  });
}

export async function submit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await qService.submitQuestionnaire(req.userId!, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getMyQuestionnaire(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = await qService.getQuestionnaire(req.userId!);
    if (!q) { res.status(404).json({ error: 'No questionnaire found' }); return; }
    res.json(q);
  } catch (err) { next(err); }
}
