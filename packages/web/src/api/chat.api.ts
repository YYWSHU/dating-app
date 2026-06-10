import { apiClient } from './client';
import type { Message, MessageResponse } from '../types';

export async function getMessages(
  matchId: string,
  cursor?: string,
  limit: number = 50
): Promise<MessageResponse> {
  const { data } = await apiClient.get(`/matches/${matchId}/messages`, {
    params: { cursor, limit },
  });
  return data;
}

export async function sendMessage(
  matchId: string,
  content: string
): Promise<{ message: Message; recipientId: string }> {
  const { data } = await apiClient.post(`/matches/${matchId}/messages`, { content });
  return data;
}

export async function markAsRead(messageId: string): Promise<void> {
  await apiClient.patch(`/messages/${messageId}/read`);
}
