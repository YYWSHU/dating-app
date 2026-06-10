import { apiClient } from './client';
import type { DiscoverUser, MatchItem } from '../types';

export async function discover(limit: number = 20): Promise<DiscoverUser[]> {
  const { data } = await apiClient.get('/discover', { params: { limit } });
  return data;
}

export async function likeUser(userId: string): Promise<{ isMatch: boolean }> {
  const { data } = await apiClient.post(`/likes/${userId}`);
  return data;
}

export async function superLikeUser(userId: string): Promise<{ isMatch: boolean }> {
  const { data } = await apiClient.post(`/superlikes/${userId}`);
  return data;
}

export async function passUser(userId: string): Promise<void> {
  await apiClient.delete(`/likes/${userId}`);
}

export async function undoLastPass(): Promise<{ undoneUserId: string }> {
  const { data } = await apiClient.post('/undo-pass');
  return data;
}

export async function getMatches(): Promise<MatchItem[]> {
  const { data } = await apiClient.get('/matches');
  return data;
}

export async function getMatchDetail(matchId: string): Promise<MatchItem> {
  const { data } = await apiClient.get(`/matches/${matchId}`);
  return data;
}

// P6: Block / Report / Rate
export async function blockUser(userId: string): Promise<void> {
  await apiClient.post(`/blocks/${userId}`);
}
export async function unblockUser(userId: string): Promise<void> {
  await apiClient.delete(`/blocks/${userId}`);
}
export async function reportUser(userId: string, reason: string, detail?: string): Promise<void> {
  await apiClient.post(`/reports/${userId}`, { reason, detail });
}
export async function rateUser(userId: string, score: number, comment?: string): Promise<void> {
  await apiClient.post(`/ratings/${userId}`, { score, comment });
}
export async function getUserRating(userId: string): Promise<{ average: number | null; count: number }> {
  const { data } = await apiClient.get(`/ratings/${userId}`);
  return data;
}
