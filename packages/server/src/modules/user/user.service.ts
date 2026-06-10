import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      photos: { orderBy: { order: 'asc' } },
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const { password, ...rest } = user;
  return rest;
}

export async function updateMe(
  userId: string,
  data: {
    nickname?: string;
    bio?: string;
    tags?: string[];
    gender?: string;
    interestedIn?: string;
    birthDate?: string;
    maxDistance?: number;
    minAge?: number;
    maxAge?: number;
  }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.nickname !== undefined && { nickname: data.nickname }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.gender !== undefined && { gender: data.gender as any }),
      ...(data.interestedIn !== undefined && { interestedIn: data.interestedIn as any }),
      ...(data.birthDate !== undefined && { birthDate: new Date(data.birthDate) }),
      ...(data.maxDistance !== undefined && { maxDistance: data.maxDistance }),
      ...(data.minAge !== undefined && { minAge: data.minAge }),
      ...(data.maxAge !== undefined && { maxAge: data.maxAge }),
    },
    include: { photos: { orderBy: { order: 'asc' } } },
  });

  const { password, ...rest } = user;
  return rest;
}

export async function addPhoto(userId: string, filename: string) {
  const count = await prisma.photo.count({ where: { userId } });
  if (count >= 6) {
    throw new AppError(400, 'Maximum 6 photos allowed');
  }

  const photo = await prisma.photo.create({
    data: {
      url: `/uploads/${filename}`,
      order: count,
      userId,
    },
  });

  return photo;
}

export async function deletePhoto(userId: string, photoId: string) {
  const photo = await prisma.photo.findFirst({
    where: { id: photoId, userId },
  });

  if (!photo) {
    throw new AppError(404, 'Photo not found');
  }

  await prisma.photo.delete({ where: { id: photoId } });
}

export async function reorderPhotos(userId: string, photoIds: string[]) {
  await prisma.$transaction(
    photoIds.map((id, index) =>
      prisma.photo.updateMany({
        where: { id, userId },
        data: { order: index },
      })
    )
  );
}

export async function getUserById(viewerId: string, targetId: string) {
  const user = await prisma.user.findUnique({
    where: { id: targetId },
    include: {
      photos: { orderBy: { order: 'asc' } },
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Check if viewer and target have matched
  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { user1Id: viewerId, user2Id: targetId },
        { user1Id: targetId, user2Id: viewerId },
      ],
    },
  });

  const { password, ...rest } = user;
  return {
    ...rest,
    isMatched: !!match,
  };
}
