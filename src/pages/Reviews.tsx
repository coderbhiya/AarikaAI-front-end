import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import {
  ArrowLeft,
  Bell,
  Link as LinkIcon,
  CheckCircle,
  Circle,
  Menu,
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

const LIKERT_OPTIONS = [
  { value: "very_satisfied", label: "Very Satisfied" },
  { value: "satisfied", label: "Satisfied" },
  { value: "neutral", label: "Neutral" },
  { value: "unsatisfied", label: "Unsatisfied" },
  { value: "very_unsatisfied", label: "Very Unsatisfied" },
];

export default function Reviews() {
  const [questions, setQuestions] = useState([]);
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
        setError("Please answer at least one question");
        setSubmitting(false);
        return;
      }
      const res = await axiosInstance.post("/reviews", payload);
      if (res.data?.success) {
        setSuccess("Thank you! Your feedback has been submitted.");
        setAnswers({});
        setComment("");
      } else {
        setError(res.data?.message || "Submission failed");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Submission failed");
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
    const current = typeof value === "number" ? value : start;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {Array.from({ length: count }).map((_, i) => {
            const v = start + i;
            const filled = v <= current;
            return (
              <button
                key={v}
                type="button"
                aria-label={`Rate ${v}`}
                className={`mx-0.5 text-2xl transition-colors ${
                  filled
                    ? "text-yellow-400"
                    : "text-gray-300 hover:text-gray-400"
                }`}
                onClick={() => onChange(v)}
              >
                {filled ? "★" : "☆"}
              </button>
            );
          })}
        </div>
        <span className="font-mono text-sm text-gray-600">{current}</span>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto overflow-y-auto">
      <div className="mobile-header">
        <button
          className="mobile-back-button"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft size={24} />
        </button>

        <button className="mobile-more-button" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Share Your Feedback</h1>
        <span className="text-sm text-gray-500">We value your opinion</span>
      </div>

      {loading ? (
        <div>Loading questions...</div>
      ) : questions.length === 0 ? (
        <div>No active review questions at the moment.</div>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="p-4 border rounded shadow-sm bg-white/5">
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold">{q.text}</div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 capitalize">
                  {q.type.replace("_", " ")}
                </span>
              </div>

              {q.type === "likert" && (
                <div className="flex gap-2 flex-wrap">
                  {LIKERT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`px-3 py-2 rounded border transition-colors ${
                        answers[q.id] === opt.value
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {(q.type === "single_choice" || q.type === "multi_choice") &&
                Array.isArray(JSON.parse(q.options || "[]")) && (
                  <div className="flex gap-2 flex-wrap">
                    {JSON.parse(q.options || "[]").map((opt) => (
                      <button
                        key={opt}
                        className={`px-3 py-2 rounded border transition-colors ${
                          q.allowMultiple || q.type === "multi_choice"
                            ? Array.isArray(answers[q.id]) &&
                              (answers[q.id] as string[]).includes(opt)
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white/5 hover:bg-gray-50"
                            : answers[q.id] === opt
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white/5 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setAnswers((prev) => {
                            const multi =
                              q.allowMultiple || q.type === "multi_choice";
                            if (multi) {
                              const current = prev[q.id];
                              const arr: string[] = Array.isArray(current)
                                ? [...current]
                                : [];
                              const idx = arr.indexOf(opt);
                              if (idx >= 0) arr.splice(idx, 1);
                              else arr.push(opt);
                              return { ...prev, [q.id]: arr };
                            }
                            return { ...prev, [q.id]: opt };
                          });
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

              {q.type === "text" && (
                <textarea
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  placeholder="Type your response"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  rows={3}
                />
              )}

              {q.type === "rating" && (
                <StarRating
                  min={q.minValue ?? 1}
                  max={q.maxValue ?? 5}
                  value={
                    typeof answers[q.id] === "number"
                      ? (answers[q.id] as number)
                      : undefined
                  }
                  onChange={(val) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: val }))
                  }
                />
              )}
            </div>
          ))}

          <div className="p-4 border rounded shadow-sm bg-white/5">
            <div className="font-semibold mb-2">
              Additional Comments (optional)
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share anything else you'd like us to know"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white/5"
              rows={3}
            />
          </div>

          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-emerald-600">{success}</div>}

          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      )}
    </div>
  );
}
