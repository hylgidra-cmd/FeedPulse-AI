export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  platform?: string;
  created_at: string;
  feedbacks_count: number;
  clusters_count: number;
}

export interface Feedback {
  id: string;
  project_id: string;
  content: string;
  source: string;
  author_name?: string;
  rating?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  created_at: string;
}

export interface IssueCluster {
  id: string;
  project_id: string;
  title: string;
  root_cause: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact_percentage: number;
  jira_markdown?: string;
  is_resolved: boolean;
  created_at: string;
  feedback_count: number;
  sample_feedbacks: Feedback[];
}

export interface ProjectAnalysisSummary {
  project_id: string;
  total_feedbacks: number;
  negative_feedbacks: number;
  positive_feedbacks: number;
  neutral_feedbacks: number;
  clusters: IssueCluster[];
}

export interface UploadStats {
  total_parsed: number;
  total_inserted: number;
  ignored_short: number;
  message: string;
}
