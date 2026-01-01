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
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  { value: "very_satisfied", label: "Very Satisfied", color: "text-emerald-400" },
  { value: "satisfied", label: "Satisfied", color: "text-emerald-400" },
  { value: "neutral", label: "Neutral", color: "text-gray-400" },
  { value: "unsatisfied", label: "Unsatisfied", color: "text-rose-400" },
  { value: "very_unsatisfied", label: "Very Unsatisfied", color: "text-rose-400" },
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
  const navigate = useNavigate();
  const { toggleSidebar } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/reviews/questions");
        setQuestions(res.data.questions || []);
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.message || "Failed to load questions");
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
        setError("Please provide answers to initiate submission.");
        setSubmitting(false);
        return;
      }
      const res = await axiosInstance.post("/reviews", payload);
      if (res.data?.success) {
        setSuccess("Feed back successfully processed. Thank you for your contribution.");
        setAnswers({});
        setComment("");
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(res.data?.message || "Submission synchronization failed");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Internal submission error");
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
                className={`transition-all ${active ? 'text-primary scale-110' : 'text-gray-700 hover:text-gray-500'}`}
                onClick={() => onChange(v)}
              >
                <Star size={24} fill={active ? "currentColor" : "none"} />
              </button>
            );
          })}
        </div>
        {current > 0 && <span className="font-black text-primary text-sm tracking-widest">{current}/{end}</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/profile")}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">Feedback System</h1>
              <p className="text-gray-500 font-medium">Syncing user experiences to improve the neural network.</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-3 bg-white/5 border border-white/10 rounded-2xl text-white"
          >
            <Menu size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Questions Database...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] p-16 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-800 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Queue Empty</h3>
            <p className="text-gray-500">No active feedback cycles detected at this time.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="glass-card rounded-[2.5rem] p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Question {idx + 1}</div>
                    <h3 className="text-xl font-bold text-white leading-tight">{q.text}</h3>
                  </div>
                  <span className="text-[10px] bg-white/[0.05] px-3 py-1 rounded-full border border-white/[0.08] text-gray-500 font-black uppercase tracking-widest shrink-0 ml-4">
                    {q.type.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-8">
                  {q.type === "likert" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {LIKERT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          className={`flex items-center justify-center px-6 py-4 rounded-2xl border transition-all font-bold text-sm ${answers[q.id] === opt.value
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                              : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:bg-white/[0.06] hover:text-white"
                            }`}
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                        >
                          {opt.label}
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
                                className={`flex items-center px-6 py-4 rounded-2xl border transition-all font-bold text-sm text-left ${isSelected
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                    : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:bg-white/[0.06] hover:text-white"
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
                                <div className={`w-4 h-4 rounded-full border-2 mr-4 transition-all flex items-center justify-center ${isSelected ? 'border-white bg-white/20' : 'border-gray-700'}`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                                </div>
                                {opt}
                              </button>
                            );
                          });
                        } catch (e) {
                          return <div className="text-rose-400 text-xs">Choice matrix synchronization error.</div>;
                        }
                      })()}
                    </div>
                  )}

                  {q.type === "text" && (
                    <div className="relative">
                      <textarea
                        value={(answers[q.id] as string) || ""}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Log your detailed response..."
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-6 focus:outline-none focus:border-primary/50 text-white font-medium resize-none transition-all placeholder:text-gray-700 min-h-[160px]"
                      />
                      <MessageSquare className="absolute right-6 bottom-6 text-gray-800" size={24} />
                    </div>
                  )}

                  {q.type === "rating" && (
                    <StarRating
                      min={q.minValue ?? 1}
                      max={q.maxValue ?? 5}
                      value={typeof answers[q.id] === "number" ? (answers[q.id] as number) : undefined}
                      onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Error/Success Feedback */}
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl font-bold text-sm flex items-center gap-3 animate-in fade-in zoom-in-95">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-bold text-sm flex items-center gap-3 animate-in fade-in zoom-in-95">
                <Check size={16} />
                {success}
              </div>
            )}

            <button
              onClick={submit}
              disabled={submitting}
              className="w-full group relative overflow-hidden px-8 py-5 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-[2.5rem] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    Initialize Submission
                    <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

