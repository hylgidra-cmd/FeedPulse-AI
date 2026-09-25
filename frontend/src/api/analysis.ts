import { apiClient } from './client';
import { IssueCluster, ProjectAnalysisSummary } from '../types';

export const analysisApi = {
  triggerAnalysis: async (projectId: string): Promise<IssueCluster[]> => {
    const res = await apiClient.post<IssueCluster[]>(`/projects/${projectId}/analysis/trigger`);
    return res.data;
  },

  getClusters: async (projectId: string): Promise<ProjectAnalysisSummary> => {
    const res = await apiClient.get<ProjectAnalysisSummary>(`/projects/${projectId}/analysis/clusters`);
    return res.data;
  },
};
