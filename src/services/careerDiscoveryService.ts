import axiosInstance from "@/lib/axios";

export type RiasecKey = "R" | "I" | "A" | "S" | "E" | "C";
export type AptitudeKey = "numerical" | "verbal" | "logical" | "spatial";

export interface InterestQuestion {
  id: string;
  kind: "interest";
  riasec: RiasecKey;
  text: string;
}

export interface AptitudeQuestion {
  id: string;
  kind: "aptitude";
  section: AptitudeKey;
  text: string;
  options: string[];
}

export type DiscoveryQuestion = InterestQuestion | AptitudeQuestion;

export interface QuestionBank {
  version: string;
  likertScale: { value: number; label: string }[];
  sections: { id: "interest" | "aptitude"; title: string; note: string; count: number }[];
  questions: DiscoveryQuestion[];
  estimatedMinutes: number;
}

export interface CareerSuggestion {
  title: string;
  why: string;
  stream: string;
  streamKeys: string[];
  exams: string[];
  riasec: string;
  matchScore: number;
}

export interface DiscoveryResult {
  version: string;
  riasec: Record<RiasecKey, number>;
  aptitude: Record<AptitudeKey, number>;
  hollandCode: string;
  hollandTypes: { code: RiasecKey; name: string; short: string; blurb: string }[];
  aptitudeDetail: Record<AptitudeKey, { correct: number; total: number }>;
  streamRecommendation: {
    primary: string;
    primaryKey: string;
    alternatives: string[];
    alternativeKeys: string[];
    scores: Record<string, number>;
    reasons: string[];
    currentStream: string[] | null;
    currentStreamNote: string | null;
  };
  topCareers: CareerSuggestion[];
}

export interface DiscoveryAttempt {
  id: number;
  result: DiscoveryResult;
  aiSummary: string | null;
  createdAt: string;
}

/** Answer values: interest 1–5, aptitude option index or null (skipped). */
export type DiscoveryAnswers = Record<string, number | null>;

export async function getDiscoveryQuestions(): Promise<QuestionBank> {
  const res = await axiosInstance.get("/career-discovery/questions");
  return res.data.data;
}

export async function submitDiscovery(answers: DiscoveryAnswers): Promise<DiscoveryAttempt> {
  const res = await axiosInstance.post("/career-discovery/submit", { answers });
  return res.data.data;
}

export async function getLatestDiscovery(): Promise<DiscoveryAttempt | null> {
  const res = await axiosInstance.get("/career-discovery/latest");
  return res.data.data ?? null;
}

/** True when the API refused because the feature isn't for this persona. */
export function isNotEligibleError(err: unknown): boolean {
  const e = err as { response?: { status?: number; data?: { notEligible?: string } } };
  return e?.response?.status === 403 && !!e.response.data?.notEligible;
}
