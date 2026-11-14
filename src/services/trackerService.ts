import axiosInstance from "@/lib/axios";

export const TRACKER_STAGES = ["saved", "applied", "interview", "offer", "rejected"] as const;
export type TrackerStage = (typeof TRACKER_STAGES)[number];

export const STAGE_LABELS: Record<TrackerStage, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export interface TrackedApplication {
  id: number;
  jobId: number | null;
  title: string;
  company: string | null;
  applyUrl: string | null;
  source: "aarika" | "external" | "manual";
  stage: TrackerStage;
  notes: string | null;
  appliedAt: string | null;
  nextActionAt: string | null;
  stageHistory: { stage: TrackerStage; at: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackerListResponse {
  success: boolean;
  stages: TrackerStage[];
  counts: Record<TrackerStage, number>;
  total: number;
  items: TrackedApplication[];
}

export type CreateTrackedBody =
  | { jobId: number; stage?: TrackerStage }
  | { title: string; company?: string; applyUrl?: string; stage?: TrackerStage; notes?: string; nextActionAt?: string | null };

export interface UpdateTrackedBody {
  stage?: TrackerStage;
  notes?: string | null;
  nextActionAt?: string | null;
  title?: string;
  company?: string | null;
  applyUrl?: string | null;
}

export const listTracked = async () => (await axiosInstance.get<TrackerListResponse>("/tracker")).data;

export const createTracked = async (body: CreateTrackedBody) =>
  (await axiosInstance.post<{ success: boolean; alreadyTracked?: boolean; item: TrackedApplication }>("/tracker", body)).data;

export const updateTracked = async (id: number, body: UpdateTrackedBody) =>
  (await axiosInstance.patch<{ success: boolean; item: TrackedApplication }>(`/tracker/${id}`, body)).data;

export const deleteTracked = async (id: number) =>
  (await axiosInstance.delete<{ success: boolean }>(`/tracker/${id}`)).data;
