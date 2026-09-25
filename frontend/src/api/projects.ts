import { apiClient } from './client';
import { Project, UploadStats, Feedback } from '../types';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>('/projects');
    return res.data;
  },

  getById: async (id: string): Promise<Project> => {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    return res.data;
  },

  create: async (name: string, description?: string, platform?: string): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects', { name, description, platform });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  uploadCsv: async (projectId: string, file: File): Promise<UploadStats> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<UploadStats>(
      `/projects/${projectId}/feedbacks/upload-csv`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  scrapeAppStore: async (projectId: string, appId: string, country: string = 'us'): Promise<UploadStats> => {
    const res = await apiClient.post<UploadStats>(
      `/projects/${projectId}/feedbacks/scrape-app-store`,
      { app_id: appId, country }
    );
    return res.data;
  },

  getFeedbacks: async (projectId: string, sentiment?: string): Promise<Feedback[]> => {
    const params = sentiment ? { sentiment } : {};
    const res = await apiClient.get<Feedback[]>(`/projects/${projectId}/feedbacks`, { params });
    return res.data;
  },
};
