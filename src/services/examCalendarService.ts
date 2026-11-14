import axiosInstance from "@/lib/axios";

export type Eligible = true | false | "unknown";
export interface EligibilityResult {
  eligible: Eligible;
  reasons: string[];
}

export type ExamCategory =
  | "engineering" | "medical" | "law" | "design" | "defence" | "commerce" | "university" | "olympiad" | "govt";

export type RegistrationStatus = "upcoming" | "open" | "closed" | "unknown";

export interface CalendarExam {
  id: string;
  source: "entrance" | "govt";
  name: string;
  shortName: string | null;
  category: ExamCategory;
  subCategory?: string | null;
  conductingBody: string | null;
  officialUrl: string | null;
  description: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  examDate: string | null;
  daysToExam: number | null;
  daysToRegistrationEnd: number | null;
  registrationStatus: RegistrationStatus;
  nextDate: string | null;
  nextDateLabel: string | null;
  daysToNext: number | null;
  eligibility: EligibilityResult;
}

export interface ScholarshipItem {
  id: string;
  name: string;
  provider: string | null;
  officialUrl: string | null;
  amount: string | null;
  description: string | null;
  deadline: string | null;
  daysToDeadline: number | null;
  eligibility: EligibilityResult;
}

export interface ProfileFacts {
  class: number | null;
  stream: string | null;
  age: number | null;
  category: string | null;
  state: string | null;
  gender: string | null;
}

export interface ExamCalendarResponse {
  today: string;
  persona: string | null;
  profileFacts: ProfileFacts;
  categories: ExamCategory[];
  count: number;
  data: CalendarExam[];
}

export interface ScholarshipsResponse {
  today: string;
  persona: string | null;
  profileFacts: ProfileFacts;
  count: number;
  data: ScholarshipItem[];
}

export async function getExamCalendar(params: { category?: ExamCategory | null; eligibleOnly?: boolean } = {}): Promise<ExamCalendarResponse> {
  const res = await axiosInstance.get("/exam-calendar", {
    params: {
      ...(params.category ? { category: params.category } : {}),
      ...(params.eligibleOnly ? { eligibleOnly: "true" } : {}),
    },
  });
  return res.data;
}

export async function getScholarships(params: { eligibleOnly?: boolean } = {}): Promise<ScholarshipsResponse> {
  const res = await axiosInstance.get("/exam-calendar/scholarships", {
    params: params.eligibleOnly ? { eligibleOnly: "true" } : {},
  });
  return res.data;
}
