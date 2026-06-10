import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../stores/chat.store';
import type { Message } from '../types';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { addMessage, fetchMatches } = useChatStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('chat:receive', (data: Message & { matchId: string }) => {
      addMessage(data.matchId, data);
      // Also refresh matches to update last message
      fetchMatches();
    });

    socket.on('chat:sent', (data: Message & { matchId: string }) => {
      // Update the temp message with server-confirmed one
      addMessage(data.matchId, data);
    });

    socket.on('chat:error', (data: { error: string }) => {
      console.error('Chat error:', data.error);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((matchId: string, content: string) => {
    socketRef.current?.emit('chat:send', { matchId, content });
  }, []);

  const sendTyping = useCallback((matchId: string) => {
    socketRef.current?.emit('chat:typing', { matchId });
  }, []);

  const sendRead = useCallback((messageId: string) => {
    socketRef.current?.emit('chat:read', { messageId });
  }, []);

  return { sendMessage, sendTyping, sendRead };
}
