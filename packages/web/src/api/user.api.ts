import { apiClient } from './client';
import type { User, Photo } from '../types';

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get('/users/me');
  return data;
}

export async function updateMe(updates: Partial<User>): Promise<User> {
  const { data } = await apiClient.patch('/users/me', updates);
  return data;
}

export async function uploadPhoto(file: File): Promise<Photo> {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await apiClient.post('/users/me/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deletePhoto(photoId: string): Promise<void> {
  await apiClient.delete(`/users/me/photos/${photoId}`);
}

export async function reorderPhotos(photoIds: string[]): Promise<void> {
  await apiClient.patch('/users/me/photos/reorder', { photoIds });
}

export async function getUserById(userId: string): Promise<any> {
  const { data } = await apiClient.get(`/users/${userId}`);
  return data;
}
