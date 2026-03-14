import { request } from '@/shared/api';
import type { User } from './types';

export const authApi = {
  register: (email: string, password: string) =>
    request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),

  getMe: () => request<User>('/api/auth/me'),

  verifyEmail: (token: string) =>
    request<{ message: string }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email: string) =>
    request<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};
