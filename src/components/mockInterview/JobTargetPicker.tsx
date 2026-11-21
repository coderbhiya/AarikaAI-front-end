"use client";

// "Practise for a specific job": used on the text and live mock interview setups.
// A job card links here with ?jobId= (or ?companyJobId=) plus title/company for display; the
// server re-reads the job and its description by id. Without a job, the user can paste a JD.

import { useState } from "react";
import { Briefcase, ChevronDown, X } from "lucide-react";
import type { JobTargetBody } from "@/services/mockInterviewService";

export const MAX_JD_CHARS = 6000;
export const MIN_JD_CHARS = 80;

export type JobTarget =
  | { kind: "job"; jobId: number; title: string; company: string }
  | { kind: "company_job"; companyJobId: number; title: string; company: string }
  | { kind: "pasted"; description: string; company: string };

type JobRef = { jobId?: number | null; companyJobId?: number | null; title?: string | null; company?: string | null };

/** Link to the mock interview setup, ready for this job. */
export function practiceInterviewHref(job: JobRef, { live = false } = {}) {
  const q = new URLSearchParams();
  if (job.companyJobId) q.set("companyJobId", String(job.companyJobId));
  else if (job.jobId) q.set("jobId", String(job.jobId));
  if (job.title) q.set("title", job.title.slice(0, 120));
  if (job.company) q.set("company", job.company.slice(0, 120));
  const qs = q.toString();
  return `/mock-interview${live ? "/live" : ""}${qs ? `?${qs}` : ""}`;
}

const posInt = (v: string | null) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

/** Job named in the page URL (from a job card's "Practice interview" link), if any. */
export function readJobTargetFromUrl(search = typeof window === "undefined" ? "" : window.location.search): JobTarget | null {
  const q = new URLSearchParams(search);
  const title = (q.get("title") || "").slice(0, 120);
  const company = (q.get("company") || "").slice(0, 120);
  const companyJobId = posInt(q.get("companyJobId"));
  if (companyJobId) return { kind: "company_job", companyJobId, title, company };
  const jobId = posInt(q.get("jobId"));
  if (jobId) return { kind: "job", jobId, title, company };
  return null;
}

/** Query string that carries a platform job on to the other interview page ("" for none / pasted). */
export function jobTargetQuery(t: JobTarget | null) {
  if (!t || t.kind === "pasted") return "";
  const href = practiceInterviewHref(t.kind === "job" ? { jobId: t.jobId, title: t.title, company: t.company } : { companyJobId: t.companyJobId, title: t.title, company: t.company });
  return href.slice(href.indexOf("?"));
}

/** Fields for the start request. */
export function jobTargetBody(t: JobTarget | null, targetRole = ""): JobTargetBody {
  if (!t) return {};
  if (t.kind === "job") return { jobId: t.jobId };
  if (t.kind === "company_job") return { companyJobId: t.companyJobId };
  const description = t.description.trim();
  if (!description) return {};
  return { jobDescription: description, ...(t.company.trim() ? { company: t.company.trim() } : {}), ...(targetRole.trim() ? { jobTitle: targetRole.trim() } : {}) };
}

/** True when a pasted JD is too short to send (the server would reject it). */
export function pastedTooShort(t: JobTarget | null) {
  return t?.kind === "pasted" && t.description.trim().length > 0 && t.description.trim().length < MIN_JD_CHARS;
}

export function JobTargetPicker({
  value,
  onChange,
  accent = "primary",
}: {
  value: JobTarget | null;
  onChange: (t: JobTarget | null) => void;
  accent?: "primary" | "blue";
}) {
  const [open, setOpen] = useState(value?.kind === "pasted");
  const ring = accent === "blue" ? "focus:border-blue-600" : "focus:border-primary";

  if (value && value.kind !== "pasted") {
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 flex items-start gap-3" data-testid="job-target">
        <Briefcase className="w-4 h-4 mt-0.5 text-indigo-600 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-700">Practising for this job</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{value.title || "Selected job"}{value.company ? ` · ${value.company}` : ""}</p>
          <p className="text-xs text-gray-600 mt-0.5">Questions will be based on this job&apos;s description.</p>
        </div>
        <button type="button" onClick={() => onChange(null)} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Practise without this job">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const pasted = value?.kind === "pasted" ? value : { kind: "pasted" as const, description: "", company: "" };
  const update = (patch: Partial<{ description: string; company: string }>) => {
    const next = { ...pasted, ...patch };
    onChange(next.description.trim() || next.company.trim() ? next : null);
  };
  const len = pasted.description.trim().length;

  return (
    <div className="rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        <Briefcase className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-gray-800">Practising for a specific job? <span className="font-normal text-gray-500">(optional)</span></span>
          <span className="block text-xs text-gray-500">Paste the job description and the questions will be about that job.</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2.5">
          <div>
            <label htmlFor="jt-company" className="text-xs font-semibold text-gray-700">Company</label>
            <input
              id="jt-company"
              value={pasted.company}
              onChange={(e) => update({ company: e.target.value })}
              maxLength={120}
              placeholder="e.g. Flipkart"
              className={`mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none ${ring}`}
            />
          </div>
          <div>
            <label htmlFor="jt-jd" className="text-xs font-semibold text-gray-700">Job description</label>
            <textarea
              id="jt-jd"
              value={pasted.description}
              onChange={(e) => update({ description: e.target.value })}
              maxLength={MAX_JD_CHARS}
              rows={6}
              placeholder="Paste the full job description: responsibilities, skills and requirements."
              className={`mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none resize-y ${ring}`}
            />
            <p className={`mt-1 text-[11px] ${len > 0 && len < MIN_JD_CHARS ? "text-amber-700" : "text-gray-400"}`}>
              {len > 0 && len < MIN_JD_CHARS ? `Add a bit more (at least ${MIN_JD_CHARS} characters).` : `${len}/${MAX_JD_CHARS}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
