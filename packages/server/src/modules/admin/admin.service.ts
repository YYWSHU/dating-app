import { prisma } from '../../lib/prisma.js';

export async function getStats() {
  const [users, matches, messages, reports, onlineToday] = await Promise.all([
    prisma.user.count(),
    prisma.match.count(),
    prisma.message.count(),
    prisma.report.count({ where: { status: 'pending' } }),
    prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 86400000) } } }),
  ]);

  const genderStats = await prisma.user.groupBy({
    by: ['gender'], _count: true,
  });

  const cityStats = await prisma.$queryRawUnsafe<Array<{ city: string; count: number }>>(
    `SELECT
      CASE
        WHEN latitude BETWEEN 39.5 AND 40.5 THEN 'Beijing'
        WHEN latitude BETWEEN 30.5 AND 32.0 THEN 'Shanghai'
        WHEN latitude BETWEEN 22.0 AND 23.0 THEN 'Shenzhen'
        WHEN latitude BETWEEN 29.5 AND 31.0 THEN 'Hangzhou'
        WHEN latitude BETWEEN 30.0 AND 31.0 THEN 'Chengdu'
        WHEN latitude BETWEEN 22.5 AND 23.5 THEN 'Guangzhou'
        ELSE 'Other'
      END as city,
      COUNT(*)::int as count
    FROM "User" GROUP BY city ORDER BY count DESC`
  );

  return {
    totalUsers: users,
    totalMatches: matches,
    totalMessages: messages,
    pendingReports: reports,
    onlineToday,
    genderDistribution: Object.fromEntries(genderStats.map((g) => [g.gender, g._count])),
    cityDistribution: cityStats,
  };
}

export async function listUsers(page = 1, limit = 20, search?: string) {
  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { nickname: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, nickname: true, gender: true,
        emailVerified: true, admin: true, isVip: true, campusEmail: true,
        createdAt: true, _count: { select: { photos: true, givenLikes: true, receivedLikes: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getUserDetail(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      photos: true,
      _count: { select: { givenLikes: true, receivedLikes: true, sentMessages: true, reports: true } },
    },
  });
}

export async function toggleAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { admin: true } });
  if (!user) throw new Error('User not found');
  return prisma.user.update({
    where: { id: userId },
    data: { admin: !user.admin },
    select: { id: true, nickname: true, admin: true },
  });
}

export async function deleteUser(userId: string) {
  return prisma.user.delete({ where: { id: userId } });
}

export async function listReports(page = 1, limit = 20) {
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, nickname: true, email: true } },
        reported: { select: { id: true, nickname: true, email: true } },
      },
    }),
    prisma.report.count(),
  ]);
  return { reports, total, page, totalPages: Math.ceil(total / limit) };
}

export async function resolveReport(reportId: string, status: string) {
  return prisma.report.update({
    where: { id: reportId },
    data: { status },
  });
}
