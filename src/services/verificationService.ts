import axiosInstance from "@/lib/axios";
import type { LiveStartResponse } from "@/services/mockInterviewService";

// Verification interviews: book a live AI interview; score 80+ earns a "Verified: <role>" badge.

export type VerificationStatus = "scheduled" | "in_progress" | "passed" | "failed" | "missed" | "cancelled";
export type VerificationRound = "hr" | "technical";

export interface VerificationItem {
  id: number;
  targetRole: string;
  interviewType: VerificationRound;
  scheduledAt: string;
  status: VerificationStatus;
  joinState: "early" | "open" | "closed" | null;
  opensAt: string;
  closesAt: string;
  sessionId: number | null;
  overallScore: number | null;
  failReason: string | null;
  failReasonText: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  publicCode: string | null;
  createdAt: string;
}

export interface VerificationRules {
  passScore: number;
  badgeDays: number;
  retakeDays: number;
  durationMin: number;
  joinEarlyMin: number;
  joinLateMin: number;
  maxDaysAhead: number;
}

export type CanSchedule =
  | { ok: true }
  | { ok: false; reason: "active"; activeId: number }
  | { ok: false; reason: "cooldown"; nextAllowedAt: string };

export interface VerificationOverview {
  success: boolean;
  items: VerificationItem[];
  badges: VerificationItem[];
  canSchedule: CanSchedule;
  rules: VerificationRules;
}

export interface PublicBadge {
  code: string;
  name: string | null;
  role: string;
  round: VerificationRound;
  score: number | null;
  verifiedAt: string | null;
  expiresAt: string | null;
  status: "valid" | "expired" | "not_verified";
  summary: string | null;
  strengths: string[];
  improvements: string[];
}

export const getVerifications = async () => (await axiosInstance.get<VerificationOverview>("/verification")).data;

export const scheduleVerification = async (body: { targetRole: string; interviewType: VerificationRound; scheduledAt: string }) =>
  (await axiosInstance.post<{ success: boolean; item: VerificationItem }>("/verification", body)).data;

export const rescheduleVerification = async (id: number, scheduledAt: string) =>
  (await axiosInstance.patch<{ success: boolean; item: VerificationItem }>(`/verification/${id}`, { scheduledAt })).data;

export const cancelVerification = async (id: number) =>
  (await axiosInstance.post<{ success: boolean; item: VerificationItem }>(`/verification/${id}/cancel`)).data;

export const startVerification = async (id: number) =>
  (await axiosInstance.post<LiveStartResponse & { verificationId: number }>(`/verification/${id}/start`)).data;

export const getPublicBadge = async (code: string) =>
  (await axiosInstance.get<{ success: boolean; badge: PublicBadge }>(`/verification/public/${encodeURIComponent(code)}`)).data;

/** Shareable link a recruiter can open without logging in. */
export const badgeLink = (code: string) =>
  `${typeof window === "undefined" ? "https://aarikaai.in" : window.location.origin}/verified/${code}`;

/** "Sat, 22 Nov, 7:30 pm" in the viewer's time zone. */
export const fmtWhen = (d: string | Date) =>
  new Date(d).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

export const fmtDay = (d: string | Date) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
