import axiosInstance from "@/lib/axios";

export interface AgentConfig {
  id?: number;
  userId?: number;
  isAutoApplyEnabled: boolean;
  minMatchPercentage: number;
  maxApplicationsPerDay: number;
  targetRoles: string[];
  preferredLocations: string[];
  preferredJobTypes: string[];
  includeKeywords: string[];
  excludeKeywords: string[];
  autoTailorResume: boolean;
  lastRunAt?: string;
}

export interface JobMatch {
  id: number;
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  employmentType?: string;
  description?: string;
  link?: string;
  postedDate?: string;
  expiresAt?: string;
  hasApplied: boolean;
  applicationStatus: string;
  matchScore: number;
}

export interface AutoApplyLog {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  jobLink?: string;
  submissionMode: string;
  status: string;
  matchScore: number;
  coverLetter?: string;
  screenerAnswers?: Record<string, any>;
  appliedAt?: string;
  TailoredResume?: {
    tailoredSummary?: string;
    tailoredHeadline?: string;
    tailoredSkills?: string[];
    atsKeywordsMatched?: string[];
    matchScore?: number;
  };
}

export const getAgentConfig = async () => {
  const response = await axiosInstance.get<{ success: boolean; config: AgentConfig }>("/agent/config");
  return response.data;
};

export const updateAgentConfig = async (data: Partial<AgentConfig>) => {
  const response = await axiosInstance.put<{ success: boolean; config: AgentConfig; message: string }>("/agent/config", data);
  return response.data;
};

export const getJobMatches = async () => {
  const response = await axiosInstance.get<{ success: boolean; matches: JobMatch[] }>("/agent/matches");
  return response.data;
};

export const tailorResumeForJob = async (jobId: number) => {
  const response = await axiosInstance.post(`/agent/tailor-resume/${jobId}`);
  return response.data;
};

export const triggerAutoApply = async () => {
  const response = await axiosInstance.post<{ success: boolean; appliedCount: number; message?: string }>("/agent/auto-apply/trigger");
  return response.data;
};

export const getApplicationsLog = async () => {
  const response = await axiosInstance.get<{ success: boolean; logs: AutoApplyLog[] }>("/agent/applications");
  return response.data;
};

export const syncJobsAggregator = async () => {
  const response = await axiosInstance.post("/agent/sync-jobs");
  return response.data;
};
