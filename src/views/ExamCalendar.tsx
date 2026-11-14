"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu, CalendarDays, ExternalLink, Loader2, AlertCircle, RotateCcw, CheckCircle2, XCircle, HelpCircle,
  ChevronDown, ChevronUp, GraduationCap, Award, SearchX,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { isNotEligibleError } from "@/services/careerDiscoveryService";
import {
  CalendarExam, EligibilityResult, ExamCalendarResponse, ExamCategory, ProfileFacts, RegistrationStatus,
  ScholarshipItem, ScholarshipsResponse, getExamCalendar, getScholarships,
} from "@/services/examCalendarService";

type Tab = "exams" | "scholarships";
type LoadState = "loading" | "ready" | "error" | "notEligible";

const CATEGORY_LABEL: Record<ExamCategory, string> = {
  engineering: "Engineering",
  medical: "Medical",
  law: "Law",
  design: "Design",
  defence: "Defence",
  commerce: "Commerce",
  university: "University",
  olympiad: "Olympiads",
  govt: "Govt jobs",
};
const DEFAULT_CATEGORIES: ExamCategory[] = ["engineering", "medical", "law", "design", "defence", "commerce", "university", "olympiad"];

const REG_BADGE: Record<RegistrationStatus, { label: string; cls: string }> = {
  open: { label: "Registration open", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  upcoming: { label: "Registration soon", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  closed: { label: "Registration closed", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  unknown: { label: "Check notification", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "TBA";

const daysText = (n: number | null) => (n == null ? "—" : n === 0 ? "Today" : n === 1 ? "1 day" : `${n} days`);

function factsSummary(f: ProfileFacts | undefined) {
  if (!f) return "";
  const parts: string[] = [];
  if (f.class != null) parts.push(f.class <= 12 ? `Class ${f.class}` : f.class === 13 ? "12th pass" : "Graduate");
  if (f.stream) parts.push(/^[A-Z]{4,}$/.test(f.stream) ? f.stream[0] + f.stream.slice(1).toLowerCase() : f.stream);
  if (f.age != null) parts.push(`Age ${f.age}`);
  if (f.category) parts.push(f.category);
  if (f.state) parts.push(f.state);
  return parts.join(" · ");
}

// ── pieces ─────────────────────────────────────────────────────
function EligibilityBadge({ result }: { result: EligibilityResult }) {
  const [open, setOpen] = useState(false);
  const meta =
    result.eligible === true
      ? { label: "You're eligible", icon: <CheckCircle2 size={13} />, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : result.eligible === false
        ? { label: "Not eligible yet", icon: <XCircle size={13} />, cls: "bg-rose-50 text-rose-700 border-rose-200" }
        : { label: "Check eligibility", icon: <HelpCircle size={13} />, cls: "bg-amber-50 text-amber-800 border-amber-200" };
  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}
      >
        {meta.icon}
        {meta.label}
        {result.reasons.length > 0 && (open ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>
      {open && result.reasons.length > 0 && (
        <ul className="mt-2 space-y-1 rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
          {result.reasons.map((r, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-gray-400">•</span>
              <span className="min-w-0 break-words">{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Countdown({ days, label }: { days: number | null; label: string | null }) {
  const urgent = days != null && days <= 7;
  return (
    <div className={`shrink-0 rounded-xl px-3 py-2 text-center ${urgent ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-700"}`}>
      <p className="text-lg font-bold leading-none tabular-nums">{days == null ? "—" : days}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide">{days === 1 ? "day" : "days"}</p>
      {label && <p className="mt-0.5 max-w-[84px] text-[10px] leading-tight opacity-80">{label}</p>}
    </div>
  );
}

function OfficialLink({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline">
      Official website <ExternalLink size={12} />
    </a>
  );
}

function ExamCard({ exam }: { exam: CalendarExam }) {
  const reg = REG_BADGE[exam.registrationStatus];
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              {exam.subCategory || CATEGORY_LABEL[exam.category] || exam.category}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${reg.cls}`}>{reg.label}</span>
          </div>
          <h3 className="mt-1.5 text-sm sm:text-base font-bold text-gray-900 break-words">{exam.name}</h3>
          {exam.conductingBody && <p className="text-xs text-gray-500 break-words">{exam.conductingBody}</p>}
        </div>
        <Countdown days={exam.daysToNext} label={exam.nextDateLabel} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-gray-50 px-2.5 py-2 min-w-0">
          <dt className="text-gray-500">Registration</dt>
          <dd className="font-semibold text-gray-800 break-words">
            {exam.registrationStart || exam.registrationEnd ? `${fmtDate(exam.registrationStart)} – ${fmtDate(exam.registrationEnd)}` : "See notification"}
          </dd>
        </div>
        <div className="rounded-lg bg-gray-50 px-2.5 py-2 min-w-0">
          <dt className="text-gray-500">Exam date</dt>
          <dd className="font-semibold text-gray-800">
            {fmtDate(exam.examDate)}
            {exam.daysToExam != null && exam.daysToExam >= 0 && <span className="font-normal text-gray-500"> · {daysText(exam.daysToExam)}</span>}
          </dd>
        </div>
      </dl>

      {exam.description && <p className="mt-3 text-xs text-gray-600">{exam.description}</p>}

      <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
        <EligibilityBadge result={exam.eligibility} />
        <OfficialLink url={exam.officialUrl} />
      </div>
    </article>
  );
}

function ScholarshipCard({ s }: { s: ScholarshipItem }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 break-words">{s.name}</h3>
          {s.provider && <p className="text-xs text-gray-500 break-words">{s.provider}</p>}
          {s.amount && <p className="mt-1.5 text-sm font-semibold text-emerald-700 break-words">{s.amount}</p>}
        </div>
        <Countdown days={s.daysToDeadline} label={s.deadline ? "to deadline" : "Rolling"} />
      </div>
      <p className="mt-2 text-xs text-gray-500">Deadline: <span className="font-semibold text-gray-800">{s.deadline ? fmtDate(s.deadline) : "Varies — check website"}</span></p>
      {s.description && <p className="mt-2 text-xs text-gray-600">{s.description}</p>}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
        <EligibilityBadge result={s.eligibility} />
        <OfficialLink url={s.officialUrl} />
      </div>
    </article>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
          <div className="mt-4 h-10 w-full rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function StateMessage({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">{icon}</div>
      <p className="mt-3 text-sm font-bold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── main view ──────────────────────────────────────────────────
export default function ExamCalendar() {
  const { toggleSidebar } = useAuth();
  const [tab, setTab] = useState<Tab>("exams");
  const [category, setCategory] = useState<ExamCategory | null>(null);
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const [exams, setExams] = useState<ExamCalendarResponse | null>(null);
  const [examState, setExamState] = useState<LoadState>("loading");
  const [categories, setCategories] = useState<ExamCategory[]>(DEFAULT_CATEGORIES);

  const [scholarships, setScholarships] = useState<ScholarshipsResponse | null>(null);
  const [schState, setSchState] = useState<LoadState>("loading");

  const loadExams = useCallback(async () => {
    setExamState("loading");
    try {
      const res = await getExamCalendar({ category, eligibleOnly });
      setExams(res);
      if (res.categories?.length) setCategories(res.categories);
      setExamState("ready");
    } catch (err) {
      setExamState(isNotEligibleError(err) ? "notEligible" : "error");
    }
  }, [category, eligibleOnly]);

  const loadScholarships = useCallback(async () => {
    setSchState("loading");
    try {
      setScholarships(await getScholarships({ eligibleOnly }));
      setSchState("ready");
    } catch (err) {
      setSchState(isNotEligibleError(err) ? "notEligible" : "error");
    }
  }, [eligibleOnly]);

  useEffect(() => {
    if (tab === "exams") loadExams();
  }, [tab, loadExams]);
  useEffect(() => {
    if (tab === "scholarships") loadScholarships();
  }, [tab, loadScholarships]);

  const state = tab === "exams" ? examState : schState;
  const facts = (tab === "exams" ? exams?.profileFacts : scholarships?.profileFacts) ?? undefined;
  const summary = factsSummary(facts);
  const retry = tab === "exams" ? loadExams : loadScholarships;

  let content: React.ReactNode;
  if (state === "notEligible") {
    content = (
      <StateMessage
        icon={<GraduationCap size={18} />}
        title="This calendar is for school students and govt exam aspirants"
        body="Ask Aarika about exams and deadlines that matter for your goals."
        action={<Link href="/chat" className="inline-flex rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white">Go to chat</Link>}
      />
    );
  } else if (state === "loading") {
    content = <SkeletonList />;
  } else if (state === "error") {
    content = (
      <StateMessage
        icon={<AlertCircle size={18} />}
        title="Couldn't load this list"
        body="Check your internet connection and try again."
        action={
          <button onClick={retry} className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white">
            <RotateCcw size={14} /> Try again
          </button>
        }
      />
    );
  } else if (tab === "exams") {
    const list = exams?.data ?? [];
    content = list.length ? (
      <div className="space-y-3">{list.map((e) => <ExamCard key={e.id} exam={e} />)}</div>
    ) : (
      <StateMessage
        icon={<SearchX size={18} />}
        title="No upcoming exams here"
        body={eligibleOnly || category ? "Try another category or turn off “Eligible only”." : "New dates are added as exams are announced. Check back soon."}
      />
    );
  } else {
    const list = scholarships?.data ?? [];
    content = list.length ? (
      <div className="space-y-3">{list.map((s) => <ScholarshipCard key={s.id} s={s} />)}</div>
    ) : (
      <StateMessage
        icon={<SearchX size={18} />}
        title="No open scholarships right now"
        body={eligibleOnly ? "Turn off “Eligible only” to see everything." : "New scholarships are added every cycle. Check back soon."}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-[#F8FAFC] overflow-hidden">
      <header className="flex items-center gap-2 px-3 md:px-6 py-2.5 bg-white border-b border-gray-200">
        <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Toggle Sidebar" aria-label="Toggle sidebar">
          <Menu className="w-5 h-5" />
        </button>
        <CalendarDays className="w-5 h-5 text-primary" />
        <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">Exams &amp; Scholarships</h1>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
          {/* Tabs */}
          <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1" role="tablist">
            {([
              ["exams", "Exams", <CalendarDays key="i" size={15} />],
              ["scholarships", "Scholarships", <Award key="i" size={15} />],
            ] as [Tab, string, React.ReactNode][]).map(([id, label, icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  tab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Filters */}
          {tab === "exams" && (
            <div className="flex flex-wrap gap-1.5" aria-label="Filter by category">
              {[null, ...categories].map((c) => (
                <button
                  key={c ?? "all"}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    category === c ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {c ? CATEGORY_LABEL[c] ?? c : "All"}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <label htmlFor="eligible-only" className="text-sm font-semibold text-gray-900">Eligible only</label>
              <p className="text-[11px] text-gray-500">Hides what you definitely can&apos;t apply for</p>
            </div>
            <Switch id="eligible-only" checked={eligibleOnly} onCheckedChange={setEligibleOnly} />
          </div>

          {summary && state === "ready" && (
            <p className="px-1 text-[11px] text-gray-500">
              Eligibility based on your profile: <span className="font-semibold text-gray-700">{summary}</span>.{" "}
              <Link href="/profile" className="font-semibold text-indigo-700 hover:underline">Update profile</Link>
            </p>
          )}

          {content}

          <p className="px-1 pb-6 text-[11px] text-gray-400">
            Dates are indicative and can change. Always confirm on the official website before applying.
          </p>
        </div>
      </main>
    </div>
  );
}
