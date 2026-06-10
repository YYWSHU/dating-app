import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import { Prisma } from '@prisma/client';

// ===== P1: Matching Algorithm =====

// MBTI compatibility matrix (0-100 scale)
const MBTI_MATRIX: Record<string, Record<string, number>> = {
  INTJ: { ENFP: 95, ENTP: 90, INFJ: 85, INTP: 80, ENTJ: 75, ENFJ: 70, ISTJ: 65, ESTJ: 60, INFP: 55, ISFJ: 50, ESFJ: 45, ESTP: 40, ISTP: 35, ISFP: 30, ESFP: 25 },
  INTP: { ENTJ: 95, ENTP: 90, INFJ: 85, INTJ: 80, ENFJ: 75, ENFP: 70, ISTJ: 65, ESTJ: 60, INFP: 55, ISFJ: 50, ESFJ: 45, ESTP: 40, ISTP: 35, ISFP: 30, ESFP: 25 },
  INFJ: { ENTP: 95, ENFP: 90, INTJ: 85, INFP: 80, ENTJ: 75, ENFJ: 70, ISTJ: 65, ESTJ: 60, INTP: 55, ISFJ: 50, ESFJ: 45, ESTP: 40, ISTP: 35, ISFP: 30, ESFP: 25 },
  INFP: { ENFJ: 95, ENFP: 90, INFJ: 85, INTJ: 80, ENTJ: 75, ENTP: 70, ISTJ: 65, ESTJ: 60, INTP: 55, ISFJ: 50, ESFJ: 45, ESTP: 40, ISTP: 35, ISFP: 30, ESFP: 25 },
  ENTP: { INFJ: 95, INTJ: 90, INTP: 85, ENFP: 80, ENTJ: 75, ENFJ: 70, ISTJ: 65, ESTJ: 60, INFP: 55, ISFJ: 50, ESFJ: 45, ESTP: 40, ISTP: 35, ISFP: 30, ESFP: 25 },
  ENFP: { INTJ: 95, INFJ: 90, INFP: 85, ENTP: 80, ENTJ: 75, ENFJ: 70, ISTJ: 65, ESTJ: 60, INTP: 55, ISFJ: 50, ESFJ: 45, ESTP: 40, ISTP: 35, ISFP: 30, ESFP: 25 },
  ENTJ: { INTP: 95, INFP: 90, INTJ: 85, ENTP: 80, INFJ: 75, ENFJ: 70, ISTJ: 65, ESTJ: 60, ENFP: 55, ISFJ: 50, ESFJ: 45, ESTP: 40, ISTP: 35, ISFP: 30, ESFP: 25 },
  ENFJ: { INFP: 95, INFJ: 90, ENFP: 85, ENTJ: 80, INTJ: 75, ENTP: 70, ISTJ: 65, ESTJ: 60, INTP: 55, ISFJ: 50, ESFJ: 45, ESTP: 40, ISTP: 35, ISFP: 30, ESFP: 25 },
  ISTJ: { ESFP: 85, ESTP: 80, ISFJ: 75, INTJ: 70, INTP: 65, INFJ: 60, ISTP: 55, INFP: 50, ESTJ: 45, ENTP: 40, ENFP: 35, ENTJ: 30, ENFJ: 25, ESFJ: 20, ISFP: 15 },
  ISFJ: { ESTP: 85, ESFP: 80, ISTJ: 75, INFJ: 70, INTJ: 65, INFP: 60, ISFP: 55, INTP: 50, ESTJ: 45, ENFP: 40, ENTP: 35, ENTJ: 30, ENFJ: 25, ESFJ: 20, ISTP: 15 },
  ESTJ: { ISFP: 85, ISTP: 80, ESFJ: 75, INTJ: 70, INTP: 65, INFJ: 60, ESTP: 55, INFP: 50, ISTJ: 45, ENTP: 40, ENFP: 35, ENTJ: 30, ENFJ: 25, ESFP: 20, ISFJ: 15 },
  ESFJ: { ISTP: 85, ISFP: 80, ESTJ: 75, INFJ: 70, INTJ: 65, INFP: 60, ESFP: 55, INTP: 50, ISFJ: 45, ENFP: 40, ENTP: 35, ENTJ: 30, ENFJ: 25, ESTP: 20, ISTJ: 15 },
  ISTP: { ESFJ: 85, ESTJ: 80, ISFP: 75, INTP: 70, INTJ: 65, INFJ: 60, ISTJ: 55, INFP: 50, ESTP: 45, ENFJ: 40, ENFP: 35, ENTJ: 30, ENTP: 25, ESFP: 20, ISFJ: 15 },
  ISFP: { ESTJ: 85, ESFJ: 80, ISTP: 75, INFP: 70, INTJ: 65, INFJ: 60, ISFJ: 55, INTP: 50, ESFP: 45, ENFJ: 40, ENFP: 35, ENTJ: 30, ENTP: 25, ESTP: 20, ISTJ: 15 },
  ESTP: { ISFJ: 85, ISTJ: 80, ESFP: 75, ENTP: 70, INTJ: 65, INFJ: 60, ESTJ: 55, INTP: 50, ISTP: 45, ENFJ: 40, ENFP: 35, ENTJ: 30, INFP: 25, ESFJ: 20, ISFP: 15 },
  ESFP: { ISTJ: 85, ISFJ: 80, ESTP: 75, ENFP: 70, INTJ: 65, INFJ: 60, ESFJ: 55, INTP: 50, ISFP: 45, ENFJ: 40, INFP: 35, ENTJ: 30, ENTP: 25, ESTJ: 20, ISTP: 15 },
};

function getMbtiScore(a: string | null, b: string | null): number {
  if (!a || !b) return 0.5; // neutral if not provided
  if (a === b) return 0.7;
  return (MBTI_MATRIX[a]?.[b] || 50) / 100;
}

// Cosine similarity for Big Five arrays
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0.5;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] || 0) * (b[i] || 0);
    normA += (a[i] || 0) ** 2;
    normB += (b[i] || 0) ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function getBigFiveScore(bigFiveA: any, bigFiveB: any): number {
  if (!bigFiveA || !bigFiveB) return 0.5;
  try {
    const a = typeof bigFiveA === 'string' ? JSON.parse(bigFiveA) : bigFiveA;
    const b = typeof bigFiveB === 'string' ? JSON.parse(bigFiveB) : bigFiveB;
    const keys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const vecA = keys.map((k) => a[k] ?? a[k.charAt(0).toUpperCase() + k.slice(1)] ?? 0.5);
    const vecB = keys.map((k) => b[k] ?? b[k.charAt(0).toUpperCase() + k.slice(1)] ?? 0.5);
    return cosineSimilarity(vecA, vecB);
  } catch {
    return 0.5;
  }
}

// Jaccard similarity for tags
function getTagsScore(tagsA: string[], tagsB: string[]): number {
  if (tagsA.length === 0 || tagsB.length === 0) return 0.5;
  const setA = new Set(tagsA.map((t) => t.toLowerCase()));
  const setB = new Set(tagsB.map((t) => t.toLowerCase()));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

// P1: Composite match score
async function getMatchScore(me: any, other: any): Promise<number> {
  const mbtiScore = getMbtiScore(me.mbti, other.mbti);
  const bigFiveScore = getBigFiveScore(me.bigFive, other.bigFive);
  const tagsScore = getTagsScore(me.tags || [], other.tags || []);

  // Psychology questionnaire compatibility
  let psychScore = 0.5;
  try {
    const { getQuestionnaire, getQuestionnaireCompatibility } = await import('../questionnaire/questionnaire.service.js');
    const [myQ, otherQ] = await Promise.all([
      getQuestionnaire(me.id),
      getQuestionnaire(other.id),
    ]);
    psychScore = getQuestionnaireCompatibility(myQ, otherQ);
  } catch { /* questionnaire module not available */ }

  // 15% MBTI + 20% Big5 + 35% Tags + 30% Psychology
  return mbtiScore * 0.15 + bigFiveScore * 0.20 + tagsScore * 0.35 + psychScore * 0.30;
}

// ===== Discover =====

export async function discover(userId: string, limit: number = 20) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      gender: true, interestedIn: true, latitude: true, longitude: true,
      maxDistance: true, minAge: true, maxAge: true,
      mbti: true, bigFive: true, tags: true,
    },
  });
  if (!me) throw new AppError(404, 'User not found');

  // P6: Get blocked users (both directions)
  const blockedIds = await prisma.block.findMany({
    where: { blockerId: userId },
    select: { blockedId: true },
  });
  const blockedMeIds = await prisma.block.findMany({
    where: { blockedId: userId },
    select: { blockerId: true },
  });

  const interactedIds = await prisma.like.findMany({
    where: { likerId: userId },
    select: { likedId: true },
  });
  const excludeIds = [
    userId,
    ...interactedIds.map((l) => l.likedId),
    ...blockedIds.map((b) => b.blockedId),
    ...blockedMeIds.map((b) => b.blockerId),
  ];

  const now = new Date();
  const maxBirthDate = new Date(now.getFullYear() - me.minAge, now.getMonth(), now.getDate());
  const minBirthDate = new Date(now.getFullYear() - me.maxAge, now.getMonth(), now.getDate());

  let interestedGenders: string[];
  if (me.interestedIn === 'both') {
    interestedGenders = ['male', 'female'];
  } else {
    interestedGenders = [me.interestedIn];
  }

  const where: Prisma.UserWhereInput = {
    id: { notIn: excludeIds },
    gender: { in: interestedGenders },
    birthDate: { gte: minBirthDate, lte: maxBirthDate },
  };

  const users = await prisma.user.findMany({
    where,
    take: limit * 3, // fetch more for re-scoring
    select: {
      id: true, nickname: true, gender: true, birthDate: true,
      bio: true, tags: true, avatarUrl: true, mbti: true, bigFive: true,
      latitude: true, longitude: true,
      photos: { take: 1, orderBy: { order: 'asc' } },
    },
  });

  // P1: Score (async for questionnaire), sort, and limit
  const now2 = new Date();
  const scored = await Promise.all(users.map(async (u) => ({
    ...u,
    age: Math.floor((now2.getTime() - new Date(u.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
    matchScore: await getMatchScore(me, u),
  })));

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}

// ===== Like / Super Like =====

export async function likeUser(likerId: string, likedId: string, type: 'like' | 'superlike' = 'like') {
  if (likerId === likedId) throw new AppError(400, 'Cannot like yourself');

  const target = await prisma.user.findUnique({
    where: { id: likedId }, select: { id: true },
  });
  if (!target) throw new AppError(404, 'User not found');

  // P1: Daily quota check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const me = await prisma.user.findUnique({
    where: { id: likerId },
    select: { dailyLikeCount: true, dailyLikeDate: true, dailySuperLikeCount: true, dailySuperLikeDate: true, isVip: true },
  });

  const dailyLikeMax = me?.isVip ? 999 : 20;
  const dailySuperLikeMax = me?.isVip ? 999 : 3;

  if (type === 'like') {
    if (me?.dailyLikeDate && new Date(me.dailyLikeDate) >= today && (me.dailyLikeCount || 0) >= dailyLikeMax) {
      throw new AppError(429, `Daily like limit (${dailyLikeMax}) reached. Upgrade to VIP for unlimited likes!`);
    }
  } else {
    if (me?.dailySuperLikeDate && new Date(me.dailySuperLikeDate) >= today && (me.dailySuperLikeCount || 0) >= dailySuperLikeMax) {
      throw new AppError(429, `Daily super like limit (${dailySuperLikeMax}) reached.`);
    }
  }

  // Create like
  let isMatch = false;
  try {
    await prisma.like.create({
      data: { likerId, likedId, type },
    });
  } catch (err: any) {
    if (err.code === 'P2002') throw new AppError(409, 'Already liked this user');
    throw err;
  }

  // Update daily count
  if (type === 'like') {
    await prisma.user.upsert({
      where: { id: likerId },
      update: {
        dailyLikeCount: me?.dailyLikeDate && new Date(me.dailyLikeDate) >= today ? (me.dailyLikeCount || 0) + 1 : 1,
        dailyLikeDate: today,
      },
      create: { id: likerId } as any,
    });
    // Actually just update:
    await prisma.user.update({
      where: { id: likerId },
      data: {
        dailyLikeCount: me?.dailyLikeDate && new Date(me.dailyLikeDate) >= today ? (me.dailyLikeCount || 0) + 1 : 1,
        dailyLikeDate: today,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: likerId },
      data: {
        dailySuperLikeCount: me?.dailySuperLikeDate && new Date(me.dailySuperLikeDate) >= today ? (me.dailySuperLikeCount || 0) + 1 : 1,
        dailySuperLikeDate: today,
      },
    });
  }

  // Check reciprocal
  const reciprocalLike = await prisma.like.findUnique({
    where: { likerId_likedId: { likerId: likedId, likedId: likerId } },
  });

  if (reciprocalLike) {
    const [user1Id, user2Id] = [likerId, likedId].sort();
    try {
      await prisma.match.create({
        data: { user1Id, user2Id },
      });
    } catch (matchErr: any) {
      if (matchErr.code !== 'P2002') throw matchErr;
    }
    isMatch = true;
  }

  // P1: Remove from pass records if exists (undo-pass scenario)
  await prisma.passRecord.deleteMany({ where: { passerId: likerId, passedId: likedId } });

  return { isMatch };
}

// ===== Pass / Undo =====

export async function passUser(likerId: string, likedId: string) {
  await prisma.like.deleteMany({ where: { likerId, likedId } });
  // Record pass for potential undo
  try {
    await prisma.passRecord.create({ data: { passerId: likerId, passedId: likedId } });
  } catch { /* already passed */ }
}

export async function undoLastPass(userId: string) {
  const lastPass = await prisma.passRecord.findFirst({
    where: { passerId: userId },
    orderBy: { createdAt: 'desc' },
  });
  if (!lastPass) throw new AppError(404, 'No pass to undo');
  await prisma.passRecord.delete({ where: { id: lastPass.id } });
  return { undoneUserId: lastPass.passedId };
}

// ===== Likes visibility =====

export async function whoLikedMe(userId: string) {
  const likes = await prisma.like.findMany({
    where: { likedId: userId },
    include: {
      liker: {
        select: { id: true, nickname: true, gender: true, birthDate: true, bio: true, tags: true, avatarUrl: true, mbti: true, photos: { take: 1, orderBy: { order: 'asc' } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Check which ones are already matched
  const matches = await prisma.match.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    select: { user1Id: true, user2Id: true },
  });
  const matchedIds = new Set(matches.flatMap((m) => [m.user1Id, m.user2Id]));

  const now = new Date();
  return likes.map((l) => ({
    ...l.liker,
    age: Math.floor((now.getTime() - new Date(l.liker.birthDate).getTime()) / (365.25 * 86400000)),
    likeType: l.type,
    likedAt: l.createdAt,
    isMatched: matchedIds.has(l.liker.id),
  }));
}

export async function whoILiked(userId: string) {
  const likes = await prisma.like.findMany({
    where: { likerId: userId },
    include: {
      liked: {
        select: { id: true, nickname: true, gender: true, birthDate: true, bio: true, tags: true, avatarUrl: true, mbti: true, photos: { take: 1, orderBy: { order: 'asc' } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  return likes.map((l) => ({
    ...l.liked,
    age: Math.floor((now.getTime() - new Date(l.liked.birthDate).getTime()) / (365.25 * 86400000)),
    likeType: l.type,
    likedAt: l.createdAt,
  }));
}

// ===== Matches =====

export async function getMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    include: {
      user1: {
        select: { id: true, nickname: true, avatarUrl: true, photos: { take: 1, orderBy: { order: 'asc' } } },
      },
      user2: {
        select: { id: true, nickname: true, avatarUrl: true, photos: { take: 1, orderBy: { order: 'asc' } } },
      },
      messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, createdAt: true, isRead: true, senderId: true } },
    },
    orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
  });

  const mapped = await Promise.all(matches.map(async (m) => {
    const isUser1 = m.user1.id === userId;
    const matchedUser = isUser1 ? m.user2 : m.user1;
    const lastMessage = m.messages[0] || null;

    // Check if this match came from a superlike
    const superLike = await prisma.like.findFirst({
      where: {
        OR: [
          { likerId: matchedUser.id, likedId: userId, type: 'superlike' },
          { likerId: userId, likedId: matchedUser.id, type: 'superlike' },
        ],
      },
      select: { type: true, likerId: true },
    });

    return {
      matchId: m.id,
      user: matchedUser,
      lastMessage: lastMessage ? {
        content: lastMessage.content, createdAt: lastMessage.createdAt,
        isRead: lastMessage.isRead, isMine: lastMessage.senderId === userId,
      } : null,
      matchDate: m.matchDate,
      createdAt: m.createdAt,
      isSuperLike: !!superLike,
      superLikedByOther: superLike?.likerId !== userId,
    };
  }));

  // Sort: superlikes first, then by lastMessageAt
  mapped.sort((a, b) => {
    if (a.isSuperLike && !b.isSuperLike) return -1;
    if (!a.isSuperLike && b.isSuperLike) return 1;
    return 0; // preserve original order otherwise
  });

  return mapped;
}

export async function getMatchDetail(userId: string, matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      user1: { select: { id: true, nickname: true, avatarUrl: true } },
      user2: { select: { id: true, nickname: true, avatarUrl: true } },
    },
  });
  if (!match) throw new AppError(404, 'Match not found');
  if (match.user1Id !== userId && match.user2Id !== userId) throw new AppError(403, 'Not authorized');
  const matchedUser = match.user1Id === userId ? match.user2 : match.user1;
  return { matchId: match.id, user: matchedUser, matchDate: match.matchDate, createdAt: match.createdAt };
}
