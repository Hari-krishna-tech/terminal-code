import apiClient from './client';
import type { User, TokenRefreshResponse } from '../types/auth';

export async function refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
  const { data } = await apiClient.post<TokenRefreshResponse>('/auth/refresh', { refreshToken });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
}
