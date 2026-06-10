import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import * as recClient from './recommender.client.js';
import { prisma } from '../../lib/prisma.js';

async function buildProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { questionnaire: true },
  });
  if (!user) return null;

  const age = Math.floor((Date.now() - new Date(user.birthDate).getTime()) / (365.25 * 86400000));
  return {
    id: user.id,
    gender: user.gender,
    age,
    bio: user.bio,
    tags: user.tags,
    mbti: user.mbti,
    bigFive: user.bigFive,
    city: user.latitude ? 'local' : 'unknown',
    questionnaire: user.questionnaire ? {
      attachmentLabel: user.questionnaire.attachmentLabel,
      loveLanguageLabel: user.questionnaire.loveLanguageLabel,
      conflictLabel: user.questionnaire.conflictLabel,
      lifeGoal: user.questionnaire.lifeGoal,
    } : null,
  };
}

export async function dailyPicks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const picks = await recClient.getDailyPicks(req.userId!);
    if (!picks?.picks?.length) {
      res.json({ picks: [], fallback: true });
      return;
    }
    // Fetch user details for picks
    const userIds = picks.picks.map((p: any) => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true, nickname: true, gender: true, birthDate: true,
        bio: true, tags: true, avatarUrl: true, mbti: true,
        photos: { take: 1, orderBy: { order: 'asc' } },
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    const result = picks.picks
      .map((p: any) => ({ ...p, user: userMap.get(p.userId) }))
      .filter((p: any) => p.user);

    res.json({ picks: result });
  } catch (err) { next(err); }
}

export async function matchExplanation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { targetUserId } = req.body;
    const [myProfile, theirProfile] = await Promise.all([
      buildProfile(req.userId!),
      buildProfile(targetUserId),
    ]);
    if (!myProfile || !theirProfile) {
      res.status(400).json({ error: 'User not found' });
      return;
    }
    const result = await recClient.getMatchExplanation(myProfile, theirProfile);
    res.json(result || { explanation: '你们有很多共同点！' });
  } catch (err) { next(err); }
}

export async function chatSuggestion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { targetUserId, context, recentMessages } = req.body;
    const [myProfile, theirProfile] = await Promise.all([
      buildProfile(req.userId!),
      buildProfile(targetUserId),
    ]);
    if (!myProfile || !theirProfile) {
      res.status(400).json({ error: 'User not found' });
      return;
    }
    const result = await recClient.getChatSuggestion(
      myProfile, theirProfile, context || 'first_message', recentMessages
    );
    res.json(result || { suggestions: ['Hi！很高兴认识你 😊'] });
  } catch (err) { next(err); }
}

export async function embedMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await buildProfile(req.userId!);
    if (!profile) { res.status(400).json({ error: 'User not found' }); return; }
    const result = await recClient.embedUser(req.userId!, profile);
    res.json(result || { status: 'recommender unavailable' });
  } catch (err) { next(err); }
}
