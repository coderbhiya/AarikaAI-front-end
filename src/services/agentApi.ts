import axiosInstance from "@/lib/axios";
import type { ResumeData } from "./resumeBuilderApi";

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

/** A job from the profile-matched feed (external board/aggregator job or AarikaAI company job). */
export interface MatchedJob {
  id: number;
  isCompanyJob: boolean;
  title: string;
  company: string;
  companyLogo?: string | null;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  description?: string;
  jobSalary?: string | null;
  postedDate?: string;
  deadline?: string;
  link?: string;
  applyUrl?: string;
  /** greenhouse | lever | ashby | smartrecruiters | external | aarika */
  applyType?: string;
  publisher?: string;
  isRemote?: boolean;
  matchPercentage: number;
  matchReasons?: string[];
  matchedSkills?: string[];
}

export interface JobMatch extends MatchedJob {
  matchScore: number;
  applicationId: number | null;
  applicationStatus: string;
  hasApplied: boolean;
}

export interface ApplyQuestion {
  key: string;
  label: string;
  required: boolean;
  type: "text" | "textarea" | "select" | "file";
  options?: string[];
  answer: string;
  /** profile | ai_draft | needs_you | you | file */
  source: string;
}

export interface Application {
  id: number;
  jobId: number | null;
  companyJobId: number | null;
  jobTitle: string;
  companyName: string;
  jobLink?: string;
  status: string;
  submissionMode: string;
  matchScore: number;
  appliedAt?: string;
  createdAt: string;
  errorMessage?: string | null;
  atsScore: number | null;
  needsYou: string[];
  // Full package (GET /agent/applications/:id, prepare)
  coverLetter?: string;
  applyUrl?: string;
  applyType?: string;
  questions?: ApplyQuestion[];
  ats?: { score: number; keywords: { matched: string[]; missingRequired: string[]; missingPreferred: string[] } | null } | null;
  resume?: ResumeData;
  template?: string;
  resumeFileName?: string;
}

export interface JobSources {
  companies: number;
  aggregators: Record<string, boolean>;
  activeBySource: { source: string; count: number }[];
  lastSync: { at: string; inserted: number; activeJobs: number } | null;
}

export const getAgentConfig = async () =>
  (await axiosInstance.get<{ success: boolean; config: AgentConfig }>("/agent/config")).data;

export const updateAgentConfig = async (data: Partial<AgentConfig>) =>
  (await axiosInstance.put<{ success: boolean; config: AgentConfig; message: string }>("/agent/config", data)).data;

export const getJobMatches = async () =>
  (await axiosInstance.get<{ success: boolean; matches: JobMatch[]; needsProfile: boolean; notEligible: string | null }>("/agent/matches")).data;

export const getJobSources = async () =>
  (await axiosInstance.get<{ success: boolean } & JobSources>("/agent/sources")).data;

/** Build the Smart Apply package for an external job (takes ~15-40s). */
export const prepareApplication = async (jobId: number, force = false) =>
  (await axiosInstance.post<{ success: boolean; application: Application }>(`/agent/prepare/${jobId}`, { force }, { timeout: 120000 })).data;

/** One-click apply to a job posted on AarikaAI. */
export const applyInternal = async (companyJobId: number) =>
  (await axiosInstance.post<{ success: boolean; message: string; applicationId?: number }>(`/agent/apply-internal/${companyJobId}`)).data;

export const triggerAutoApply = async () =>
  (await axiosInstance.post<{ success: boolean; applied: number; queued: number; remaining: number; message?: string }>("/agent/auto-apply/trigger")).data;

export const getApplicationsLog = async () =>
  (await axiosInstance.get<{ success: boolean; logs: Application[] }>("/agent/applications")).data;

export const getApplication = async (id: number) =>
  (await axiosInstance.get<{ success: boolean; application: Application }>(`/agent/applications/${id}`)).data;

export const saveApplicationAnswers = async (id: number, answers: Record<string, string>, coverLetter?: string) =>
  (await axiosInstance.put<{ success: boolean; application: Application }>(`/agent/applications/${id}/answers`, { answers, coverLetter })).data;

export const markApplicationApplied = async (id: number) =>
  (await axiosInstance.post(`/agent/applications/${id}/applied`)).data;

export const dismissApplication = async (id: number) =>
  (await axiosInstance.post(`/agent/applications/${id}/dismiss`)).data;

/** Download the tailored resume PDF for an application. */
export const downloadApplicationResume = async (id: number, fileName = "Resume.pdf") => {
  const res = await axiosInstance.get(`/agent/applications/${id}/resume`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
