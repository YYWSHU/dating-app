import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../../lib/jwt.js';
import * as chatService from './chat.service.js';

interface AuthSocket extends Socket {
  userId?: string;
}

export function setupChatSocket(io: Server): void {
  // Auth middleware for socket connections
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    console.log(`User ${userId} connected via socket`);

    // Join a room named after the user's ID for direct messaging
    socket.join(`user:${userId}`);

    // Handle sending a message
    socket.on('chat:send', async (data: { matchId: string; content: string }) => {
      try {
        const result = await chatService.sendMessage(userId, data.matchId, data.content);

        // Emit to the recipient's room
        io.to(`user:${result.recipientId}`).emit('chat:receive', {
          ...result.message,
          matchId: data.matchId,
        });

        // Emit confirmation back to sender
        socket.emit('chat:sent', {
          ...result.message,
          matchId: data.matchId,
        });
      } catch (error: any) {
        socket.emit('chat:error', { error: error.message });
      }
    });

    // Handle typing indicator
    socket.on('chat:typing', (data: { matchId: string }) => {
      socket.broadcast.emit('chat:typing', {
        matchId: data.matchId,
        userId,
      });
    });

    // Handle marking messages as read
    socket.on('chat:read', async (data: { messageId: string }) => {
      try {
        await chatService.markAsRead(data.messageId, userId);
        socket.broadcast.emit('chat:read', {
          messageId: data.messageId,
          userId,
        });
      } catch (error: any) {
        socket.emit('chat:error', { error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });
}
