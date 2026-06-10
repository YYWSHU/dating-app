import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import { Prisma } from '@prisma/client';

export async function discover(userId: string, limit: number = 20) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      gender: true,
      interestedIn: true,
      latitude: true,
      longitude: true,
      maxDistance: true,
      minAge: true,
      maxAge: true,
    },
  });

  if (!me) throw new AppError(404, 'User not found');

  // Get IDs of users already liked or passed
  const interactedIds = await prisma.like.findMany({
    where: { likerId: userId },
    select: { likedId: true },
  });
  const excludeIds = [userId, ...interactedIds.map((l) => l.likedId)];

  // Calculate age range
  const now = new Date();
  const maxBirthDate = new Date(now.getFullYear() - me.minAge, now.getMonth(), now.getDate());
  const minBirthDate = new Date(now.getFullYear() - me.maxAge, now.getMonth(), now.getDate());

  // Determine which genders to show
  let interestedGenders: string[];
  if (me.interestedIn === 'both') {
    interestedGenders = ['male', 'female'];
  } else {
    interestedGenders = [me.interestedIn];
  }

  // Build where clause
  const where: Prisma.UserWhereInput = {
    id: { notIn: excludeIds },
    gender: { in: interestedGenders },
    birthDate: {
      gte: minBirthDate,
      lte: maxBirthDate,
    },
  };

  // If user has location, sort by distance (simple approach - sort by lat/lng proximity)
  let orderBy: Prisma.UserOrderByWithRelationInput[] = [];

  if (me.latitude && me.longitude) {
    // Simple approximation: sort by absolute difference in coordinates
    // For production, use PostGIS ST_Distance with a raw query
    orderBy = [{ createdAt: 'desc' }];
  } else {
    orderBy = [{ createdAt: 'desc' }];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy,
    take: limit,
    select: {
      id: true,
      nickname: true,
      gender: true,
      birthDate: true,
      bio: true,
      tags: true,
      avatarUrl: true,
      latitude: me.latitude ? true : false,
      longitude: me.longitude ? true : false,
      photos: {
        take: 1,
        orderBy: { order: 'asc' },
      },
    },
  });

  return users.map((u) => ({
    ...u,
    age: Math.floor((now.getTime() - new Date(u.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
  }));
}

export async function likeUser(likerId: string, likedId: string) {
  if (likerId === likedId) {
    throw new AppError(400, 'Cannot like yourself');
  }

  // Check if target exists
  const target = await prisma.user.findUnique({
    where: { id: likedId },
    select: { id: true },
  });
  if (!target) throw new AppError(404, 'User not found');

  // Create the like
  let isMatch = false;
  try {
    await prisma.like.create({
      data: { likerId, likedId },
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      throw new AppError(409, 'Already liked this user');
    }
    throw err;
  }

  // Check if the other user also liked me (mutual match)
  const reciprocalLike = await prisma.like.findUnique({
    where: {
      likerId_likedId: {
        likerId: likedId,
        likedId: likerId,
      },
    },
  });

  if (reciprocalLike) {
    // Create a match - ensure user1Id < user2Id for consistency
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

  return { isMatch };
}

export async function passUser(likerId: string, likedId: string) {
  // Remove the like if it exists
  await prisma.like.deleteMany({
    where: { likerId, likedId },
  });
}

export async function getMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    include: {
      user1: {
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
          photos: { take: 1, orderBy: { order: 'asc' } },
        },
      },
      user2: {
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
          photos: { take: 1, orderBy: { order: 'asc' } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: {
          content: true,
          createdAt: true,
          isRead: true,
          senderId: true,
        },
      },
    },
    orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
  });

  return matches.map((m) => {
    const isUser1 = m.user1.id === userId;
    const matchedUser = isUser1 ? m.user2 : m.user1;
    const lastMessage = m.messages[0] || null;

    return {
      matchId: m.id,
      user: matchedUser,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isRead: lastMessage.isRead,
            isMine: lastMessage.senderId === userId,
          }
        : null,
      createdAt: m.createdAt,
    };
  });
}

export async function getMatchDetail(userId: string, matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      user1: {
        select: { id: true, nickname: true, avatarUrl: true },
      },
      user2: {
        select: { id: true, nickname: true, avatarUrl: true },
      },
    },
  });

  if (!match) throw new AppError(404, 'Match not found');
  if (match.user1Id !== userId && match.user2Id !== userId) {
    throw new AppError(403, 'Not authorized');
  }

  const matchedUser = match.user1Id === userId ? match.user2 : match.user1;
  return {
    matchId: match.id,
    user: matchedUser,
    createdAt: match.createdAt,
  };
}
