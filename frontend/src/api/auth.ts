import { apiClient } from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      return res.data;
    } catch (err: any) {
      // If unauthorized or user does not exist in SQLite, auto-register on the fly
      if (err?.response?.status === 401 || err?.response?.status === 404 || err?.response?.status === 400) {
        try {
          const name = email.split('@')[0];
          await apiClient.post('/auth/register', { email, password, full_name: name });
          const retryRes = await apiClient.post<AuthResponse>('/auth/login', { email, password });
          return retryRes.data;
        } catch {
          // If re-login fails (e.g. email exists with different password), throw original error
          throw err;
        }
      }
      throw err;
    }
  },

  demoLogin: async (): Promise<AuthResponse> => {
    // Try demo login endpoint first; if not yet deployed, login/register demo user
    try {
      const res = await apiClient.post<AuthResponse>('/auth/demo-login');
      return res.data;
    } catch {
      return authApi.login('demo@feedpulse.ai', 'demo12345');
    }
  },

  register: async (email: string, password: string, full_name?: string): Promise<User> => {
    const res = await apiClient.post<User>('/auth/register', { email, password, full_name });
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};
