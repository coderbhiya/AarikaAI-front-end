import React, { useState } from "react";
import { CheckCircle2, Award, ArrowLeft, ArrowRight } from "lucide-react";

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
// but the course-tutor proficiency test is graded as a whole set of answers
// together (chatController.js's evaluateTestAnswers). Shows one question at
// a time with Back/Next instead of stacking all of them — stacking gets long
// fast once the question count goes past a handful.
const CourseTestCard: React.FC<CourseTestCardProps> = ({ questions, onSubmit, disabled }) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isLocked = disabled || submitted;
  const question = questions[index];
  const isLastQuestion = index === questions.length - 1;
  const hasAnsweredCurrent = !!answers[question?.id];

  const handleSelect = (optionKey: string) => {
    if (isLocked) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionKey }));
  };

  const handleSubmit = (finalAnswers: Record<number, string>) => {
    setSubmitted(true);
    const answerText = questions.map((q) => `Q${q.id}: ${finalAnswers[q.id]}`).join(", ");
    onSubmit(answerText);
  };

  const handleNext = () => {
    if (!hasAnsweredCurrent || isLocked) return;
    if (isLastQuestion) {
      handleSubmit(answers);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  if (submitted) {
    return (
      <div className="w-full max-w-lg mt-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-primary" />
          <span className="text-[13px] font-bold text-[#202124]">Test Submitted</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q) => (
            <span key={q.id} className="text-[11px] font-semibold bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-gray-500">
              Q{q.id}: {answers[q.id]}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col gap-3 w-full max-w-lg mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
          Question {index + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-primary" : i < index ? "w-1.5 bg-primary/40" : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <p className="text-[13px] font-semibold text-[#202124] mb-3 leading-snug">
          {question.question}
        </p>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(question.options).map(([key, value]) => {
            const isSelected = answers[question.id] === key;
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={isLocked}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-gray-50 border-gray-100 hover:border-primary/30"
                } cursor-pointer`}
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

      <div className="flex items-center gap-2">
        {index > 0 && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-[13px] hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLastQuestion ? (
            <>
              <Award size={18} /> Submit Test
            </>
          ) : (
            <>
              Next <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseTestCard;
