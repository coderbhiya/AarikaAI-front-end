"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getProductMetrics, type ProductMetrics } from "@/services/adminService";

// The three numbers that decide what to build next:
//   1. Do people come back for a second mock interview?
//   2. After the free interview, do free users go towards upgrading?
//   3. Which features does nobody use? (candidates to hide)
// Data: backend GET /admin/analytics/product (page views come from usePageTracking).

const FEATURE_LABELS: Record<string, string> = {
  chat: "AI Chat",
  job_agent: "Job Agent",
  jobs: "Jobs",
  open_jobs: "Open Jobs",
  internships: "Internships",
  tracker: "Application Tracker",
  resume_builder: "Resume Builder",
  mock_interview: "Mock Interview (text)",
  mock_interview_live: "Mock Interview (live)",
  exam_simulator: "Exam Simulator",
  career_discovery: "Career Discovery",
  exam_calendar: "Exam Calendar",
  learning: "Learning",
  tools: "Career Tools",
  community: "Community",
  skill_score: "Skill Score",
  journey: "Journey",
  notifications: "Notifications",
  profile: "Profile",
  subscription: "Plans / Subscription",
};

const fmtPct = (v: number | null) => (v == null ? "–" : `${v}%`);

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}

export default function ProductMetricsTab() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [segment, setSegment] = useState<"fresher" | "all">("fresher");
  const [data, setData] = useState<ProductMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getProductMetrics(days, segment));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Could not load product metrics");
    } finally {
      setLoading(false);
    }
  }, [days, segment]);

  useEffect(() => {
    load();
  }, [load]);

  const maxUsers = Math.max(1, ...(data?.featureUsage.map((f) => f.users) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Product metrics</h2>
          <p className="text-sm text-slate-500">
            {segment === "fresher" ? "College students + job seekers (the focus segment)" : "All users"} · last {days} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold" role="group" aria-label="Segment">
            {(["fresher", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSegment(s)}
                className={`rounded-md px-3 py-1.5 ${segment === s ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {s === "fresher" ? "Freshers" : "Everyone"}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold" role="group" aria-label="Period">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-md px-3 py-1.5 ${days === d ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button onClick={load} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100" aria-label="Refresh">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="New sign-ups" value={data.signups} />
            <Stat label="Active users" value={data.activeUsers} sub="Opened at least one page" />
            <Stat
              label="Came back for a 2nd interview"
              value={fmtPct(data.repeatInterviews.repeatRate)}
              sub={`${data.repeatInterviews.cameBackForSecond} of ${data.repeatInterviews.triedFirstInterview} who tried one`}
            />
            <Stat
              label="Free → looked at plans"
              value={fmtPct(data.upgradeFunnel.viewedPlansRate)}
              sub={`${data.upgradeFunnel.viewedPlans} of ${data.upgradeFunnel.freeUsersWhoInterviewed} free interviewees`}
            />
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Upgrade funnel (free users who did an interview)</h3>
            <ol className="mt-4 grid gap-3 sm:grid-cols-4">
              {[
                { label: "Did a free interview", n: data.upgradeFunnel.freeUsersWhoInterviewed },
                { label: "Hit the monthly limit", n: data.upgradeFunnel.hitMonthlyLimit },
                { label: "Looked at plans", n: data.upgradeFunnel.viewedPlans },
                { label: "Paid", n: data.upgradeFunnel.paid },
              ].map((step, i) => (
                <li key={step.label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">
                    {i + 1}. {step.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{step.n}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-slate-500">
              Interview completion: {data.repeatInterviews.finishedOne} of {data.repeatInterviews.triedFirstInterview} new interviewees finished at least one.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-bold text-slate-900">Feature usage</h3>
              <p className="text-xs text-slate-500">Distinct users who opened the page</p>
            </div>
            <ul className="mt-4 space-y-2">
              {data.featureUsage.map((f) => (
                <li key={f.feature} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm">
                  <span className={`truncate ${f.users === 0 ? "text-slate-400" : "text-slate-700"}`}>{FEATURE_LABELS[f.feature] || f.feature}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full rounded-full bg-blue-600" style={{ width: `${(f.users / maxUsers) * 100}%` }} />
                  </span>
                  <span className="w-28 text-right tabular-nums text-xs text-slate-600">
                    {f.users} users · {f.views} views
                  </span>
                </li>
              ))}
            </ul>
            {data.unusedFeatures.length ? (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                Nobody in this segment opened: {data.unusedFeatures.map((f) => FEATURE_LABELS[f] || f).join(", ")}. Candidates to hide from the
                sidebar once there are enough users to trust the numbers.
              </p>
            ) : null}
          </section>
        </>
      ) : loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : null}
    </div>
  );
}
