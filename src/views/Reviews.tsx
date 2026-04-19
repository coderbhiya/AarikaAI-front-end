"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import {
  ArrowLeft,
  Bell,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
  Menu,
  Star,
  MessageSquare,
  Send,
  Loader2,
  Check,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

type QuestionType =
  | "likert"
  | "single_choice"
  | "multi_choice"
  | "text"
  | "rating";

interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string;
  allowMultiple?: boolean;
  minValue?: number;
  maxValue?: number;
}

const LIKERT_OPTIONS = [
  { value: "very_satisfied", label: "Very Satisfied", color: "text-emerald-500" },
  { value: "satisfied", label: "Satisfied", color: "text-emerald-500" },
  { value: "neutral", label: "Neutral", color: "text-slate-400" },
  { value: "unsatisfied", label: "Unsatisfied", color: "text-rose-500" },
  { value: "very_unsatisfied", label: "Very Unsatisfied", color: "text-rose-500" },
];

export default function Reviews() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<
    Record<number, string | string[] | number>
  >({});
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useRouter();
  const { toggleSidebar } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/reviews/questions");
        setQuestions(res.data.questions || []);
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.message || "Failed to synchronize questions database");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const normalizedAnswers = () => {
    return questions
      .map((q) => {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          (Array.isArray(val) && val.length === 0)
        )
          return null;
        if (q.type === "likert" || q.type === "single_choice") {
          return { questionId: q.id, value: val as string };
        }
        if (q.type === "multi_choice" || q.allowMultiple) {
          const values = Array.isArray(val) ? val : [val as string];
          return { questionId: q.id, values };
        }
        if (q.type === "rating") {
          return { questionId: q.id, value: Number(val) };
        }
        if (q.type === "text") {
          const v = val as string;
          return { questionId: q.id, value: v };
        }
        return null;
      })
      .filter(Boolean);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        answers: normalizedAnswers(),
        comment: comment?.trim() ? comment.trim() : undefined,
      };
      if (!payload.answers || payload.answers.length === 0) {
        setError("Neural match incomplete. Please provide answers to continue.");
        setSubmitting(false);
        return;
      }
      const res = await axiosInstance.post("/reviews", payload);
      if (res.data?.success) {
        setSuccess("Intelligence received. Your neural feedback has been synchronized.");
        setAnswers({});
        setComment("");
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(res.data?.message || "Sync error detected. Channel re-routing initiated.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Inter-process communication failure");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating: React.FC<{
    min?: number | null;
    max?: number | null;
    value?: number;
    onChange: (val: number) => void;
  }> = ({ min = 1, max = 5, value, onChange }) => {
    const start = (min ?? 1) || 1;
    const end = (max ?? 5) || 5;
    const count = Math.max(1, end - start + 1);
    const current = typeof value === "number" ? value : 0;

    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => {
            const v = start + i;
            const active = v <= current;
            return (
              <button
                key={v}
                type="button"
                className={`transition-all duration-500 hover:scale-110 ${active ? 'text-primary scale-105' : 'text-slate-200 hover:text-slate-300'}`}
                onClick={() => onChange(v)}
              >
                <Star size={24} fill={active ? "currentColor" : "none"} strokeWidth={active ? 0 : 2} />
              </button>
            );
          })}
        </div>
        {current > 0 && <span className="font-bold text-primary text-[11px] tracking-widest bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">{current}/{end}</span>}
      </div>
    );
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-transparent relative scrollbar-none">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse delay-1000" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-100/50 w-full">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 md:p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors active:scale-95"
          >
            <Menu size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold text-[#444746] tracking-tight">Insight Collection</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
            <User size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none relative z-10 px-0 pt-0 pb-20">
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 md:py-12">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Decoding Mission Database...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-20 text-center animate-in zoom-in duration-700 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-inner text-slate-300">
               <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 uppercase">Clear Frequency</h3>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest max-w-xs mx-auto opacity-70">No scheduled sequence scheduled on your channel.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white border border-slate-100 rounded-2xl p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm relative overflow-hidden"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full translate-x-24 -translate-y-24" />
                <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-50 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Sequence {idx + 1}</span>
                       <div className="h-[1px] w-6 bg-primary/20" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight tracking-tight">{q.text}</h3>
                  </div>
                  <span className="text-[8px] bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-100 text-slate-400 font-bold uppercase tracking-widest shrink-0 ml-6">
                    {q.type.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-8 relative z-10">
                  {q.type === "likert" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {LIKERT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          className={`flex flex-col items-center justify-center px-4 py-6 rounded-xl border transition-all duration-500 active:scale-95 group ${answers[q.id] === opt.value
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                              : "bg-slate-50 text-slate-400 border-slate-100 hover:border-primary/20 hover:bg-white hover:text-slate-900"
                            }`}
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                        >
                          <span className={`text-[9px] font-bold uppercase tracking-widest text-center ${answers[q.id] === opt.value ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'}`}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {(q.type === "single_choice" || q.type === "multi_choice") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(() => {
                        try {
                          return JSON.parse(q.options || "[]").map((opt: string) => {
                            const isSelected = q.type === "multi_choice"
                              ? (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt))
                              : answers[q.id] === opt;

                            return (
                              <button
                                key={opt}
                                className={`flex items-center px-6 py-4 rounded-xl border transition-all duration-500 font-bold text-left active:scale-[0.98] ${isSelected
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                    : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-primary/20 hover:text-slate-900"
                                  }`}
                                onClick={() => {
                                  setAnswers((prev) => {
                                    if (q.type === "multi_choice") {
                                      const current = prev[q.id];
                                      const arr: string[] = Array.isArray(current) ? [...current] : [];
                                      const idx = arr.indexOf(opt);
                                      if (idx >= 0) arr.splice(idx, 1);
                                      else arr.push(opt);
                                      return { ...prev, [q.id]: arr };
                                    }
                                    return { ...prev, [q.id]: opt };
                                  });
                                }}
                              >
                                <div className={`w-5 h-5 rounded-md border-2 mr-4 transition-all flex items-center justify-center shrink-0 ${isSelected ? 'border-primary bg-primary/20' : 'border-slate-200'}`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xl animate-in zoom-in" />}
                                </div>
                                <span className="font-bold text-[13px] tracking-tight capitalize">{opt}</span>
                              </button>
                            );
                          });
                        } catch (e) {
                          return <div className="text-rose-500 text-[10px] font-bold uppercase tracking-widest bg-rose-50 p-4 rounded-2xl border border-rose-100">Choice matrix synchronization error.</div>;
                        }
                      })()}
                    </div>
                  )}

                  {q.type === "text" && (
                    <div className="relative group">
                      <textarea
                        value={(answers[q.id] as string) || ""}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Log detailed neural response here..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-5 focus:outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 text-slate-900 font-medium text-[14px] resize-none transition-all duration-500 placeholder:text-slate-300 min-h-[160px] scrollbar-none"
                      />
                      <div className="absolute right-6 bottom-6 text-slate-200 group-focus-within:text-primary transition-colors">
                         <MessageSquare size={20} className="opacity-30 group-focus-within:opacity-100" />
                      </div>
                    </div>
                  )}

                  {q.type === "rating" && (
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white active:ring-4 active:ring-primary/5">
                        <StarRating
                          min={q.minValue ?? 1}
                          max={q.maxValue ?? 5}
                          value={typeof answers[q.id] === "number" ? (answers[q.id] as number) : undefined}
                          onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                        />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Error/Success Feedback */}
            <div className="space-y-3">
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-4 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-4 shadow-sm">
                    <CheckCircle2 size={16} className="animate-in zoom-in" />
                    {success}
                  </div>
                )}
            </div>

            <button
              onClick={submit}
              disabled={submitting}
              className="w-full group relative overflow-hidden h-14 bg-slate-900 hover:bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all duration-500 active:scale-95 disabled:opacity-30 shadow-lg"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Synchronizing Transmission...
                  </>
                ) : (
                  <>
                    Confirm Knowledge Transfer
                    <Send size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-500" />
                  </>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
