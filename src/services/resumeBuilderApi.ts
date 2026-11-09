import axiosInstance from "@/lib/axios";

export type SectionKey =
  | "summary" | "experience" | "projects" | "skills" | "education" | "certifications" | "achievements" | "languages";

export interface ResumeData {
  basics: {
    name: string; headline: string; email: string; phone: string; location: string;
    linkedin: string; github: string; website: string; summary: string;
  };
  skills: { name: string; items: string[] }[];
  experience: { id: string; role: string; company: string; location: string; start: string; end: string; current: boolean; bullets: string[] }[];
  projects: { id: string; name: string; link: string; tech: string; bullets: string[] }[];
  education: { id: string; degree: string; institution: string; location: string; start: string; end: string; score: string }[];
  certifications: { id: string; name: string; issuer: string; date: string; link: string }[];
  achievements: string[];
  languages: string[];
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
}

export type TemplateId = "classic" | "modern" | "compact";

export interface ResumeDoc {
  id: number;
  title: string;
  template: TemplateId;
  accentColor: string | null;
  isPrimary: boolean;
  targetJobId: number | null;
  targetJobTitle: string | null;
  lastAtsScore: number | null;
  updatedAt: string;
  data: ResumeData;
}

export interface AtsResult {
  score: number;
  structure: { score: number; checks: { id: string; label: string; pass: boolean; fix: string }[] };
  keywords: { score: number; matched: string[]; missingRequired: string[]; missingPreferred: string[] } | null;
}

export const listResumes = async () =>
  (await axiosInstance.get<{ success: boolean; resumes: ResumeDoc[]; templates: TemplateId[] }>("/resume-builder")).data;

export const createResume = async (body: { title?: string; fromId?: number }) =>
  (await axiosInstance.post<{ success: boolean; resume: ResumeDoc }>("/resume-builder", body)).data;

export const updateResume = async (id: number, body: Partial<Pick<ResumeDoc, "title" | "template" | "accentColor" | "data" | "isPrimary">>) =>
  (await axiosInstance.put<{ success: boolean; resume: ResumeDoc }>(`/resume-builder/${id}`, body)).data;

export const deleteResume = async (id: number) => (await axiosInstance.delete(`/resume-builder/${id}`)).data;

export const importFromProfile = async () =>
  (await axiosInstance.get<{ success: boolean; data: ResumeData }>("/resume-builder/from-profile")).data;

export const previewResume = async (data: ResumeData, template: TemplateId, accentColor: string | null) =>
  (await axiosInstance.post<{ success: boolean; html: string }>("/resume-builder/preview", { data, template, accentColor })).data;

export const downloadResumePdf = async (data: ResumeData, template: TemplateId, accentColor: string | null, fileName: string) => {
  const res = await axiosInstance.post("/resume-builder/pdf", { data, template, accentColor }, { responseType: "blob", timeout: 60000 });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const improveSummary = async (data: ResumeData, targetRole?: string) =>
  (await axiosInstance.post<{ success: boolean; summary: string }>("/resume-builder/ai/improve", { kind: "summary", data, context: { targetRole } }, { timeout: 60000 })).data;

export const improveBullets = async (data: ResumeData, bullets: string[], role: string, company: string) =>
  (await axiosInstance.post<{ success: boolean; bullets: string[]; tips: string[] }>("/resume-builder/ai/improve", { kind: "bullets", data, bullets, context: { role, company } }, { timeout: 60000 })).data;

export const atsCheck = async (body: { data: ResumeData; resumeId?: number; jobId?: number; jobDescription?: string; jobTitle?: string }) =>
  (await axiosInstance.post<{ success: boolean } & AtsResult>("/resume-builder/ai/ats-check", body, { timeout: 90000 })).data;

export const tailorResume = async (id: number, body: { jobId?: number; jobTitle?: string; company?: string; jobDescription?: string }) =>
  (await axiosInstance.post<{ success: boolean; resume: ResumeDoc }>(`/resume-builder/${id}/tailor`, body, { timeout: 120000 })).data;
