import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';

export async function getMessages(
  userId: string,
  matchId: string,
  cursor?: string,
  limit: number = 50
) {
  // Verify user is part of this match
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { user1Id: true, user2Id: true },
  });

  if (!match) throw new AppError(404, 'Match not found');
  if (match.user1Id !== userId && match.user2Id !== userId) {
    throw new AppError(403, 'Not authorized');
  }

  const messages = await prisma.message.findMany({
    where: {
      matchId,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      content: true,
      senderId: true,
      isRead: true,
      createdAt: true,
    },
  });

  const nextCursor = messages.length === limit
    ? messages[messages.length - 1].createdAt.toISOString()
    : null;

  return {
    messages: messages.reverse(),
    nextCursor,
  };
}

export async function sendMessage(
  senderId: string,
  matchId: string,
  content: string
) {
  // Verify sender is part of this match
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { user1Id: true, user2Id: true },
  });

  if (!match) throw new AppError(404, 'Match not found');
  if (match.user1Id !== senderId && match.user2Id !== senderId) {
    throw new AppError(403, 'Not authorized');
  }

  const message = await prisma.message.create({
    data: {
      content,
      matchId,
      senderId,
    },
    select: {
      id: true,
      content: true,
      senderId: true,
      isRead: true,
      createdAt: true,
    },
  });

  // Update lastMessageAt on the match
  await prisma.match.update({
    where: { id: matchId },
    data: { lastMessageAt: new Date() },
  });

  // Get recipient ID for socket notification
  const recipientId = match.user1Id === senderId ? match.user2Id : match.user1Id;

  return { message, recipientId };
}

export async function markAsRead(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true, matchId: true },
  });

  if (!message) throw new AppError(404, 'Message not found');
  if (message.senderId === userId) return; // Don't mark own messages as read

  await prisma.message.update({
    where: { id: messageId },
    data: { isRead: true },
  });
}
