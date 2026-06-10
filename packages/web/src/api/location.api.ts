import { apiClient } from './client';

export async function updateLocation(latitude: number, longitude: number): Promise<void> {
  await apiClient.patch('/users/me/location', { latitude, longitude });
}

export async function getNearbyUsers(
  distance?: number,
  limit?: number
): Promise<any[]> {
  const { data } = await apiClient.get('/nearby', { params: { distance, limit } });
  return data;
}
