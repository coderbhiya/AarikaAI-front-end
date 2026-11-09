"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles, Play, CheckCircle2, Sliders, FileText, Briefcase, ExternalLink, AlertTriangle, Clock,
  Menu, Loader2, Zap, Building2, MapPin, X, Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import SmartApplyPanel from "@/components/jobs/SmartApplyPanel";
import {
  AgentConfig, Application, JobMatch, JobSources, applyInternal, dismissApplication, getAgentConfig,
  getApplicationsLog, getJobMatches, getJobSources, triggerAutoApply, updateAgentConfig,
} from "@/services/agentApi";

type Tab = "matches" | "applications" | "settings";

const STATUS: Record<string, { label: string; cls: string }> = {
  unapplied: { label: "Not started", cls: "bg-gray-100 text-gray-600" },
  queued: { label: "Queued", cls: "bg-slate-100 text-slate-700" },
  preparing: { label: "Preparing…", cls: "bg-indigo-50 text-indigo-700" },
  ready_to_apply: { label: "Ready to submit", cls: "bg-amber-50 text-amber-800" },
  applied: { label: "Applied", cls: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Failed — retry", cls: "bg-red-50 text-red-700" },
  rejected: { label: "Skipped", cls: "bg-gray-100 text-gray-500" },
};
const statusOf = (s: string) => STATUS[s] || { label: s.replace(/_/g, " "), cls: "bg-gray-100 text-gray-600" };

const SOURCE_NAMES: Record<string, string> = {
  greenhouse: "Company careers (Greenhouse)", lever: "Company careers (Lever)", ashby: "Company careers (Ashby)",
  smartrecruiters: "Company careers (SmartRecruiters)", adzuna: "Adzuna", jooble: "Jooble", jsearch: "LinkedIn / Naukri / Indeed (JSearch)", remotive: "Remote jobs (Remotive)",
};

function ChipInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <div className="mt-1.5 flex flex-wrap gap-1.5 rounded-xl border border-gray-200 bg-white p-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}><X size={11} /></button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={values.length ? "" : placeholder}
          className="flex-1 min-w-[120px] text-sm outline-none px-1"
        />
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const { toggleSidebar } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("matches");
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [apps, setApps] = useState<Application[]>([]);
  const [sources, setSources] = useState<JobSources | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [panel, setPanel] = useState<{ jobId?: number; applicationId?: number; title: string; company: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const [cfg, m, a, src] = await Promise.all([
      getAgentConfig().catch(() => null),
      getJobMatches().catch(() => null),
      getApplicationsLog().catch(() => null),
      getJobSources().catch(() => null),
    ]);
    if (cfg?.config) setConfig(cfg.config);
    if (m) { setMatches(m.matches); setNeedsProfile(m.needsProfile); }
    if (a) setApps(a.logs);
    if (src) setSources(src);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    ready: apps.filter((a) => a.status === "ready_to_apply").length,
    applied: apps.filter((a) => a.status === "applied").length,
    preparing: apps.filter((a) => ["queued", "preparing"].includes(a.status)).length,
    activeJobs: sources?.activeBySource.reduce((n, s) => n + s.count, 0) ?? 0,
  }), [apps, sources]);

  const toggleAgent = async () => {
    if (!config) return;
    const next = !config.isAutoApplyEnabled;
    setConfig({ ...config, isAutoApplyEnabled: next });
    try {
      await updateAgentConfig({ isAutoApplyEnabled: next });
      toast.success(next ? "Job agent on — it runs every morning at 9:30" : "Job agent paused");
    } catch {
      setConfig({ ...config, isAutoApplyEnabled: !next });
      toast.error("Could not update");
    }
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const r = await triggerAutoApply();
      if (r.message && !r.applied && !r.queued) toast.info(r.message);
      else toast.success(`${r.applied ? `Applied to ${r.applied} AarikaAI job${r.applied > 1 ? "s" : ""}. ` : ""}${r.queued ? `Preparing ${r.queued} application${r.queued > 1 ? "s" : ""} — they'll appear under Applications.` : "No new matches to apply to."}`);
      setTab("applications");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not run the agent");
    } finally {
      setRunning(false);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    try {
      const r = await updateAgentConfig(config);
      setConfig(r.config);
      toast.success("Preferences saved");
      getJobMatches().then((m) => { setMatches(m.matches); setNeedsProfile(m.needsProfile); }).catch(() => {});
    } catch {
      toast.error("Could not save preferences");
    } finally {
      setSaving(false);
    }
  };

  const onApplyClick = async (m: JobMatch) => {
    if (m.isCompanyJob) {
      setApplyingId(m.id);
      try {
        await applyInternal(m.id);
        toast.success(`Applied to ${m.title}`);
        setMatches((xs) => xs.map((x) => (x.id === m.id && x.isCompanyJob ? { ...x, applicationStatus: "applied", hasApplied: true } : x)));
      } catch (err: any) {
        if (err?.response?.status === 409) toast.info("You've already applied to this job");
        else toast.error(err?.response?.data?.message || "Could not apply");
      } finally {
        setApplyingId(null);
      }
      return;
    }
    setPanel({ jobId: m.id, applicationId: m.applicationId ?? undefined, title: m.title, company: m.company });
  };

  const skip = async (a: Application) => {
    try {
      await dismissApplication(a.id);
      setApps((xs) => xs.map((x) => (x.id === a.id ? { ...x, status: "rejected" } : x)));
    } catch {
      toast.error("Could not update");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#F8FAFC] relative overflow-y-auto">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-white border-b border-gray-200 w-full shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Toggle Sidebar">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-gray-900 text-sm md:text-base">Job Agent</h2>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 w-full">
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E1B4B] rounded-2xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Your job agent finds, tailors and applies</h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                Every day it scans {sources?.companies ?? "40+"} company career pages{sources?.aggregators?.jsearch ? ", LinkedIn, Naukri, Indeed" : ""} and more for jobs that match your profile.
                It applies to AarikaAI jobs for you, and prepares a tailored resume, cover letter and form answers for the rest — you review and submit.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={toggleAgent} disabled={!config} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-sm font-medium">
                <span className={`w-9 h-5 rounded-full p-0.5 transition-colors ${config?.isAutoApplyEnabled ? "bg-emerald-500" : "bg-gray-600"}`}>
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${config?.isAutoApplyEnabled ? "translate-x-4" : ""}`} />
                </span>
                {config?.isAutoApplyEnabled ? "Daily run on" : "Daily run off"}
              </button>
              <button
                onClick={runNow}
                disabled={running || needsProfile}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-50"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                {running ? "Running…" : "Run now"}
              </button>
            </div>
          </div>
          <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-5">
            {[
              { k: "Matching jobs", v: matches.length },
              { k: "Ready to submit", v: stats.ready },
              { k: "Applied", v: stats.applied },
              { k: "Live jobs scanned", v: stats.activeJobs.toLocaleString("en-IN") },
            ].map((x) => (
              <div key={x.k}>
                <p className="text-xs text-gray-400 font-medium">{x.k}</p>
                <p className="text-xl font-bold mt-0.5">{loading ? "–" : x.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {([
            ["matches", "Matching jobs", <Briefcase key="i" className="w-4 h-4" />],
            ["applications", `Applications${stats.ready ? ` (${stats.ready} ready)` : ""}`, <FileText key="i" className="w-4 h-4" />],
            ["settings", "Preferences", <Sliders key="i" className="w-4 h-4" />],
          ] as const).map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap ${tab === id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : tab === "matches" ? (
          needsProfile ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <Info className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900">Tell the agent what you want</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">Add your target role and a few skills to your profile (or upload your resume). The agent only shows and applies to jobs that fit you.</p>
              <button onClick={() => router.push("/profile")} className="mt-4 px-5 py-2 rounded-full bg-primary text-white text-sm font-bold">Complete profile</button>
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
              No jobs match your profile closely enough right now. New jobs arrive several times a day — or lower the minimum match in Preferences.
            </div>
          ) : (
            <div className="grid gap-3">
              {matches.map((m) => {
                const st = statusOf(m.applicationStatus);
                return (
                  <div key={`${m.isCompanyJob ? "c" : "p"}-${m.id}`} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {m.companyLogo ? <img src={m.companyLogo} alt="" className="w-7 h-7 object-contain" /> : <Building2 className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{m.title}</h3>
                        {m.isCompanyJob && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">On AarikaAI</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5 flex flex-wrap items-center gap-x-2">
                        <span className="font-medium">{m.company}</span>
                        {m.location && <span className="inline-flex items-center gap-1 text-gray-500"><MapPin className="w-3 h-3" />{m.location}</span>}
                        {m.employmentType && <span className="text-gray-400">· {m.employmentType}</span>}
                      </p>
                      {m.matchReasons && m.matchReasons.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.matchReasons.slice(0, 3).map((r) => (
                            <span key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">{r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${m.matchScore >= 75 ? "text-emerald-600" : m.matchScore >= 60 ? "text-amber-600" : "text-gray-600"}`}>{m.matchScore}%</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">match</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.applicationStatus !== "unapplied" && <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${st.cls}`}>{st.label}</span>}
                        {m.applicationStatus !== "applied" && (
                          <button
                            onClick={() => onApplyClick(m)}
                            disabled={applyingId === m.id}
                            className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-blue-600 disabled:opacity-60"
                          >
                            {applyingId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            {m.isCompanyJob ? "Apply in one click" : m.applicationStatus === "ready_to_apply" ? "Review & submit" : "Smart Apply"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : tab === "applications" ? (
          apps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
              No applications yet. Use Smart Apply on a matching job, or press Run now.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {stats.preparing > 0 && (
                <div className="px-4 py-3 text-xs text-indigo-700 bg-indigo-50 flex items-center gap-2 rounded-t-2xl">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Preparing {stats.preparing} application{stats.preparing > 1 ? "s" : ""} in the background.
                  <button onClick={load} className="underline font-semibold">Refresh</button>
                </div>
              )}
              {apps.map((a) => {
                const st = statusOf(a.status);
                const external = !!a.jobId;
                return (
                  <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{a.jobTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                        <span>{a.companyName}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(a.appliedAt || a.createdAt).toLocaleDateString()}</span>
                        {a.atsScore != null && <span>ATS {a.atsScore}%</span>}
                        {a.submissionMode === "internal_ats" && <span className="text-indigo-600 font-medium">Applied via AarikaAI</span>}
                      </p>
                      {a.status === "ready_to_apply" && a.needsYou.length > 0 && (
                        <p className="text-[11px] text-amber-700 mt-1 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {a.needsYou.length} question{a.needsYou.length > 1 ? "s" : ""} only you can answer</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                      {external && ["ready_to_apply", "failed", "applied"].includes(a.status) && (
                        <button
                          onClick={() => setPanel({ applicationId: a.id, jobId: a.jobId ?? undefined, title: a.jobTitle, company: a.companyName })}
                          className="px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-bold"
                        >
                          {a.status === "applied" ? "View" : a.status === "failed" ? "Retry" : "Review & submit"}
                        </button>
                      )}
                      {a.status === "ready_to_apply" && (
                        <button onClick={() => skip(a)} className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800">Skip</button>
                      )}
                      {a.jobLink && !external && (
                        <a href={a.jobLink} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-gray-700"><ExternalLink className="w-4 h-4" /></a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          config && (
            <form onSubmit={saveSettings} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-5 max-w-3xl">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Minimum match for the agent: {config.minMatchPercentage}%</label>
                  <input type="range" min={40} max={95} step={5} value={config.minMatchPercentage}
                    onChange={(e) => setConfig({ ...config, minMatchPercentage: Number(e.target.value) })} className="w-full mt-2 accent-indigo-600" />
                  <p className="text-[11px] text-gray-500">Higher = fewer, closer matches.</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Applications per day</label>
                  <input type="number" min={1} max={25} value={config.maxApplicationsPerDay}
                    onChange={(e) => setConfig({ ...config, maxApplicationsPerDay: Number(e.target.value) })}
                    className="w-full mt-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <ChipInput label="Target roles (in addition to your profile)" values={config.targetRoles || []} onChange={(v) => setConfig({ ...config, targetRoles: v })} placeholder="e.g. Frontend Developer" />
              <ChipInput label="Preferred locations" values={config.preferredLocations || []} onChange={(v) => setConfig({ ...config, preferredLocations: v })} placeholder="e.g. Bengaluru, Remote" />
              <div>
                <label className="text-xs font-semibold text-gray-700">Job types</label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {["Full-time", "Internship", "Contract", "Part-time", "Remote"].map((t) => {
                    const on = (config.preferredJobTypes || []).includes(t);
                    return (
                      <button type="button" key={t}
                        onClick={() => setConfig({ ...config, preferredJobTypes: on ? config.preferredJobTypes.filter((x) => x !== t) : [...(config.preferredJobTypes || []), t] })}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${on ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200"}`}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <ChipInput label="Must mention (any of)" values={config.includeKeywords || []} onChange={(v) => setConfig({ ...config, includeKeywords: v })} placeholder="e.g. React" />
                <ChipInput label="Never apply if it mentions" values={config.excludeKeywords || []} onChange={(v) => setConfig({ ...config, excludeKeywords: v })} placeholder="e.g. unpaid, commission" />
              </div>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save preferences
              </button>
            </form>
          )
        )}

        {/* Where jobs come from */}
        {sources && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm">
            <p className="font-semibold text-gray-900 mb-2">Where your jobs come from</p>
            <div className="flex flex-wrap gap-2">
              {sources.activeBySource.map((s) => (
                <span key={s.source} className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700">
                  {SOURCE_NAMES[s.source] || s.source}: <b>{s.count.toLocaleString("en-IN")}</b>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Closed jobs are removed automatically: when a company takes a job down, it disappears from AarikaAI on the next sync.</p>
          </div>
        )}
      </div>

      <SmartApplyPanel
        open={!!panel}
        onOpenChange={(o) => { if (!o) { setPanel(null); load(); } }}
        jobId={panel?.jobId}
        applicationId={panel?.applicationId}
        jobTitle={panel?.title}
        company={panel?.company}
      />
    </div>
  );
}
