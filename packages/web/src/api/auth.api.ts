import { apiClient } from './client';
import type { AuthResponse, LoginInput, RegisterInput } from '../types';

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput): Promise<AuthResponse & { message: string }> {
  const { data } = await apiClient.post('/auth/register', input);
  return data;
}

export async function verifyEmail(code: string): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/verify-email', { code });
  return data;
}

export async function resendVerification(): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/resend-verification');
  return data;
}

export async function logout(refreshToken?: string): Promise<void> {
  await apiClient.post('/logout', { refreshToken });
}
