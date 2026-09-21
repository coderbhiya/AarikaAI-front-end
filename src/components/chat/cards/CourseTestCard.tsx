import React, { useState } from "react";
import { CheckCircle2, Award } from "lucide-react";

interface CourseTestQuestion {
  id: number;
  question: string;
  options: Record<string, string>;
}

interface CourseTestCardProps {
  questions: CourseTestQuestion[];
  onSubmit: (answerText: string) => void;
  disabled?: boolean;
}

// Multi-question sibling of QuizCard.tsx — that one submits a single answer
// the instant it's clicked (fine for one question at a time in normal chat),
// but the course-tutor proficiency test is graded as a whole set of 5
// answers together (chatController.js's evaluateTestAnswers), so this holds
// selections locally and only sends once every question has one.
const CourseTestCard: React.FC<CourseTestCardProps> = ({ questions, onSubmit, disabled }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: number, optionKey: string) => {
    if (disabled || submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);
  const isLocked = disabled || submitted;

  const handleSubmit = () => {
    if (!allAnswered || isLocked) return;
    setSubmitted(true);
    const answerText = questions.map((q) => `Q${q.id}: ${answers[q.id]}`).join(", ");
    onSubmit(answerText);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-lg mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {questions.map((q) => (
        <div key={q.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-[13px] font-semibold text-[#202124] mb-3 leading-snug">
            {q.id}. {q.question}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(q.options).map(([key, value]) => {
              const isSelected = answers[q.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(q.id, key)}
                  disabled={isLocked}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-gray-50 border-gray-100 hover:border-primary/30"
                  } ${isLocked && !isSelected ? "opacity-50 cursor-not-allowed" : isLocked ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                      isSelected ? "bg-primary text-white" : "bg-white text-gray-400 border border-gray-200"
                    }`}
                  >
                    {key}
                  </div>
                  <span className={`text-[13px] ${isSelected ? "font-semibold text-primary" : "text-[#3c4043]"}`}>
                    {value}
                  </span>
                  {isSelected && <CheckCircle2 size={16} className="ml-auto text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || isLocked}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <Award size={18} />
        {submitted
          ? "Test Submitted"
          : allAnswered
          ? "Submit Test"
          : `Answer all ${questions.length} questions to submit`}
      </button>
    </div>
  );
};

export default CourseTestCard;
