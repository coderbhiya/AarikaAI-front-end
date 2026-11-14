"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu, Compass, Clock, ArrowLeft, ArrowRight, Loader2, RotateCcw, MessageCircle, Sparkles, GraduationCap,
  CheckCircle2, AlertCircle, Brain, Target, BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AptitudeKey, DiscoveryAnswers, DiscoveryAttempt, DiscoveryQuestion, QuestionBank, RiasecKey,
  getDiscoveryQuestions, getLatestDiscovery, isNotEligibleError, submitDiscovery,
} from "@/services/careerDiscoveryService";

type Stage = "loading" | "intro" | "quiz" | "submitting" | "result" | "notEligible" | "error";

const DRAFT_KEY = "careerDiscoveryDraft";

const RIASEC_META: Record<RiasecKey, { name: string; short: string; color: string }> = {
  R: { name: "Realistic", short: "Doer", color: "bg-amber-500" },
  I: { name: "Investigative", short: "Thinker", color: "bg-sky-500" },
  A: { name: "Artistic", short: "Creator", color: "bg-fuchsia-500" },
  S: { name: "Social", short: "Helper", color: "bg-emerald-500" },
  E: { name: "Enterprising", short: "Leader", color: "bg-orange-500" },
  C: { name: "Conventional", short: "Organiser", color: "bg-indigo-500" },
};
const RIASEC_ORDER: RiasecKey[] = ["R", "I", "A", "S", "E", "C"];

const APTITUDE_META: Record<AptitudeKey, string> = {
  numerical: "Numerical",
  verbal: "Verbal",
  logical: "Logical",
  spatial: "Spatial",
};
const APTITUDE_ORDER: AptitudeKey[] = ["numerical", "verbal", "logical", "spatial"];

function readDraft(version: string): { answers: DiscoveryAnswers; index: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d?.version !== version || typeof d.answers !== "object") return null;
    return { answers: d.answers, index: Number(d.index) || 0 };
  } catch {
    return null;
  }
}
function writeDraft(version: string, answers: DiscoveryAnswers, index: number) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ version, answers, index }));
  } catch {
    /* storage unavailable — draft is a convenience only */
  }
}
function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

// ── small pieces ───────────────────────────────────────────────
function Bar({ label, sub, value, color }: { label: string; sub?: string; value: number; color: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold text-gray-800 truncate">
          {label}
          {sub && <span className="font-normal text-gray-500"> · {sub}</span>}
        </span>
        <span className="font-bold text-gray-900 tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-2.5 w-full rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
        {icon}
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function CenterCard({ icon, title, body, children }: { icon: React.ReactNode; title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">{icon}</div>
        <h2 className="mt-3 text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{body}</p>
        {children && <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">{children}</div>}
      </div>
    </div>
  );
}

// ── main view ──────────────────────────────────────────────────
export default function CareerDiscovery() {
  const { toggleSidebar } = useAuth();
  const [stage, setStage] = useState<Stage>("loading");
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [attempt, setAttempt] = useState<DiscoveryAttempt | null>(null);
  const [answers, setAnswers] = useState<DiscoveryAnswers>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setStage("loading");
    setError(null);
    try {
      const [questions, latest] = await Promise.all([getDiscoveryQuestions(), getLatestDiscovery()]);
      setBank(questions);
      setAttempt(latest);
      const draft = readDraft(questions.version);
      setHasDraft(!!draft && Object.keys(draft.answers).length > 0);
      setStage(latest ? "result" : "intro");
    } catch (err) {
      if (isNotEligibleError(err)) setStage("notEligible");
      else {
        setError("We couldn't load the quiz. Check your internet and try again.");
        setStage("error");
      }
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [load]);

  const questions = bank?.questions ?? [];
  const total = questions.length;
  const current: DiscoveryQuestion | undefined = questions[index];
  const answeredCurrent = current ? Object.prototype.hasOwnProperty.call(answers, current.id) : false;
  const isLast = index === total - 1;
  const interestCount = bank?.sections.find((s) => s.id === "interest")?.count ?? 0;
  const sectionStart = current && (index === 0 || questions[index - 1]?.kind !== current.kind);
  const section = current ? bank?.sections.find((s) => s.id === current.kind) : undefined;

  const start = (resume: boolean) => {
    if (!bank) return;
    const draft = resume ? readDraft(bank.version) : null;
    if (draft) {
      setAnswers(draft.answers);
      setIndex(Math.min(draft.index, bank.questions.length - 1));
    } else {
      clearDraft();
      setAnswers({});
      setIndex(0);
    }
    setError(null);
    setStage("quiz");
  };

  const goTo = (next: number) => {
    if (!bank) return;
    const clamped = Math.max(0, Math.min(total - 1, next));
    setIndex(clamped);
    writeDraft(bank.version, answers, clamped);
  };

  const choose = (value: number | null) => {
    if (!current || !bank) return;
    const nextAnswers = { ...answers, [current.id]: value };
    setAnswers(nextAnswers);
    setError(null);
    const nextIndex = isLast ? index : index + 1;
    writeDraft(bank.version, nextAnswers, nextIndex);
    if (!isLast) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => setIndex(nextIndex), 220);
    }
  };

  const submit = async () => {
    if (!bank) return;
    const missing = questions.findIndex((q) => q.kind === "interest" && !(q.id in answers));
    if (missing >= 0) {
      setIndex(missing);
      setError("Please answer this one before seeing your results.");
      return;
    }
    setStage("submitting");
    setError(null);
    try {
      const payload: DiscoveryAnswers = {};
      for (const q of questions) payload[q.id] = q.id in answers ? answers[q.id] : null;
      const result = await submitDiscovery(payload);
      clearDraft();
      setHasDraft(false);
      setAttempt(result);
      setStage("result");
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    } catch (err) {
      if (isNotEligibleError(err)) {
        setStage("notEligible");
        return;
      }
      setError("Couldn't save your answers. Your progress is saved — please try again.");
      setStage("quiz");
    }
  };

  const chatLink = useMemo(() => {
    if (!attempt) return "/chat";
    const r = attempt.result;
    const careers = r.topCareers.slice(0, 3).map((c) => c.title).join(", ");
    const q =
      `I took the Career Discovery quiz on Aarika. My Holland code is ${r.hollandCode} and it suggested ${r.streamRecommendation.primary}` +
      `${r.streamRecommendation.alternatives.length ? ` (alternatives: ${r.streamRecommendation.alternatives.join(", ")})` : ""}. ` +
      `My top careers were ${careers}. Can you explain what this means for me and what I should do next?`;
    return `/chat?msg=${encodeURIComponent(q)}`;
  }, [attempt]);

  // ── render ───────────────────────────────────────────────────
  let body: React.ReactNode = null;

  if (stage === "loading") {
    body = (
      <div className="flex flex-1 items-center justify-center p-6 text-gray-500 text-sm gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
      </div>
    );
  } else if (stage === "notEligible") {
    body = (
      <CenterCard
        icon={<GraduationCap className="w-6 h-6" />}
        title="This is for school students"
        body="Career Discovery helps students in Class 7–12 choose a stream and explore careers. Ask Aarika about career options that fit your profile instead."
      >
        <Link href="/chat" className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white">
          Go to chat
        </Link>
      </CenterCard>
    );
  } else if (stage === "error") {
    body = (
      <CenterCard icon={<AlertCircle className="w-6 h-6" />} title="Something went wrong" body={error || "Please try again."}>
        <button onClick={load} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white">
          <RotateCcw size={14} /> Try again
        </button>
      </CenterCard>
    );
  } else if (stage === "intro" && bank) {
    body = (
      <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 sm:p-6 text-white">
          <Compass className="w-8 h-8 opacity-90" />
          <h1 className="mt-3 text-xl sm:text-2xl font-bold">Discover your stream &amp; careers</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Answer {total} quick questions and find out which stream suits you — Science (PCM), Science (PCB), Commerce or Arts — plus careers that match you.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <Clock size={13} /> About {bank.estimatedMinutes} minutes
          </p>
        </div>
        {bank.sections.map((s, i) => (
          <div key={s.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{i + 1}</div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">
                {s.title} <span className="font-normal text-gray-500">· {s.count} questions</span>
              </p>
              <p className="mt-0.5 text-sm text-gray-600">{s.note}</p>
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-500 px-1">
          This is guidance, not a final verdict. Your interests can change — you can retake it any time.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          {hasDraft && (
            <button onClick={() => start(true)} className="flex-1 rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white">
              Continue where I left off
            </button>
          )}
          <button
            onClick={() => start(false)}
            className={`flex-1 rounded-full px-5 py-3 text-sm font-bold ${hasDraft ? "border border-gray-300 bg-white text-gray-800" : "bg-gray-900 text-white"}`}
          >
            {hasDraft ? "Start over" : "Start the quiz"}
          </button>
        </div>
      </div>
    );
  } else if ((stage === "quiz" || stage === "submitting") && current && bank) {
    const progress = Math.round(((index + (answeredCurrent ? 1 : 0)) / total) * 100);
    const selected = answers[current.id];
    body = (
      <div className="w-full max-w-xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (index === 0 ? setStage("intro") : goTo(index - 1))}
            disabled={stage === "submitting"}
            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            aria-label="Previous question"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[11px] font-semibold text-gray-500">
              <span>Question {index + 1} of {total}</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {sectionStart && section && (
          <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            <p className="font-bold">{section.title}</p>
            <p className="text-indigo-800/80">{section.note}</p>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            {current.kind === "interest" ? "How much is this like you?" : `Brain teaser · ${APTITUDE_META[current.section]}`}
          </p>
          <h2 className="mt-2 text-base sm:text-lg font-semibold text-gray-900 break-words">{current.text}</h2>

          <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Answer options">
            {current.kind === "interest"
              ? bank.likertScale.map((opt) => (
                  <button
                    key={opt.value}
                    role="radio"
                    aria-checked={selected === opt.value}
                    onClick={() => choose(opt.value)}
                    disabled={stage === "submitting"}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      selected === opt.value ? "border-indigo-600 bg-indigo-50 text-indigo-900" : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))
              : current.options.map((opt, i) => (
                  <button
                    key={i}
                    role="radio"
                    aria-checked={selected === i}
                    onClick={() => choose(i)}
                    disabled={stage === "submitting"}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-colors break-words ${
                      selected === i ? "border-indigo-600 bg-indigo-50 text-indigo-900" : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <span className="mr-2 font-bold text-gray-400">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
          </div>

          {current.kind === "aptitude" && (
            <button
              onClick={() => choose(null)}
              disabled={stage === "submitting"}
              className={`mt-3 text-xs font-semibold underline-offset-2 hover:underline ${selected === null && answeredCurrent ? "text-indigo-700" : "text-gray-500"}`}
            >
              {selected === null && answeredCurrent ? "Skipped" : "Not sure — skip this one"}
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          {isLast ? (
            <button
              onClick={submit}
              disabled={stage === "submitting" || !answeredCurrent}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {stage === "submitting" ? <><Loader2 size={16} className="animate-spin" /> Working out your results…</> : <>See my results <Sparkles size={15} /></>}
            </button>
          ) : (
            <button
              onClick={() => goTo(index + 1)}
              disabled={!answeredCurrent}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 disabled:opacity-40"
            >
              Next <ArrowRight size={14} />
            </button>
          )}
        </div>
        {index < interestCount && (
          <p className="mt-3 text-center text-[11px] text-gray-400">No right or wrong answers here — go with your first feeling.</p>
        )}
      </div>
    );
  } else if (stage === "result" && attempt) {
    const r = attempt.result;
    const sr = r.streamRecommendation;
    body = (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 sm:p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">Your best-fit stream</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold break-words">{sr.primary}</h1>
          {sr.alternatives.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-indigo-100">Also a good fit:</span>
              {sr.alternatives.map((a) => (
                <span key={a} className="rounded-full bg-white/15 px-2.5 py-1 font-semibold">{a}</span>
              ))}
            </div>
          )}
          {sr.currentStreamNote && <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm">{sr.currentStreamNote}</p>}
        </div>

        <Section title="Why this stream" icon={<Target size={16} className="text-indigo-600" />}>
          <ul className="space-y-2">
            {sr.reasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                <span className="min-w-0">{reason}</span>
              </li>
            ))}
          </ul>
        </Section>

        {attempt.aiSummary && (
          <Section title="Aarika's take" icon={<Sparkles size={16} className="text-violet-600" />}>
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{attempt.aiSummary}</p>
          </Section>
        )}

        <Section title={`Your interest profile · ${r.hollandCode}`} icon={<Brain size={16} className="text-sky-600" />}>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {r.hollandTypes.map((t) => (
              <div key={t.code} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-sm font-bold text-gray-900">
                  {t.code} · {t.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">{t.blurb.charAt(0).toUpperCase() + t.blurb.slice(1)}.</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {RIASEC_ORDER.map((k) => (
              <Bar key={k} label={RIASEC_META[k].name} sub={RIASEC_META[k].short} value={r.riasec[k]} color={RIASEC_META[k].color} />
            ))}
          </div>
        </Section>

        <Section title="Aptitude" icon={<BookOpen size={16} className="text-emerald-600" />}>
          <div className="space-y-3">
            {APTITUDE_ORDER.map((k) => (
              <Bar
                key={k}
                label={APTITUDE_META[k]}
                sub={`${r.aptitudeDetail?.[k]?.correct ?? 0}/${r.aptitudeDetail?.[k]?.total ?? 3} correct`}
                value={r.aptitude[k]}
                color="bg-emerald-500"
              />
            ))}
          </div>
        </Section>

        <section>
          <h2 className="px-1 text-sm font-bold text-gray-900">Top careers for you</h2>
          <div className="mt-3 space-y-3">
            {r.topCareers.map((c, i) => (
              <article key={c.title} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 break-words">{c.title}</h3>
                      <span className="text-xs font-semibold text-emerald-700">{c.matchScore}% match</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{c.why}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-800">{c.stream}</span>
                      {c.exams.map((e) => (
                        <span key={e} className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700">{e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-2 pt-1 pb-6">
          <Link href={chatLink} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white">
            <MessageCircle size={16} /> Ask Aarika about this
          </Link>
          <button onClick={() => start(false)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-800">
            <RotateCcw size={15} /> Retake
          </button>
        </div>
        <p className="pb-4 text-center text-[11px] text-gray-400">
          Taken {new Date(attempt.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. This is guidance — talk to your parents and teachers too.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-[#F8FAFC] overflow-hidden">
      <header className="flex items-center gap-2 px-3 md:px-6 py-2.5 bg-white border-b border-gray-200">
        <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Toggle Sidebar" aria-label="Toggle sidebar">
          <Menu className="w-5 h-5" />
        </button>
        <Compass className="w-5 h-5 text-primary" />
        <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">Career Discovery</h1>
      </header>
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">{body}</main>
    </div>
  );
}
