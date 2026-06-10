import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';

// ===== Block =====
export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) throw new AppError(400, 'Cannot block yourself');
  try {
    await prisma.block.create({ data: { blockerId, blockedId } });
  } catch (err: any) {
    if (err.code === 'P2002') throw new AppError(409, 'Already blocked');
    throw err;
  }
  // Also remove any match between them
  const [u1, u2] = [blockerId, blockedId].sort();
  await prisma.match.deleteMany({
    where: { user1Id: u1, user2Id: u2 },
  });
}

export async function unblockUser(blockerId: string, blockedId: string) {
  await prisma.block.deleteMany({ where: { blockerId, blockedId } });
}

export async function getBlockedUsers(userId: string) {
  return prisma.block.findMany({
    where: { blockerId: userId },
    select: { blockedId: true, createdAt: true },
  });
}

// ===== Report =====
export async function reportUser(
  reporterId: string,
  reportedId: string,
  reason: string,
  detail?: string
) {
  if (reporterId === reportedId) throw new AppError(400, 'Cannot report yourself');
  await prisma.report.create({
    data: { reporterId, reportedId, reason, detail },
  });
}

// ===== Rating =====
export async function rateUser(raterId: string, ratedUserId: string, score: number, comment?: string) {
  if (score < 1 || score > 5) throw new AppError(400, 'Score must be 1-5');
  // Only allow rating matched users
  const [u1, u2] = [raterId, ratedUserId].sort();
  const match = await prisma.match.findUnique({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
  });
  if (!match) throw new AppError(403, 'Can only rate matched users');

  await prisma.userRating.upsert({
    where: { raterId_ratedUserId: { raterId, ratedUserId } },
    update: { score, comment },
    create: { raterId, ratedUserId, score, comment },
  });
}

export async function getUserRating(userId: string) {
  const ratings = await prisma.userRating.findMany({
    where: { ratedUserId: userId },
    select: { score: true },
  });
  if (ratings.length === 0) return { average: null, count: 0 };
  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
  return { average: Math.round(avg * 10) / 10, count: ratings.length };
}
