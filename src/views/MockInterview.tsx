"use client";

import InterviewNextSteps from "@/components/mockInterview/InterviewNextSteps";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Mic, Loader2, ChevronDown, ChevronUp, ArrowRight, RotateCcw, Flag, History, Info, AlertTriangle,
  CheckCircle2, TrendingUp, Users, Code2, MessageSquare, Trophy, ChevronLeft,
} from "lucide-react";
import { PAGE_COLUMN, PageHeader } from "@/components/layout/PageHeader";
import { getProfile } from "@/services/profileService";
import {
  Difficulty, InterviewAnswer, InterviewQuota, InterviewSession, InterviewSessionSummary, InterviewType, QuotaExceeded,
  finishInterview, getInterview, getInterviewQuota, getQuotaExceeded, listInterviews, startInterview, submitInterviewAnswer,
} from "@/services/mockInterviewService";
import { QuotaCounter, QuotaExceededNotice } from "@/components/mockInterview/InterviewQuota";
import {
  JobTarget, JobTargetPicker, jobTargetBody, jobTargetQuery, pastedTooShort, readJobTargetFromUrl,
} from "@/components/mockInterview/JobTargetPicker";

type Phase = "setup" | "interview" | "report";

const TYPES: { id: InterviewType; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "hr", label: "HR round", desc: "Introductions, motivation, strengths, goals", icon: <Users className="w-5 h-5" /> },
  { id: "technical", label: "Technical", desc: "Core skills, concepts, problem solving", icon: <Code2 className="w-5 h-5" /> },
  { id: "behavioral", label: "Behavioral", desc: "Past situations, answered with STAR", icon: <MessageSquare className="w-5 h-5" /> },
];
const DIFFS: Difficulty[] = ["easy", "medium", "hard"];
const TYPE_LABEL: Record<InterviewType, string> = { hr: "HR", technical: "Technical", behavioral: "Behavioral" };

const wordCount = (s: string) => (s.trim().match(/\S+/g) || []).length;
const errMsg = (err: any, fallback: string) => err?.response?.data?.message || fallback;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const scoreColor = (v: number, max = 10) => {
  const p = v / max;
  return p >= 0.7 ? "bg-emerald-500" : p >= 0.5 ? "bg-amber-500" : "bg-red-400";
};
const scoreText = (v: number, max = 10) => {
  const p = v / max;
  return p >= 0.7 ? "text-emerald-600" : p >= 0.5 ? "text-amber-600" : "text-red-500";
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-gray-600">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${scoreColor(value)}`} style={{ width: `${Math.max(0, Math.min(100, value * 10))}%` }} />
      </div>
    </div>
  );
}

function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-gray-800 text-left">
        <span className="min-w-0">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>
      {open && <div className="px-3 pb-3 text-sm text-gray-700 whitespace-pre-line break-words">{children}</div>}
    </div>
  );
}

function Busy({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 text-center">
      <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
      <p className="mt-3 font-semibold text-gray-900">{text}</p>
      {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function EvaluationView({ ev }: { ev: InterviewAnswer }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col sm:flex-row gap-4">
        <div className="sm:w-28 shrink-0 flex sm:flex-col items-center sm:justify-center gap-2 sm:border-r sm:border-gray-100 sm:pr-4">
          <p className={`text-3xl font-bold ${scoreText(ev.score.overall)}`}>{ev.score.overall}</p>
          <p className="text-[11px] text-gray-400 font-semibold uppercase">overall / 10</p>
        </div>
        <div className="flex-1 space-y-2.5 min-w-0">
          <ScoreBar label="Clarity" value={ev.score.clarity} />
          <ScoreBar label="Relevance" value={ev.score.relevance} />
          <ScoreBar label="Structure" value={ev.score.structure} />
        </div>
      </div>
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-700 mb-1">Feedback</p>
        <p className="text-sm text-indigo-950 break-words">{ev.feedback}</p>
      </div>
      {ev.improvedAnswer && <Collapsible title="See a stronger answer">{ev.improvedAnswer}</Collapsible>}
    </div>
  );
}

export default function MockInterview() {
  const [phase, setPhase] = useState<Phase>("setup");

  // Setup
  const [targetRole, setTargetRole] = useState("");
  const [jobTarget, setJobTarget] = useState<JobTarget | null>(null);
  const [interviewType, setInterviewType] = useState<InterviewType>("hr");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [starting, setStarting] = useState(false);
  const [notEligible, setNotEligible] = useState<string | null>(null);
  const [quota, setQuota] = useState<InterviewQuota | null>(null);
  const [quotaBlock, setQuotaBlock] = useState<QuotaExceeded | null>(null);

  // Interview
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [current, setCurrent] = useState<InterviewAnswer | null>(null);

  // History
  const [history, setHistory] = useState<InterviewSessionSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const r = await listInterviews();
      setHistory(r.sessions);
    } catch (err: any) {
      if (err?.response?.status === 403) setNotEligible(err.response.data?.message || "Mock interviews aren't available for your profile.");
      else setHistoryError(errMsg(err, "Could not load past interviews"));
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // Opened from a job card ("Practice interview"): practise for that job, with its title as the role.
    const fromUrl = readJobTargetFromUrl();
    if (fromUrl) {
      setJobTarget(fromUrl);
      if (fromUrl.kind !== "pasted" && fromUrl.title) setTargetRole(fromUrl.title);
    }
    loadHistory();
    getInterviewQuota()
      .then((r) => setQuota(r.quota))
      .catch(() => {}); // the counter is informational; the start call enforces the limit
    getProfile()
      .then((r: any) => {
        const p = r?.user?.UserProfile;
        const role = p?.targetRole || p?.currentRole || p?.careerSwitcherDetails?.targetDomain || "";
        if (role) setTargetRole((cur) => cur || String(role));
      })
      .catch(() => {});
  }, []);

  const question = session?.questions[index];
  const total = session?.questions.length ?? 0;
  const isLast = index >= total - 1;
  const words = wordCount(draft);

  const openSession = (s: InterviewSession) => {
    setSession(s);
    setCurrent(null);
    setDraft("");
    if (s.status === "completed") {
      setPhase("report");
      return;
    }
    const answered = new Set(s.answers.map((a) => a.questionId));
    const next = s.questions.findIndex((q) => !answered.has(q.id));
    setIndex(next === -1 ? Math.max(0, s.questions.length - 1) : next);
    if (next === -1) setCurrent(s.answers.find((a) => a.questionId === s.questions[s.questions.length - 1]?.id) || null);
    setPhase("interview");
  };

  const start = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pastedTooShort(jobTarget)) {
      toast.error("Paste the full job description, or clear it to practise for the role in general.");
      return;
    }
    setStarting(true);
    setQuotaBlock(null);
    try {
      const r = await startInterview({ targetRole: targetRole.trim() || undefined, interviewType, difficulty, ...jobTargetBody(jobTarget, targetRole) });
      if (r.quota) setQuota(r.quota);
      openSession(r.session);
      if (r.questionSource === "fallback") toast.info("Using our standard question set for this round.");
    } catch (err: any) {
      const over = getQuotaExceeded(err);
      if (over) {
        setQuotaBlock(over);
        if (over.quota) setQuota(over.quota);
      } else if (err?.response?.status === 403) setNotEligible(err.response.data?.message || "Mock interviews aren't available for your profile.");
      else toast.error(errMsg(err, "Could not start the interview"));
    } finally {
      setStarting(false);
    }
  };

  const submit = async () => {
    if (!session || !question || !draft.trim()) return;
    setEvaluating(true);
    try {
      const r = await submitInterviewAnswer(session.id, question.id, draft);
      setCurrent(r.evaluation);
      setSession({
        ...session,
        answers: [...session.answers.filter((a) => a.questionId !== question.id), r.evaluation],
        answeredCount: r.answeredCount,
      });
    } catch (err) {
      toast.error(errMsg(err, "Could not evaluate your answer. Please try again."));
    } finally {
      setEvaluating(false);
    }
  };

  const next = () => {
    setCurrent(null);
    setDraft("");
    setIndex((i) => Math.min(i + 1, total - 1));
  };

  const retry = () => {
    if (current) setDraft(current.text);
    setCurrent(null);
  };

  const finish = async () => {
    if (!session) return;
    if (session.answers.length === 0 && !window.confirm("You haven't answered any question yet. End the interview anyway?")) return;
    setFinishing(true);
    try {
      const r = await finishInterview(session.id);
      setSession(r.session);
      setPhase("report");
      loadHistory();
    } catch (err) {
      toast.error(errMsg(err, "Could not build your report"));
    } finally {
      setFinishing(false);
    }
  };

  const openFromHistory = async (id: number) => {
    setOpeningId(id);
    try {
      const r = await getInterview(id);
      openSession(r.session);
    } catch (err) {
      toast.error(errMsg(err, "Could not open this interview"));
    } finally {
      setOpeningId(null);
    }
  };

  const backToSetup = () => {
    if (session) {
      setTargetRole(session.targetRole);
      setInterviewType(session.interviewType);
      setDifficulty(session.difficulty);
      // Practise again for the same platform job (a pasted JD isn't sent back to the browser).
      const jc = session.jobContext;
      if (jc?.jobId) setJobTarget({ kind: "job", jobId: jc.jobId, title: jc.title, company: jc.company });
      else if (jc?.companyJobId) setJobTarget({ kind: "company_job", companyJobId: jc.companyJobId, title: jc.title, company: jc.company });
    }
    setSession(null);
    setCurrent(null);
    setDraft("");
    setPhase("setup");
  };

  const answersById = useMemo(() => new Map((session?.answers || []).map((a) => [a.questionId, a])), [session]);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#F8FAFC] relative overflow-y-auto overflow-x-hidden">
      <PageHeader
        icon={<Mic />}
        title="AI Mock Interview"
        actions={phase === "interview" && session ? (
          <button onClick={finish} disabled={finishing || evaluating} className="text-xs font-semibold text-gray-600 inline-flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50">
            <Flag className="w-3.5 h-3.5" /> End
          </button>
        ) : undefined}
      />

      <div className={`${PAGE_COLUMN} py-4 sm:py-6 lg:py-8 space-y-6`}>
        {notEligible ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Info className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900">Not available for your profile</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{notEligible}</p>
          </div>
        ) : phase === "setup" ? (
          <>
            {starting ? (
              <Busy text="Preparing your interview…" sub="Our AI interviewer is writing questions for your role. This can take up to 20 seconds." />
            ) : (
              <form onSubmit={start} className="space-y-6">
                {/* Same hero treatment as the Job Agent page: the two ways to practise side by side. */}
                <div className="grid md:grid-cols-2 gap-4">
                  <a
                    href={`/mock-interview/live${jobTargetQuery(jobTarget)}`}
                    data-testid="live-interview-entry"
                    className="flex flex-col rounded-2xl p-5 sm:p-7 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl hover:opacity-95 transition-opacity"
                  >
                    <span className="self-start inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest bg-white/20 rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> New · Live voice
                    </span>
                    <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight">Live interview: real HR or technical round</h2>
                    <p className="text-emerald-50 text-sm mt-2 leading-relaxed">
                      A video-call style interview with an AI interviewer who talks to you, listens, asks follow-ups and runs a coding round. Hands-free once you join.
                    </p>
                    <span className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-bold">Join a live interview <ArrowRight className="w-4 h-4" /></span>
                  </a>

                  <div className="flex flex-col bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E1B4B] rounded-2xl p-5 sm:p-7 text-white shadow-xl">
                    <span className="self-start text-[11px] font-bold uppercase tracking-widest bg-white/10 rounded-full px-2.5 py-1">Text practice</span>
                    <h1 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight">Practise interviews with instant AI feedback</h1>
                    <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                      Answer 6 questions for your target role. Each answer is scored on clarity, relevance and structure, with a stronger sample answer to learn from.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-5">
                  <div>
                    <label htmlFor="mi-role" className="text-sm font-semibold text-gray-800">Target role</label>
                    <input
                      id="mi-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Software Engineer, Data Analyst, Marketing Intern"
                      maxLength={120}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <JobTargetPicker value={jobTarget} onChange={setJobTarget} />

                  <div>
                    <p className="text-sm font-semibold text-gray-800">Interview type</p>
                    <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {TYPES.map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setInterviewType(t.id)}
                          aria-pressed={interviewType === t.id}
                          className={`text-left rounded-xl border p-3 flex sm:flex-col gap-3 sm:gap-1.5 items-start transition-colors ${interviewType === t.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <span className={interviewType === t.id ? "text-primary" : "text-gray-500"}>{t.icon}</span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-gray-900">{t.label}</span>
                            <span className="block text-xs text-gray-500">{t.desc}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">Difficulty</p>
                    <div className="mt-1.5 inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50">
                      {DIFFS.map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => setDifficulty(d)}
                          aria-pressed={difficulty === d}
                          className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize ${difficulty === d ? "bg-white shadow-sm text-primary" : "text-gray-500"}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {quotaBlock && <QuotaExceededNotice info={quotaBlock} />}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <button type="submit" className="w-full sm:w-auto shrink-0 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-blue-600">
                      Start interview <ArrowRight className="w-4 h-4" />
                    </button>
                    {quota && <QuotaCounter quota={quota} className="justify-center sm:justify-start" />}
                  </div>
                </div>
              </form>
            )}

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><History className="w-4 h-4" /> Past interviews</h3>
              {historyLoading ? (
                <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
              ) : historyError ? (
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> <span className="flex-1">{historyError}</span>
                  <button onClick={loadHistory} className="text-xs font-bold text-primary">Retry</button>
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">No interviews yet. Your results will appear here.</p>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => openFromHistory(h.id)}
                      disabled={openingId !== null}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 disabled:opacity-60"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{h.targetRole}{h.jobContext?.company ? ` · ${h.jobContext.company}` : ""}</p>
                        <p className="text-xs text-gray-500">{TYPE_LABEL[h.interviewType]} · <span className="capitalize">{h.difficulty}</span> · {fmtDate(h.createdAt)}</p>
                      </div>
                      {openingId === h.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : h.status === "completed" ? (
                        <span className={`text-sm font-bold ${scoreText(h.overallScore ?? 0, 100)}`}>{h.overallScore ?? 0}/100</span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700">Resume · {h.answeredCount}/{h.totalQuestions}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : phase === "interview" && session && question ? (
          finishing ? (
            <Busy text="Building your report…" sub="Summarising your answers. This can take a few seconds." />
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>Question {index + 1} of {total}</span>
                  <span className="truncate ml-2">{session.targetRole}{session.jobContext?.company ? ` at ${session.jobContext.company}` : ""} · {TYPE_LABEL[session.interviewType]}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((index + (current ? 1 : 0)) / total) * 100}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
                {question.focus && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{question.focus}</span>}
                <p className="mt-2 text-base sm:text-lg font-semibold text-gray-900 leading-snug break-words">{question.text}</p>
                {session.interviewType === "behavioral" && !current && (
                  <p className="mt-2 text-xs text-gray-500">Tip: use STAR — the Situation, your Task, the Actions you took, and the Result.</p>
                )}
              </div>

              {evaluating ? (
                <Busy text="Evaluating your answer…" sub="Scoring clarity, relevance and structure. This can take 5–20 seconds." />
              ) : current ? (
                <>
                  <EvaluationView ev={current} />
                  <Collapsible title="Your answer">{current.text}</Collapsible>
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                    <button onClick={retry} className="px-4 py-2.5 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 inline-flex items-center justify-center gap-1.5">
                      <RotateCcw className="w-4 h-4" /> Try this one again
                    </button>
                    {isLast ? (
                      <button onClick={finish} className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold inline-flex items-center justify-center gap-1.5">
                        <Trophy className="w-4 h-4" /> Finish & see report
                      </button>
                    ) : (
                      <button onClick={next} className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold inline-flex items-center justify-center gap-1.5">
                        Next question <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={9}
                    maxLength={5000}
                    placeholder="Type your answer as you would say it in the interview…"
                    className="w-full rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 text-sm leading-relaxed outline-none focus:border-primary resize-y"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={words < 8 ? "text-gray-400" : words <= 250 ? "text-emerald-600" : "text-amber-600"}>
                      {words} words {words < 8 ? "· too short to score" : words > 250 ? "· try to be more concise" : ""}
                    </span>
                    <span className="text-gray-400">Aim for 80–200</span>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-1">
                    {!isLast ? (
                      <button onClick={next} className="px-4 py-2.5 rounded-full text-sm font-semibold text-gray-500 hover:text-gray-800">Skip question</button>
                    ) : (
                      <button onClick={finish} className="px-4 py-2.5 rounded-full text-sm font-semibold text-gray-500 hover:text-gray-800">Skip & finish</button>
                    )}
                    <button
                      onClick={submit}
                      disabled={!draft.trim()}
                      className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Submit answer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        ) : phase === "report" && session ? (
          <div className="space-y-4">
            <button onClick={backToSetup} className="text-sm font-semibold text-gray-600 inline-flex items-center gap-1 hover:text-gray-900">
              <ChevronLeft className="w-4 h-4" /> All interviews
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-center">
              <div className="text-center sm:w-36 shrink-0">
                <p className={`text-5xl font-bold ${scoreText(session.overallScore ?? 0, 100)}`}>{session.overallScore ?? 0}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase mt-1">out of 100</p>
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs font-semibold text-gray-500">
                  {session.targetRole}{session.jobContext?.company ? ` at ${session.jobContext.company}` : ""} · {TYPE_LABEL[session.interviewType]} · <span className="capitalize">{session.difficulty}</span> · {fmtDate(session.createdAt)}
                </p>
                <p className="text-sm text-gray-800 break-words">{session.report?.summary}</p>
                {session.report?.averages && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <ScoreBar label="Clarity" value={session.report.averages.clarity} />
                    <ScoreBar label="Relevance" value={session.report.averages.relevance} />
                    <ScoreBar label="Structure" value={session.report.averages.structure} />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Strengths</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-gray-700 list-disc pl-5">
                  {(session.report?.strengths || []).map((s, i) => <li key={i} className="break-words">{s}</li>)}
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> To improve</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-gray-700 list-disc pl-5">
                  {(session.report?.improvements || []).map((s, i) => <li key={i} className="break-words">{s}</li>)}
                </ul>
              </div>
            </div>

            <InterviewNextSteps targetRole={session.targetRole} />

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900">Question by question</h3>
              {session.questions.map((q, i) => {
                const a = answersById.get(q.id);
                return (
                  <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900 break-words min-w-0">{i + 1}. {q.text}</p>
                      {a ? (
                        <span className={`text-sm font-bold shrink-0 ${scoreText(a.score.overall)}`}>{a.score.overall}/10</span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">Skipped</span>
                      )}
                    </div>
                    {a?.feedback && <p className="text-sm text-gray-600 break-words">{a.feedback}</p>}
                    {a && <Collapsible title="Your answer">{a.text}</Collapsible>}
                    {a?.improvedAnswer && <Collapsible title="Stronger answer">{a.improvedAnswer}</Collapsible>}
                    {q.idealPoints && q.idealPoints.length > 0 && (
                      <Collapsible title="What interviewers look for">
                        {q.idealPoints.map((p) => `• ${p}`).join("\n")}
                      </Collapsible>
                    )}
                  </div>
                );
              })}
            </section>

            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={backToSetup} className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold inline-flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> Practise again
              </button>
            </div>
          </div>
        ) : (
          <Busy text="Loading…" />
        )}
      </div>
    </div>
  );
}
