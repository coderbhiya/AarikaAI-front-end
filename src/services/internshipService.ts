import axiosInstance from "@/lib/axios";

export type HubType = "internship" | "fresher" | "all";

export interface HubJob {
  id: number;
  title: string;
  company: string | null;
  companyLogo: string | null;
  location: string | null;
  isRemote: boolean;
  employmentType: string | null;
  experienceLevel: string | null;
  category: "internship" | "fresher" | null;
  jobSalary: string | null;
  postedAt: string | null;
  deadline: string | null;
  link: string | null;
  applyUrl: string | null;
  source: string | null;
  publisher: string | null;
  matchPercentage: number;
  matchReasons: string[];
  matchedSkills: string[];
  whyMatch: string | null;
  trackedId?: number | null;
  trackedStage?: string | null;
}

export interface HubResponse {
  success: boolean;
  type: HubType;
  needsProfile: boolean;
  items: HubJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HubQuery {
  type: HubType;
  remote?: boolean;
  location?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export const getInternships = async ({ type, remote, location, q, page = 1, limit = 20 }: HubQuery) => {
  const params: Record<string, string | number> = { type, page, limit };
  if (remote) params.remote = "true";
  if (location?.trim()) params.location = location.trim();
  if (q?.trim()) params.q = q.trim();
  return (await axiosInstance.get<HubResponse>("/internships", { params })).data;
};
