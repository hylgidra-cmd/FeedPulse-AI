import { apiClient } from './client';
import { Project, UploadStats, Feedback, WebsiteInspectResponse } from '../types';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>('/projects');
    return res.data;
  },

  getById: async (id: string): Promise<Project> => {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    return res.data;
  },

  create: async (
    name: string,
    description?: string,
    platform?: string,
    website_url?: string
  ): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects', {
      name,
      description,
      platform,
      website_url,
    });
    return res.data;
  },

  inspectWebsite: async (url: string): Promise<WebsiteInspectResponse> => {
    const res = await apiClient.post<WebsiteInspectResponse>('/projects/inspect-website', { url });
    return res.data;
  },

  seedDemo: async (): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects/seed-demo');
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

  scrapeAppStore: async (
    projectId: string,
    appId: string,
    country: string = 'us',
    appName?: string,
    replaceExisting: boolean = true
  ): Promise<UploadStats> => {
    const res = await apiClient.post<UploadStats>(
      `/projects/${projectId}/feedbacks/scrape-app-store`,
      {
        app_id: appId,
        country,
        app_name: appName,
        replace_existing: replaceExisting,
      }
    );
    return res.data;
  },

  clearFeedbacks: async (projectId: string): Promise<{ message: string; deleted_count: number }> => {
    const res = await apiClient.delete<{ message: string; deleted_count: number }>(
      `/projects/${projectId}/feedbacks/clear`
    );
    return res.data;
  },

  getFeedbacks: async (projectId: string, sentiment?: string): Promise<Feedback[]> => {
    const params = sentiment ? { sentiment } : {};
    const res = await apiClient.get<Feedback[]>(`/projects/${projectId}/feedbacks`, { params });
    return res.data;
  },
};
