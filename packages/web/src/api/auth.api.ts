import { apiClient } from './client';
import type { AuthResponse, LoginInput, RegisterInput } from '../types';

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/register', input);
  return data;
}

export async function refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  const { data } = await apiClient.post('/auth/refresh', { refreshToken: token });
  return data;
}
