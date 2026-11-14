"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Menu, GraduationCap, Search, MapPin, Wifi, Building2, ExternalLink, Bookmark, CheckCircle2, Loader2,
  Briefcase, KanbanSquare, Trash2, Plus, X, Info, AlertTriangle, CalendarClock, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInternships, HubJob, HubType } from "@/services/internshipService";
import {
  createTracked, deleteTracked, listTracked, updateTracked, STAGE_LABELS, TRACKER_STAGES, TrackedApplication, TrackerStage,
} from "@/services/trackerService";

type Tab = "internship" | "fresher" | "tracker";

const STAGE_STYLE: Record<TrackerStage, string> = {
  saved: "bg-slate-100 text-slate-700 border-slate-200",
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  interview: "bg-amber-50 text-amber-800 border-amber-200",
  offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-gray-100 text-gray-500 border-gray-200",
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
const toDateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const errMsg = (err: any, fallback: string) => err?.response?.data?.message || fallback;

function Empty({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 sm:p-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">{icon}</div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      {children && <div className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{children}</div>}
    </div>
  );
}

// ── Job card ──────────────────────────────────────────────────────────────

function JobCard({ job, onTrack, trackingId }: { job: HubJob; onTrack: (job: HubJob, stage: TrackerStage) => void; trackingId: number | null }) {
  const [askTrack, setAskTrack] = useState(false);
  const busy = trackingId === job.id;
  const tracked = job.trackedStage as TrackerStage | null | undefined;
  const scoreCls = job.matchPercentage >= 70 ? "text-emerald-600" : job.matchPercentage >= 45 ? "text-amber-600" : "text-gray-500";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          {job.companyLogo ? <img src={job.companyLogo} alt="" className="w-7 h-7 object-contain" /> : <Building2 className="w-5 h-5 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-[15px] leading-snug break-words min-w-0">{job.title}</h3>
            <div className="text-right shrink-0">
              <p className={`text-lg font-bold leading-none ${scoreCls}`}>{job.matchPercentage}%</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">match</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {job.company && <span className="font-medium break-words">{job.company}</span>}
            {job.location && (
              <span className="inline-flex items-center gap-1 text-gray-500 min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="break-words">{job.location}</span>
              </span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.category && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {job.category === "internship" ? "Internship" : "Fresher"}
              </span>
            )}
            {job.isRemote && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 inline-flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Remote
              </span>
            )}
            {job.jobSalary && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">{job.jobSalary}</span>}
            {job.postedAt && <span className="text-[11px] px-2 py-0.5 text-gray-400">Posted {fmtDate(job.postedAt)}</span>}
          </div>
          {job.whyMatch && (
            <p className="mt-2 text-xs text-gray-600 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span className="break-words">{job.whyMatch}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {tracked ? (
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STAGE_STYLE[tracked] || STAGE_STYLE.saved}`}>
            Tracked · {STAGE_LABELS[tracked] || tracked}
          </span>
        ) : (
          <button
            onClick={() => onTrack(job, "saved")}
            disabled={busy}
            className="px-3 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bookmark className="w-3.5 h-3.5" />} Save
          </button>
        )}
        {job.applyUrl ? (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { if (tracked !== "applied") setAskTrack(true); }}
            className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-blue-600"
          >
            Apply <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs text-gray-400">No apply link</span>
        )}
      </div>

      {askTrack && (
        <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-xs text-indigo-900 font-medium flex-1">Track this in My applications?</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { onTrack(job, "applied"); setAskTrack(false); }}
              disabled={busy}
              className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-60"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> I applied
            </button>
            {!tracked && (
              <button
                onClick={() => { onTrack(job, "saved"); setAskTrack(false); }}
                disabled={busy}
                className="px-3 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold disabled:opacity-60"
              >
                Save for later
              </button>
            )}
            <button onClick={() => setAskTrack(false)} className="p-1.5 text-indigo-400 hover:text-indigo-700" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tracker card ──────────────────────────────────────────────────────────

function TrackerCard({
  item, onChange, onDelete,
}: { item: TrackedApplication; onChange: (id: number, patch: Partial<TrackedApplication>) => Promise<void>; onDelete: (id: number) => void }) {
  const [notes, setNotes] = useState(item.notes || "");
  const [showNotes, setShowNotes] = useState(!!item.notes);
  useEffect(() => setNotes(item.notes || ""), [item.notes]);

  const saveNotes = () => {
    if ((item.notes || "") !== notes) onChange(item.id, { notes: notes.trim() || null });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm break-words">{item.title}</p>
          <p className="text-xs text-gray-500 break-words">
            {item.company || "—"}
            {item.appliedAt && <> · Applied {fmtDate(item.appliedAt)}</>}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {item.applyUrl && (
            <a href={item.applyUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-primary" aria-label="Open listing">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600" aria-label="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="text-[11px] font-semibold text-gray-500">
          Stage
          <select
            value={item.stage}
            onChange={(e) => onChange(item.id, { stage: e.target.value as TrackerStage })}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800"
          >
            {TRACKER_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
        </label>
        <label className="text-[11px] font-semibold text-gray-500">
          Next follow-up
          <input
            type="date"
            value={toDateInput(item.nextActionAt)}
            onChange={(e) => onChange(item.id, { nextActionAt: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800"
          />
        </label>
      </div>

      {showNotes ? (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={2}
          maxLength={5000}
          placeholder="Notes: recruiter name, rounds, what to prepare…"
          className="mt-2 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-primary resize-y"
        />
      ) : (
        <button onClick={() => setShowNotes(true)} className="mt-2 text-xs font-semibold text-primary">+ Add notes</button>
      )}
    </div>
  );
}

function AddApplicationForm({ onCreated, onCancel }: { onCreated: (item: TrackedApplication) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [stage, setStage] = useState<TrackerStage>("applied");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const r = await createTracked({ title: title.trim(), company: company.trim() || undefined, applyUrl: applyUrl.trim() || undefined, stage });
      onCreated(r.item);
      toast.success("Added to My applications");
    } catch (err) {
      toast.error(errMsg(err, "Could not add this application"));
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary";
  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Add an application from anywhere</h3>
        <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Role (e.g. Marketing Intern)*" className={input} maxLength={255} required />
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className={input} maxLength={255} />
        <input value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} placeholder="Link (https://…)" className={input} type="url" />
        <select value={stage} onChange={(e) => setStage(e.target.value as TrackerStage)} className={input}>
          {TRACKER_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
      </div>
      <button disabled={saving || !title.trim()} className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-60">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add
      </button>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function Internships() {
  const { toggleSidebar } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("internship");

  // Hub state
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [applied, setApplied] = useState({ q: "", location: "", remote: false });
  const [jobs, setJobs] = useState<HubJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [notEligible, setNotEligible] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<number | null>(null);

  // Tracker state
  const [items, setItems] = useState<TrackedApplication[]>([]);
  const [counts, setCounts] = useState<Record<TrackerStage, number> | null>(null);
  const [loadingTracker, setLoadingTracker] = useState(false);
  const [trackerError, setTrackerError] = useState<string | null>(null);
  const [trackerBlocked, setTrackerBlocked] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const hubType: HubType | null = tab === "tracker" ? null : tab;

  const loadJobs = useCallback(async (type: HubType, filters: typeof applied, nextPage = 1) => {
    if (nextPage === 1) setLoadingJobs(true); else setLoadingMore(true);
    setJobsError(null);
    try {
      const r = await getInternships({ type, q: filters.q, location: filters.location, remote: filters.remote, page: nextPage, limit: 20 });
      setJobs((prev) => (nextPage === 1 ? r.items : [...prev, ...r.items]));
      setTotal(r.total);
      setPage(r.page);
      setTotalPages(r.totalPages);
      setNeedsProfile(r.needsProfile);
      setNotEligible(null);
    } catch (err: any) {
      if (err?.response?.status === 403) setNotEligible(err.response.data?.message || "This section isn't available for your profile.");
      else setJobsError(errMsg(err, "Could not load listings. Please try again."));
    } finally {
      setLoadingJobs(false);
      setLoadingMore(false);
    }
  }, []);

  const loadTracker = useCallback(async () => {
    setLoadingTracker(true);
    setTrackerError(null);
    try {
      const r = await listTracked();
      setItems(r.items);
      setCounts(r.counts);
      setTrackerBlocked(null);
    } catch (err: any) {
      if (err?.response?.status === 403) setTrackerBlocked(err.response.data?.message || "The application tracker isn't available for your profile.");
      else setTrackerError(errMsg(err, "Could not load your applications."));
    } finally {
      setLoadingTracker(false);
    }
  }, []);

  useEffect(() => {
    if (hubType) loadJobs(hubType, applied, 1);
  }, [hubType, applied, loadJobs]);

  useEffect(() => { loadTracker(); }, [loadTracker]);

  const recount = (list: TrackedApplication[]) => {
    const c = Object.fromEntries(TRACKER_STAGES.map((s) => [s, 0])) as Record<TrackerStage, number>;
    list.forEach((i) => { c[i.stage] = (c[i.stage] || 0) + 1; });
    setCounts(c);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied({ q: q.trim(), location: location.trim(), remote });
  };

  const toggleRemote = () => {
    const next = !remote;
    setRemote(next);
    setApplied((a) => ({ ...a, remote: next }));
  };

  const trackJob = async (job: HubJob, stage: TrackerStage) => {
    setTrackingId(job.id);
    try {
      const r = await createTracked({ jobId: job.id, stage });
      setJobs((xs) => xs.map((x) => (x.id === job.id ? { ...x, trackedId: r.item.id, trackedStage: r.item.stage } : x)));
      setItems((xs) => {
        const next = [r.item, ...xs.filter((x) => x.id !== r.item.id)];
        recount(next);
        return next;
      });
      toast.success(stage === "applied" ? "Marked as applied" : "Saved to My applications");
    } catch (err) {
      toast.error(errMsg(err, "Could not track this job"));
    } finally {
      setTrackingId(null);
    }
  };

  const changeItem = async (id: number, patch: Partial<TrackedApplication>) => {
    const before = items;
    const optimistic = items.map((x) => (x.id === id ? { ...x, ...patch } : x));
    setItems(optimistic);
    recount(optimistic);
    try {
      const r = await updateTracked(id, {
        stage: patch.stage, notes: patch.notes, nextActionAt: patch.nextActionAt,
      });
      setItems((xs) => xs.map((x) => (x.id === id ? r.item : x)));
      if (patch.stage) {
        setJobs((xs) => xs.map((j) => (j.trackedId === id ? { ...j, trackedStage: r.item.stage } : j)));
      }
      if (patch.notes !== undefined) toast.success("Notes saved");
    } catch (err) {
      setItems(before);
      recount(before);
      toast.error(errMsg(err, "Could not update"));
    }
  };

  const removeItem = async (id: number) => {
    if (!window.confirm("Remove this application from your tracker?")) return;
    const before = items;
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    recount(next);
    try {
      await deleteTracked(id);
      setJobs((xs) => xs.map((j) => (j.trackedId === id ? { ...j, trackedId: null, trackedStage: null } : j)));
    } catch (err) {
      setItems(before);
      recount(before);
      toast.error(errMsg(err, "Could not delete"));
    }
  };

  const grouped = useMemo(
    () => TRACKER_STAGES.map((s) => ({ stage: s, list: items.filter((i) => i.stage === s) })).filter((g) => g.list.length > 0),
    [items]
  );

  const upcoming = useMemo(
    () => items.filter((i) => i.nextActionAt && !["offer", "rejected"].includes(i.stage))
      .sort((a, b) => new Date(a.nextActionAt!).getTime() - new Date(b.nextActionAt!).getTime())[0],
    [items]
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "internship", label: "Internships", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "fresher", label: "Fresher jobs", icon: <Briefcase className="w-4 h-4" /> },
    { id: "tracker", label: `My applications${items.length ? ` (${items.length})` : ""}`, icon: <KanbanSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#F8FAFC] relative overflow-y-auto overflow-x-hidden">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-white border-b border-gray-200 w-full shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Toggle Sidebar">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <GraduationCap className="w-5 h-5 text-primary shrink-0" />
            <h2 className="font-bold text-gray-900 text-sm md:text-base truncate">Internships & Fresher Jobs</h2>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 w-full">
        <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E1B4B] rounded-2xl p-5 sm:p-6 text-white shadow-xl">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Start your career with the right first role</h1>
          <p className="text-gray-300 text-sm mt-1.5 leading-relaxed">
            Internships and fresher openings across India and remote, ranked by how well they fit your profile. Apply on the company site, then track every application here.
          </p>
        </div>

        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap ${tab === t.id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {hubType ? (
          <>
            <form onSubmit={onSearch} className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0 rounded-xl border border-gray-200 px-3">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Role, skill or company" className="flex-1 min-w-0 py-2 text-sm outline-none" maxLength={100} />
              </div>
              <div className="flex items-center gap-2 sm:w-48 min-w-0 rounded-xl border border-gray-200 px-3">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" className="flex-1 min-w-0 py-2 text-sm outline-none" maxLength={100} />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleRemote}
                  aria-pressed={remote}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-xl border text-sm font-semibold inline-flex items-center justify-center gap-1.5 ${remote ? "bg-teal-50 border-teal-300 text-teal-700" : "border-gray-200 text-gray-600"}`}
                >
                  <Wifi className="w-4 h-4" /> Remote
                </button>
                <button type="submit" className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold">Search</button>
              </div>
            </form>

            {needsProfile && !notEligible && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span className="flex-1">Add your target role and a few skills to your profile to get better-ranked matches.</span>
                <button onClick={() => router.push("/profile")} className="text-xs font-bold underline self-start sm:self-auto">Update profile</button>
              </div>
            )}

            {loadingJobs ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-white border border-gray-200 animate-pulse" />)}
              </div>
            ) : notEligible ? (
              <Empty icon={<Info className="w-5 h-5" />} title="Not available for your profile">
                {notEligible}
                <div className="mt-4">
                  <button onClick={() => router.push("/jobs")} className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold">Go to Mission Hunt</button>
                </div>
              </Empty>
            ) : jobsError ? (
              <Empty icon={<AlertTriangle className="w-5 h-5" />} title="Something went wrong">
                {jobsError}
                <div className="mt-4">
                  <button onClick={() => loadJobs(hubType, applied, 1)} className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold">Retry</button>
                </div>
              </Empty>
            ) : jobs.length === 0 ? (
              <Empty icon={<Search className="w-5 h-5" />} title={`No ${hubType === "internship" ? "internships" : "fresher jobs"} found`}>
                {applied.q || applied.location || applied.remote ? "Try removing a filter or searching for something broader." : "New listings arrive several times a day — check back soon."}
              </Empty>
            ) : (
              <>
                <p className="text-xs text-gray-500">{total} {hubType === "internship" ? "internships" : "fresher jobs"}, best matches first</p>
                <div className="grid gap-3">
                  {jobs.map((j) => <JobCard key={j.id} job={j} onTrack={trackJob} trackingId={trackingId} />)}
                </div>
                {page < totalPages && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => loadJobs(hubType, applied, page + 1)}
                      disabled={loadingMore}
                      className="px-5 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />} Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {trackerBlocked ? (
              <Empty icon={<Info className="w-5 h-5" />} title="Not available for your profile">{trackerBlocked}</Empty>
            ) : loadingTracker && !counts ? (
              <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : trackerError ? (
              <Empty icon={<AlertTriangle className="w-5 h-5" />} title="Something went wrong">
                {trackerError}
                <div className="mt-4"><button onClick={loadTracker} className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold">Retry</button></div>
              </Empty>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {TRACKER_STAGES.map((s) => (
                    <div key={s} className={`rounded-xl border px-3 py-2 ${STAGE_STYLE[s]}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide">{STAGE_LABELS[s]}</p>
                      <p className="text-xl font-bold">{counts?.[s] ?? 0}</p>
                    </div>
                  ))}
                </div>

                {upcoming && (
                  <div className="rounded-xl bg-white border border-gray-200 p-3 text-sm text-gray-700 flex items-start gap-2">
                    <CalendarClock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="break-words">Next follow-up: <b>{upcoming.title}</b>{upcoming.company ? ` at ${upcoming.company}` : ""} on {fmtDate(upcoming.nextActionAt)}</span>
                  </div>
                )}

                {showAdd ? (
                  <AddApplicationForm
                    onCreated={(item) => { const next = [item, ...items]; setItems(next); recount(next); setShowAdd(false); }}
                    onCancel={() => setShowAdd(false)}
                  />
                ) : (
                  <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-full border border-dashed border-gray-300 bg-white text-sm font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:border-primary hover:text-primary">
                    <Plus className="w-4 h-4" /> Add an application from another site
                  </button>
                )}

                {items.length === 0 ? (
                  <Empty icon={<KanbanSquare className="w-5 h-5" />} title="No applications tracked yet">
                    Save or apply to a listing from the Internships or Fresher jobs tab, or add one you applied to elsewhere.
                  </Empty>
                ) : (
                  <div className="space-y-5">
                    {grouped.map((g) => (
                      <section key={g.stage}>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full border ${STAGE_STYLE[g.stage]}`} />
                          {STAGE_LABELS[g.stage]} · {g.list.length}
                        </h3>
                        <div className="grid gap-2 md:grid-cols-2">
                          {g.list.map((i) => <TrackerCard key={i.id} item={i} onChange={changeItem} onDelete={removeItem} />)}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
