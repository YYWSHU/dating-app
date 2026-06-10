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

// Likes visibility
export async function whoLikedMe(): Promise<any[]> {
  const { data } = await apiClient.get('/likes/received');
  return data;
}
export async function whoILiked(): Promise<any[]> {
  const { data } = await apiClient.get('/likes/given');
  return data;
}

// Recommender (AI)
export async function getMatchExplanation(targetUserId: string): Promise<{ explanation: string }> {
  const { data } = await apiClient.post('/recommender/match-explanation', { targetUserId });
  return data;
}
export async function getChatSuggestion(targetUserId: string, context?: string, recentMessages?: any[]): Promise<{ suggestions: string[] }> {
  const { data } = await apiClient.post('/recommender/chat-suggestion', { targetUserId, context, recentMessages });
  return data;
}
export async function getDailyPicks(): Promise<{ picks: any[] }> {
  const { data } = await apiClient.get('/recommender/daily-picks');
  return data;
}
export async function embedMe(): Promise<any> {
  const { data } = await apiClient.post('/recommender/embed-me');
  return data;
}
