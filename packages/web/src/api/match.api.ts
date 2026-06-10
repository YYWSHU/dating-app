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

export async function passUser(userId: string): Promise<void> {
  await apiClient.delete(`/likes/${userId}`);
}

export async function getMatches(): Promise<MatchItem[]> {
  const { data } = await apiClient.get('/matches');
  return data;
}

export async function getMatchDetail(matchId: string): Promise<MatchItem> {
  const { data } = await apiClient.get(`/matches/${matchId}`);
  return data;
}
