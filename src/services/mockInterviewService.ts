import axiosInstance from "@/lib/axios";

export type InterviewType = "hr" | "technical" | "behavioral";
export type Difficulty = "easy" | "medium" | "hard";

export interface InterviewQuestion {
  id: string;
  text: string;
  focus: string;
  idealPoints?: string[]; // only returned once the session is completed
}

export interface AnswerScore {
  clarity: number;
  relevance: number;
  structure: number;
  overall: number;
}

export interface InterviewAnswer {
  questionId: string;
  text: string;
  score: AnswerScore;
  feedback: string;
  improvedAnswer: string;
  evaluatedBy?: "llm" | "heuristic" | "rule";
  at?: string;
}

export interface InterviewReport {
  strengths: string[];
  improvements: string[];
  summary: string;
  averages?: AnswerScore;
  perQuestion?: { questionId: string; question: string; focus?: string; answered: boolean; overall: number | null; feedback: string | null }[];
  answeredCount?: number;
  totalQuestions?: number;
}

export interface InterviewSession {
  id: number;
  targetRole: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  status: "in_progress" | "completed";
  overallScore: number | null;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  answeredCount: number;
  totalQuestions: number;
  report: InterviewReport | null;
  createdAt: string;
  updatedAt: string;
}

export type InterviewSessionSummary = Omit<InterviewSession, "questions" | "answers" | "report"> & { summary: string | null };

export const startInterview = async (body: { targetRole?: string; interviewType: InterviewType; difficulty: Difficulty }) =>
  (await axiosInstance.post<{ success: boolean; questionSource: "llm" | "fallback"; session: InterviewSession }>("/mock-interview/start", body)).data;

export const submitInterviewAnswer = async (id: number, questionId: string, answer: string) =>
  (await axiosInstance.post<{ success: boolean; evaluation: InterviewAnswer; answeredCount: number; totalQuestions: number }>(
    `/mock-interview/${id}/answer`,
    { questionId, answer }
  )).data;

export const finishInterview = async (id: number) =>
  (await axiosInstance.post<{ success: boolean; session: InterviewSession }>(`/mock-interview/${id}/finish`)).data;

export const listInterviews = async () =>
  (await axiosInstance.get<{ success: boolean; sessions: InterviewSessionSummary[] }>("/mock-interview")).data;

export const getInterview = async (id: number) =>
  (await axiosInstance.get<{ success: boolean; session: InterviewSession }>(`/mock-interview/${id}`)).data;

// ── Live (voice) interview ────────────────────────────────────────────────

export type LiveInterviewType = "hr" | "technical";

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: "easy" | "medium";
  statement: string;
  inputFormat: string;
  starter: string;
  testCases: { input: unknown; output: unknown }[];
}

export interface SpeechMetrics {
  available: boolean;
  words: number;
  speakingSeconds: number;
  wpm: number | null;
  pace: "slow" | "good" | "fast" | null;
  fillers: { total: number; per100Words: number; top: { word: string; count: number }[] };
  longPauses: number;
  answerCount: number;
  avgAnswerSeconds: number;
  avgAnswerWords: number;
  talkRatio: number | null;
  tips: string[];
}

export interface TranscriptTurn {
  speaker: "interviewer" | "candidate";
  text: string;
  startMs: number;
  endMs: number;
}

export interface LiveInterviewSession extends InterviewSession {
  mode: "live" | "text";
  plannedMinutes: number | null;
  durationSeconds: number | null;
  speechMetrics: SpeechMetrics | null;
  codeSubmission: { problemId: string | null; title: string | null; language: string; code: string; testsPassed: number | null; testsTotal: number | null } | null;
  transcript?: TranscriptTurn[];
  report: (InterviewReport & { captionsUnavailable?: boolean }) | null;
}

export interface LiveStartResponse {
  success: boolean;
  session: LiveInterviewSession;
  realtime: { wsUrl: string; model: string; clientSecret: string; expiresAt: number; maxSessionSeconds: number };
  codingProblems: CodingProblem[];
}

export const startLiveInterview = async (body: { targetRole?: string; interviewType: LiveInterviewType; difficulty: Difficulty; durationMin: 15 | 25 }) =>
  (await axiosInstance.post<LiveStartResponse>("/mock-interview/live/start", body)).data;

export const finishLiveInterview = async (
  id: number,
  body: { turns: TranscriptTurn[]; durationSeconds: number; code?: { problemId: string; language: string; code: string; testsPassed?: number; testsTotal?: number } }
) => (await axiosInstance.post<{ success: boolean; session: LiveInterviewSession }>(`/mock-interview/${id}/live/finish`, body, { timeout: 120000 })).data;
