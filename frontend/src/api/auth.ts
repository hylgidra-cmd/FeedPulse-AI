import { apiClient } from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 404) {
        try {
          await apiClient.post<User>('/auth/register', {
            email,
            password,
            full_name: email.split('@')[0],
          });
          const retryRes = await apiClient.post<AuthResponse>('/auth/login', { email, password });
          return retryRes.data;
        } catch {
          throw err;
        }
      }
      throw err;
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
