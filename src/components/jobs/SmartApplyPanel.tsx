"use client";

/**
 * Smart Apply: everything needed to apply to an external job in two minutes.
 * AarikaAI prepares a tailored resume, the employer's form questions with
 * answers from the profile, and a cover letter; the user reviews, submits on
 * the official form, and marks it applied. (External forms are captcha-gated,
 * so the final submit is always the user's.)
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2, Copy, Download, ExternalLink, FileText, Loader2, RefreshCw, Sparkles, AlertTriangle,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Application, downloadApplicationResume, getApplication, markApplicationApplied,
  prepareApplication, saveApplicationAnswers,
} from "@/services/agentApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** External job to prepare for (Job id). */
  jobId?: number | null;
  /** Or an existing application to show. */
  applicationId?: number | null;
  jobTitle?: string;
  company?: string;
  onApplied?: (applicationId: number) => void;
}

const SOURCE_BADGE: Record<string, { label: string; cls: string }> = {
  profile: { label: "From profile", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ai_draft: { label: "AI draft — review", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  you: { label: "Your answer", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  needs_you: { label: "Only you can answer", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  file: { label: "Upload", cls: "bg-gray-50 text-gray-600 border-gray-200" },
};

const PREP_STEPS = ["Tailoring your resume to this job", "Checking ATS keywords", "Answering the application questions", "Writing your cover letter"];

export default function SmartApplyPanel({ open, onOpenChange, jobId, applicationId, jobTitle, company, onApplied }: Props) {
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [coverLetter, setCoverLetter] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const hydrate = (a: Application) => {
    setApp(a);
    setAnswers(Object.fromEntries((a.questions || []).map((q) => [q.key, q.answer || ""])));
    setCoverLetter(a.coverLetter || "");
    setDirty(false);
  };

  const load = async (force = false) => {
    setLoading(true);
    setError(null);
    setStep(0);
    const ticker = setInterval(() => setStep((s) => Math.min(s + 1, PREP_STEPS.length - 1)), 6000);
    try {
      if (applicationId && !force) {
        const r = await getApplication(applicationId);
        if (r.application.questions) {
          hydrate(r.application);
          return;
        }
        if (r.application.jobId) {
          hydrate((await prepareApplication(r.application.jobId, force)).application);
          return;
        }
        hydrate(r.application);
        return;
      }
      const target = jobId ?? app?.jobId;
      if (!target) throw new Error("No job selected");
      hydrate((await prepareApplication(target, force)).application);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Could not prepare this application.");
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load(false);
    else { setApp(null); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobId, applicationId]);

  const copy = async (text: string, what = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(what);
    } catch {
      toast.error("Couldn't copy — select and copy manually");
    }
  };

  const save = async () => {
    if (!app) return;
    setSaving(true);
    try {
      hydrate((await saveApplicationAnswers(app.id, answers, coverLetter)).application);
      toast.success("Saved");
    } catch {
      toast.error("Could not save");
    } finally {
      setSaving(false);
    }
  };

  const openForm = async () => {
    if (!app?.applyUrl) return;
    if (dirty) await save();
    window.open(app.applyUrl, "_blank", "noopener,noreferrer");
  };

  const markApplied = async () => {
    if (!app) return;
    setMarking(true);
    try {
      if (dirty) await saveApplicationAnswers(app.id, answers, coverLetter);
      await markApplicationApplied(app.id);
      setApp({ ...app, status: "applied" });
      toast.success("Marked as applied — tracked in your applications");
      onApplied?.(app.id);
    } catch {
      toast.error("Could not update the status");
    } finally {
      setMarking(false);
    }
  };

  const download = async () => {
    if (!app) return;
    setDownloading(true);
    try {
      await downloadApplicationResume(app.id, app.resumeFileName || "Resume.pdf");
    } catch {
      toast.error("Could not download the resume");
    } finally {
      setDownloading(false);
    }
  };

  const questions = (app?.questions || []).filter((q) => q.type !== "file");
  const pendingRequired = (app?.questions || []).filter((q) => q.required && q.type !== "file" && !(answers[q.key] || "").trim());
  const ats = app?.ats;
  const applied = app?.status === "applied";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[640px] p-0 flex flex-col gap-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100 text-left space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 uppercase tracking-wide">
            <Sparkles size={13} /> Smart Apply
          </div>
          <SheetTitle className="text-lg leading-snug pr-6">{app?.jobTitle || jobTitle || "Preparing application"}</SheetTitle>
          <SheetDescription className="text-[13px]">{app?.companyName || company}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {loading && (
            <div className="py-10">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 size={20} className="animate-spin text-indigo-600" />
                <p className="text-sm font-semibold text-gray-800">Preparing your application… about 30 seconds</p>
              </div>
              <ol className="space-y-3">
                {PREP_STEPS.map((s, i) => (
                  <li key={s} className={`flex items-center gap-2.5 text-sm ${i < step ? "text-emerald-700" : i === step ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                    {i < step ? <CheckCircle2 size={16} /> : i === step ? <Loader2 size={16} className="animate-spin" /> : <span className="w-4 h-4 rounded-full border border-gray-300" />}
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold mb-1">{error}</p>
              <button onClick={() => load(true)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-700 underline">
                <RefreshCw size={12} /> Try again
              </button>
            </div>
          )}

          {!loading && app && !error && (
            <>
              {applied && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} /> You marked this as applied{app.appliedAt ? ` on ${new Date(app.appliedAt).toLocaleDateString()}` : ""}.
                </div>
              )}

              {/* 1. Resume */}
              <section>
                <h3 className="text-[13px] font-bold text-gray-900 mb-2">1. Your resume, tailored for this job</h3>
                <div className="rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><FileText size={18} /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{app.resumeFileName || "Resume.pdf"}</p>
                      <p className="text-xs text-gray-500">Rewritten to this job&apos;s language. Nothing added that isn&apos;t on your profile.</p>
                    </div>
                  </div>
                  {ats?.score != null && (
                    <div className="text-center">
                      <p className={`text-xl font-bold ${ats.score >= 70 ? "text-emerald-600" : ats.score >= 50 ? "text-amber-600" : "text-red-500"}`}>{ats.score}%</p>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase">ATS match</p>
                    </div>
                  )}
                  <button onClick={download} disabled={downloading} className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-60">
                    {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Download PDF
                  </button>
                </div>
                {ats?.keywords && ats.keywords.missingRequired.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                    <span className="font-semibold text-gray-800">The job also asks for:</span> {ats.keywords.missingRequired.slice(0, 8).join(", ")}.
                    {" "}If you have any of these, add them to your profile or <a href="/resume-builder" className="text-indigo-600 font-semibold underline">resume</a> and regenerate.
                  </p>
                )}
              </section>

              {/* 2. Questions */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[13px] font-bold text-gray-900">2. Answers for the application form</h3>
                  {pendingRequired.length > 0 && (
                    <span className="text-[11px] font-semibold text-amber-700 inline-flex items-center gap-1"><AlertTriangle size={12} /> {pendingRequired.length} need you</span>
                  )}
                </div>
                <div className="space-y-3">
                  {questions.map((q) => {
                    const badge = q.source === "needs_you" && !q.required
                      ? { label: "Optional", cls: "bg-gray-50 text-gray-500 border-gray-200" }
                      : SOURCE_BADGE[q.source] || SOURCE_BADGE.ai_draft;
                    const value = answers[q.key] ?? "";
                    return (
                      <div key={q.key} className={`rounded-xl border p-3 ${q.required && !value.trim() ? "border-amber-300 bg-amber-50/40" : "border-gray-200"}`}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-[13px] font-medium text-gray-900 leading-snug">{q.label}{q.required && <span className="text-red-500"> *</span>}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <div className="flex gap-2 items-start">
                          {q.type === "select" && q.options?.length ? (
                            <select
                              value={value}
                              onChange={(e) => { setAnswers({ ...answers, [q.key]: e.target.value }); setDirty(true); }}
                              className="flex-1 text-sm rounded-lg border border-gray-200 px-2.5 py-2 bg-white"
                            >
                              <option value="">Choose…</option>
                              {q.options.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : q.type === "textarea" || value.length > 80 ? (
                            <textarea
                              value={value}
                              rows={3}
                              onChange={(e) => { setAnswers({ ...answers, [q.key]: e.target.value }); setDirty(true); }}
                              className="flex-1 text-sm rounded-lg border border-gray-200 px-2.5 py-2 resize-y"
                              placeholder={q.source === "needs_you" ? "Your answer" : ""}
                            />
                          ) : (
                            <input
                              value={value}
                              onChange={(e) => { setAnswers({ ...answers, [q.key]: e.target.value }); setDirty(true); }}
                              className="flex-1 text-sm rounded-lg border border-gray-200 px-2.5 py-2"
                              placeholder={q.source === "needs_you" ? "Your answer" : ""}
                            />
                          )}
                          <button
                            onClick={() => copy(value, "Answer copied")}
                            disabled={!value}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                            aria-label={`Copy answer for ${q.label}`}
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 3. Cover letter */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[13px] font-bold text-gray-900">3. Cover letter</h3>
                  <button onClick={() => copy(coverLetter, "Cover letter copied")} className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1">
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <textarea
                  value={coverLetter}
                  onChange={(e) => { setCoverLetter(e.target.value); setDirty(true); }}
                  rows={10}
                  className="w-full text-sm leading-relaxed rounded-xl border border-gray-200 p-3 resize-y"
                />
                <p className="text-[11px] text-gray-500 mt-1">Read it once before sending — it&apos;s written only from your profile, but you know your story best.</p>
              </section>
            </>
          )}
        </div>

        {!loading && app && !error && (
          <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-2 bg-white">
            {dirty && (
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 inline-flex items-center gap-1.5">
                {saving && <Loader2 size={12} className="animate-spin" />} Save changes
              </button>
            )}
            <button onClick={() => load(true)} className="px-3 py-2 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800 inline-flex items-center gap-1" title="Rebuild with your latest profile">
              <RefreshCw size={12} /> Regenerate
            </button>
            <div className="flex-1" />
            {!applied && (
              <button onClick={markApplied} disabled={marking} className="px-4 py-2 rounded-full border border-emerald-500 text-emerald-700 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-60">
                {marking ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />} I&apos;ve applied
              </button>
            )}
            <button onClick={openForm} disabled={!app.applyUrl} className="px-5 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-indigo-700 disabled:opacity-50">
              Open application form <ExternalLink size={13} />
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
