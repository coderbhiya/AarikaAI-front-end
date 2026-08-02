import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, Trash2, Clock, MoreVertical,
  Flag, AlertCircle, BookOpen, Calculator, FileText, 
  Info, Pause, Play, Maximize2, Menu, Loader2, Award, Sparkles, TrendingUp
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import BrainLogo from "../../BrainLogo";
import { AssessmentBlueprint, Question } from '../../../services/assessment/AssessmentQuestionRepository';
import { AssessmentRuntimeAdapter } from '../../../services/assessment/AssessmentRuntimeAdapter';
import { QuestionStatus as GenStatus } from '../../../services/assessment/AssessmentGenerationQueue';
import axiosInstance from '@/lib/axios';

export interface FullExamSimulatorProps {
  blueprint: AssessmentBlueprint;
  onClose: () => void;
}

type QuestionStatus = 'answered' | 'review' | 'not_visited' | 'not_attempted';

const FullExamSimulator: React.FC<FullExamSimulatorProps> = ({ blueprint, onClose }) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Create or retrieve adapter
  const adapterRef = useRef<AssessmentRuntimeAdapter | null>(null);
  const [renderTrigger, forceRender] = useState(0);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [qStatus, setQStatus] = useState<GenStatus>('PENDING');

  useEffect(() => {
    if (!adapterRef.current) {
      const cleanExamSlug = (blueprint.exam || 'practice_exam').replace(/\s+/g, '_').toLowerCase();
      const sessionId = `exam_${cleanExamSlug}_${blueprint.questions}`;
      adapterRef.current = new AssessmentRuntimeAdapter(blueprint, sessionId, (idx, status) => {
        // When status updates, re-render if it's the current question
        forceRender(prev => prev + 1);
      });
    }
  }, [blueprint]);

  const adapter = adapterRef.current;
  
  // Keep active question index in sync
  useEffect(() => {
    if (adapter) {
      adapter.setCurrentIndex(activeQuestionIdx);
      setQStatus(adapter.getStatus(activeQuestionIdx));
      adapter.getQuestion(activeQuestionIdx).then(q => {
        setCurrentQuestion(q);
        setCodeResult(null);
        if (answers[activeQuestionIdx]) {
          setCodeText(answers[activeQuestionIdx]);
        } else {
          setCodeText(`function solution(input) {\n  // Write your solution for Problem ${activeQuestionIdx + 1} here\n  return input;\n}`);
        }
      });
    }
  }, [activeQuestionIdx, adapter, renderTrigger]);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answersRef = useRef(answers);
  const [statuses, setStatuses] = useState<Record<number, QuestionStatus>>(() => {
    const initial: Record<number, QuestionStatus> = {};
    for(let i = 0; i < blueprint.questions; i++) {
        initial[i] = 'not_visited';
    }
    initial[0] = 'not_attempted';
    return initial;
  });
  const statusesRef = useRef(statuses);

  useEffect(() => {
    answersRef.current = answers;
    statusesRef.current = statuses;
  }, [answers, statuses]);

  const [timeLeft, setTimeLeft] = useState((blueprint.durationMinutes || 120) * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [language, setLanguage] = useState<'Eng' | 'Hi'>('Eng');
  const [codeLanguage, setCodeLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [codeText, setCodeText] = useState<string>(`function solution(input) {\n  // Write your algorithm solution here\n  return input;\n}`);
  const [codeRunning, setCodeRunning] = useState(false);
  const [codeResult, setCodeResult] = useState<any>(null);

  const isCodingQuestion = useMemo(() => {
    const examLower = (blueprint.exam || "").toLowerCase();
    const qText = (currentQuestion?.question || "").toLowerCase();
    return (
      examLower.includes("google") ||
      examLower.includes("hackwithinfy") ||
      examLower.includes("coding") ||
      examLower.includes("oa") ||
      qText.includes("write a function") ||
      qText.includes("write an efficient algorithm") ||
      qText.includes("function solution")
    );
  }, [blueprint.exam, currentQuestion]);

  useEffect(() => {
    if (isCodingQuestion) {
      setIsPaletteOpen(false);
    }
  }, [isCodingQuestion]);

  const handleRunCode = async () => {
    try {
      setCodeRunning(true);
      setCodeResult(null);
      const response = await axiosInstance.post('/company-assessment/run-code', {
        code: codeText,
        language: codeLanguage,
        testCases: [
          { input: "5", output: "10" },
          { input: "12", output: "24" },
        ],
      });
      setCodeResult(response.data?.data || response.data);
    } catch (err: any) {
      setCodeResult({ success: false, error: err.message });
    } finally {
      setCodeRunning(false);
    }
  };

  useEffect(() => {
    if (isPaused || isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isPaused, isSubmitted, timeLeft]);

  // Derived stats
  const stats = useMemo(() => {
    const s = { answered: 0, review: 0, notAttempted: 0, notVisited: 0 };
    Object.values(statuses).forEach(v => {
      if (v === 'answered') s.answered++;
      else if (v === 'review') s.review++;
      else if (v === 'not_attempted') s.notAttempted++;
      else s.notVisited++;
    });
    return s;
  }, [statuses]);

  // Derived sections based on distribution
  const sections = useMemo(() => {
    if (!blueprint.distribution || Object.keys(blueprint.distribution).length === 0) {
      return [{ subject: "All Questions", count: blueprint.questions, startIndex: 0 }];
    }

    let startIndex = 0;
    const result: Array<{subject: string, count: number, startIndex: number}> = [];
    for (const [subject, count] of Object.entries(blueprint.distribution)) {
      if (count > 0) {
        result.push({ subject, count, startIndex });
        startIndex += count;
      }
    }
    
    // Add remaining as 'General' if there are any
    if (startIndex < blueprint.questions) {
      result.push({ subject: "General", count: blueprint.questions - startIndex, startIndex });
    }
    return result;
  }, [blueprint]);

  // Handle answers and navigation
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (opt: string) => {
    if (isSubmitted || !currentQuestion) return;
    setAnswers(prev => ({ ...prev, [activeQuestionIdx]: opt }));
  };

  const handleSaveAndNext = () => {
    if (!currentQuestion) return;
    const hasAnswered = !!answers[activeQuestionIdx];
    
    setStatuses(prev => ({
      ...prev,
      [activeQuestionIdx]: hasAnswered ? 'answered' : 'not_attempted'
    }));
    
    goToNextQuestion();
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    setStatuses(prev => ({ ...prev, [activeQuestionIdx]: 'review' }));
    goToNextQuestion();
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setAnswers(prev => {
      const next = { ...prev };
      delete next[activeQuestionIdx];
      return next;
    });
    setStatuses(prev => ({ ...prev, [activeQuestionIdx]: 'not_attempted' }));
  };

  const goToNextQuestion = () => {
    if (activeQuestionIdx < blueprint.questions - 1) {
      const nextIdx = activeQuestionIdx + 1;
      setActiveQuestionIdx(nextIdx);
      setStatuses(prev => ({
        ...prev,
        [nextIdx]: prev[nextIdx] === 'not_visited' ? 'not_attempted' : prev[nextIdx]
      }));
    } else {
      setIsSubmitted(true);
      // Fire-and-forget: submit analytics to backend
      if (adapter) {
        const allQuestions = adapter.getAllLoadedQuestions?.() ?? [];
        const currentAnswers = answersRef.current;
        const currentStatuses = statusesRef.current;
        const answersPayload = allQuestions.map((q: Question, idx: number) => ({
          questionId: q._id ?? null,
          subject: Object.keys(blueprint.distribution || {})[idx % Math.max(1, Object.keys(blueprint.distribution || {}).length)] || 'General',
          selectedAnswer: currentAnswers[idx] ?? null,
          correctAnswer: q.correctAnswer,
          isCorrect: currentAnswers[idx] === q.correctAnswer,
          skipped: !currentAnswers[idx],
          timeTaken: null,
          markedForReview: currentStatuses[idx] === 'review',
        }));
        const score = allQuestions.filter((q: Question, idx: number) => currentAnswers[idx] === q.correctAnswer).length;
        axiosInstance.post('/assessment/submit-exam', {
          examName: blueprint.exam,
          sessionId: adapterRef.current?.sessionId,
          answers: answersPayload,
          score,
          totalQuestions: blueprint.questions,
          timeTaken: (blueprint.durationMinutes * 60 - timeLeft) * 1000,
        }).catch((err: unknown) => console.error('[FullExamSimulator] submit-exam analytics failed:', err));
      }
    }
  };

  const goToPrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(activeQuestionIdx - 1);
    }
  };

  const jumpToQuestion = (qIdx: number) => {
    setActiveQuestionIdx(qIdx);
    setStatuses(prev => ({
      ...prev,
      [qIdx]: prev[qIdx] === 'not_visited' ? 'not_attempted' : prev[qIdx]
    }));
  };

  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'solutions'>('overview');
  const [hasSavedAttempt, setHasSavedAttempt] = useState(false);

  // Auto-submit score to backend when test is submitted
  useEffect(() => {
    if (isSubmitted && !hasSavedAttempt && adapter) {
      setHasSavedAttempt(true);
      const allQs = adapter.getAllLoadedQuestions();
      let correct = 0;
      allQs.forEach((q, idx) => {
        const userAns = answers[idx];
        if (userAns && q.correctAnswer && (userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() || userAns.startsWith(q.correctAnswer.charAt(0)))) {
          correct++;
        }
      });
      const scorePct = Math.round((correct / (allQs.length || blueprint.questions || 1)) * 100);
      
      // Save attempt in backend
      axiosInstance.post('/company-assessment/submit', {
        companyName: blueprint.exam?.split(' ')[0] || "Standard",
        testName: blueprint.exam,
        sectionScores: { correctCount: correct, totalCount: blueprint.questions, percentage: scorePct },
        timeSpentSeconds: (blueprint.durationMinutes * 60) - timeLeft,
        answers
      }).catch(err => console.warn("[FullExamSimulator] Auto-save attempt warning:", err));
    }
  }, [isSubmitted, hasSavedAttempt, adapter, answers, blueprint, timeLeft]);

  if (isSubmitted) {
    const timeUsedSeconds = (blueprint.durationMinutes * 60) - timeLeft;
    const timeFormatted = formatTime(timeUsedSeconds > 0 ? timeUsedSeconds : 0);
    const completionPct = Math.round((stats.answered / (blueprint.questions || 1)) * 100);

    // Evaluate answers against loaded questions
    const allQuestions = adapter ? adapter.getAllLoadedQuestions() : [];
    let correctCount = 0;
    let wrongCount = 0;
    const questionEvaluations = Array.from({ length: blueprint.questions }).map((_, idx) => {
      const q = adapter ? adapter.getQuestionSync(idx) : null;
      const userAns = answers[idx] || "Not Answered";
      let isCorrect = false;
      if (q && userAns !== "Not Answered") {
        if (q.correctAnswer && (userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() || userAns.startsWith(q.correctAnswer.charAt(0)))) {
          isCorrect = true;
          correctCount++;
        } else {
          wrongCount++;
        }
      }
      return {
        idx,
        question: q?.question || `Question ${idx + 1}`,
        options: q?.options || [],
        userAnswer: userAns,
        correctAnswer: q?.correctAnswer || "Refer to Solution",
        explanation: q?.explanation || "Explanations available in review.",
        isCorrect,
        isAnswered: userAns !== "Not Answered"
      };
    });

    const scorePercentage = Math.round((correctCount / (blueprint.questions || 1)) * 100);

    const submittedScreen = (
      <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
        <div className="bg-white border border-gray-100/80 rounded-3xl shadow-2xl max-w-3xl w-full text-center overflow-hidden relative p-6 md:p-8 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          
          {/* Ambient Decorative Blur */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Icon Badge */}
          <div className="relative mb-3 inline-flex shrink-0 mx-auto">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-500/10 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="mb-4 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Assessment Completed
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
              Test Submitted & Evaluated
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              {blueprint.exam} <span className="text-gray-300">•</span> Score: <span className="text-emerald-600 font-bold">{scorePercentage}%</span> ({correctCount}/{blueprint.questions} Correct)
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 mb-4 shrink-0 bg-gray-100 p-1 rounded-xl max-w-md mx-auto w-full">
            <button
              onClick={() => setActiveResultTab('overview')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeResultTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Performance Overview
            </button>
            <button
              onClick={() => setActiveResultTab('solutions')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeResultTab === 'solutions'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              View Answer Key & Solutions
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {activeResultTab === 'overview' ? (
              <>
                {/* Analytics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  
                  {/* Score */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-100/30 border border-emerald-100 text-left shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Score</span>
                      <Award className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-xl md:text-2xl font-black text-emerald-950 leading-tight">
                      {scorePercentage}%
                    </p>
                    <p className="text-[10px] font-medium text-emerald-600/80 mt-0.5">
                      {correctCount} Correct / {blueprint.questions} Qs
                    </p>
                  </div>

                  {/* Attempted */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-blue-100/30 border border-blue-100 text-left shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Attempted</span>
                      <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-xl md:text-2xl font-black text-blue-950 leading-tight">
                      {stats.answered} <span className="text-xs font-semibold text-blue-500">/ {blueprint.questions}</span>
                    </p>
                    <p className="text-[10px] font-medium text-blue-600/80 mt-0.5">
                      {blueprint.questions - stats.answered} Skipped
                    </p>
                  </div>

                  {/* Accuracy */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-100/30 border border-indigo-100 text-left shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Accuracy</span>
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                    </div>
                    <p className="text-xl md:text-2xl font-black text-indigo-950 leading-tight">
                      {stats.answered > 0 ? Math.round((correctCount / stats.answered) * 100) : 0}%
                    </p>
                    <p className="text-[10px] font-medium text-indigo-600/80 mt-0.5">
                      Precision Rate
                    </p>
                  </div>

                  {/* Time Spent */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-100/30 border border-purple-100 text-left shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Time Elapsed</span>
                      <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-xl md:text-2xl font-black text-purple-950 leading-tight">
                      {timeFormatted}
                    </p>
                    <p className="text-[10px] font-medium text-purple-600/80 mt-0.5">
                      of {blueprint.durationMinutes}m allotted
                    </p>
                  </div>

                </div>

                {/* AI Telemetry Sync Card */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between gap-4 text-left shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 text-primary">
                      <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">Evaluation Saved to MemoryOS</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Attempt performance indexed for AI weak-topic remediation.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* DETAILED SOLUTION KEY & EXPLANATIONS */
              <div className="space-y-4 text-left">
                {questionEvaluations.map((item) => (
                  <div key={item.idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="font-bold text-gray-900">Q{item.idx + 1}. {item.question}</span>
                      {item.isCorrect ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          CORRECT (+2.0)
                        </span>
                      ) : item.isAnswered ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                          INCORRECT (-0.66)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-bold text-[10px]">
                          SKIPPED
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-white border border-gray-200">
                        <span className="font-semibold text-gray-500">Your Answer: </span>
                        <span className={item.isCorrect ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                          {item.userAnswer}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white border border-gray-200">
                        <span className="font-semibold text-gray-500">Correct Answer: </span>
                        <span className="font-bold text-emerald-600">{item.correctAnswer}</span>
                      </div>
                    </div>

                    {item.explanation && (
                      <div className="p-2.5 rounded bg-blue-50 border border-blue-100 text-blue-900 text-[11px]">
                        <span className="font-bold text-blue-700">AI Explanation: </span>
                        {item.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
            <button 
              onClick={() => window.print()}
              className="px-5 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all border border-blue-200 flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-blue-600" />
              <span>Download PDF Diagnostic Report</span>
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all text-xs flex items-center gap-2"
            >
              <span>Return to Chat</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
    return mounted ? createPortal(submittedScreen, document.body) : null;
  }

  const status = adapter ? adapter.getStatus(activeQuestionIdx) : 'PENDING';

  const simulatorUI = (
    <div className="fixed inset-0 z-[100] bg-gray-50 md:bg-white flex flex-col font-sans md:overflow-hidden overflow-y-auto">
      {/* DESKTOP HEADER */}
      <div className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsPaletteOpen(!isPaletteOpen)} 
            className="p-2 hover:bg-gray-100 rounded-[5px] text-gray-600 transition-colors"
          >
             <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BrainLogo size={36} />
            <span className="font-bold text-2xl tracking-tight text-primary">AarikaAI</span>
          </div>
          <div className="w-px h-8 bg-gray-200 mx-2"></div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">{blueprint.exam}</h1>
            <p className="text-xs text-gray-500">Mock Test</p>
          </div>

          {/* Top Problem Tabs for Coding Assessments (CodeSignal / LeetCode Style) */}
          {isCodingQuestion && (
            <div className="flex items-center gap-1.5 ml-4 bg-gray-100 p-1 rounded-xl">
              {Array.from({ length: blueprint.questions }).map((_, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => jumpToQuestion(qIdx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeQuestionIdx === qIdx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <span>Problem {qIdx + 1}</span>
                  {statuses[qIdx] === 'answered' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[5px] text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Info className="w-4 h-4" /> Instructions
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[5px] text-sm font-medium text-gray-600 hover:bg-gray-50">
            <AlertCircle className="w-4 h-4" /> Report an Issue
          </button>
          <button 
            onClick={() => setIsSubmitted(true)}
            className="px-5 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-[5px] text-sm font-bold transition-colors"
          >
            Exit Exam
          </button>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="flex md:hidden sticky top-0 bg-white h-14 items-center justify-between px-4 shrink-0 shadow-sm z-50 border-b border-gray-200">
        <button onClick={() => setIsSubmitted(true)} className="flex items-center text-primary text-sm font-semibold">
           <ChevronLeft className="w-5 h-5" /> Exit Exam
        </button>
        <div className="flex flex-col items-center">
           <h1 className="font-bold text-gray-900 text-sm leading-tight flex items-center gap-1">{blueprint.exam}</h1>
           <p className="text-[10px] text-gray-500">Mock Test</p>
        </div>
        <button onClick={handleMarkForReview} className="text-primary flex items-center gap-1 text-sm font-semibold">
           <Flag className="w-4 h-4" /> Mark
        </button>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 flex flex-col md:flex-row relative pb-20 md:pb-0 md:min-h-0">
        
        {/* MOBILE SCROLLABLE CONTENT */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 flex flex-col gap-4">
             {/* Info Card */}
             <div className="bg-white rounded-[5px] p-4 shadow-sm border border-gray-100 flex flex-col">
                 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                     <div className="flex flex-col w-[30%] border-r border-gray-100 pr-2">
                         <div className="flex items-center gap-1 text-gray-500 text-[10px] font-medium mb-1"><Clock className="w-3.5 h-3.5" /> Time Left</div>
                         <div className={`text-xl font-black tracking-tight ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>{formatTime(timeLeft)}</div>
                         <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                           <div className={`h-full transition-all ${timeLeft < 300 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${(timeLeft / ((blueprint.durationMinutes || 120) * 60)) * 100}%` }} />
                         </div>
                     </div>
                     <div className="flex justify-between flex-1 pl-2">
                        <div className="flex flex-col items-center">
                           <span className="text-[10px] text-gray-500 font-medium">Questions</span>
                           <span className="font-bold text-gray-900 text-sm">{blueprint.questions}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-gray-100 pl-2">
                           <span className="text-[10px] text-gray-500 font-medium">Attempted</span>
                           <span className="font-bold text-gray-900 text-sm">{stats.answered}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-gray-100 pl-2">
                           <span className="text-[10px] text-gray-500 font-medium">Marks</span>
                           <span className="font-bold text-gray-900 text-sm">2.0</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-gray-100 pl-2">
                           <span className="text-[10px] text-gray-500 font-medium">Negative</span>
                           <span className="font-bold text-gray-900 text-sm">0.66</span>
                        </div>
                     </div>
                 </div>
                 <div className="flex items-center justify-center gap-4 pt-3 text-[10px] font-medium text-gray-500">
                     <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500"/> Answered ({stats.answered})</div>
                     <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-500"/> Review ({stats.review})</div>
                     <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-200"/> Not Attempted ({stats.notAttempted})</div>
                 </div>
             </div>

             {/* Question Card */}
             <div className="bg-white rounded-[5px] p-5 shadow-sm border border-gray-100 min-h-[300px]">
                 <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Q. {activeQuestionIdx + 1}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-bold text-[10px] rounded border border-blue-100">+2.0</span>
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 font-bold text-[10px] rounded border border-red-100">-0.66</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <button onClick={() => setLanguage('Hi')} className="border border-gray-200 rounded px-2 py-0.5 text-xs font-bold text-gray-600">हिं</button>
                         <button className="text-gray-500"><MoreVertical className="w-4 h-4"/></button>
                     </div>
                 </div>
                 
                 {qStatus === 'GENERATING' || qStatus === 'PENDING' ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                      <p className="text-sm font-medium">Generating Question...</p>
                    </div>
                 ) : qStatus === 'FAILED' ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                      <AlertCircle className="w-8 h-8 mb-4 text-red-500" />
                      <p className="text-sm font-medium text-red-600 mb-4">Failed to load question</p>
                      <button 
                        onClick={() => adapter?.retryQuestion(activeQuestionIdx)}
                        className="px-4 py-2 bg-primary text-white rounded font-medium text-sm"
                      >
                        Retry
                      </button>
                    </div>
                 ) : currentQuestion ? (
                    <>
                      <p className="text-[15px] text-gray-900 font-medium leading-relaxed whitespace-pre-wrap mb-6">
                        {currentQuestion.question}
                      </p>
                      <div className="flex flex-col gap-3">
                        {currentQuestion.options.map((opt, oIdx) => {
                          const label = String.fromCharCode(65 + oIdx);
                          const isSelected = answers[activeQuestionIdx] === opt;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleOptionSelect(opt)}
                              className={`flex items-center text-left w-full py-3 px-3 rounded-[5px] border transition-all ${
                                isSelected 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                                isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div className="flex items-center gap-3 flex-1">
                                <span className="font-bold text-gray-900 text-sm">{label}.</span>
                                <span className="text-gray-800 text-sm leading-snug">{opt}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                 ) : null}
             </div>

             {/* Question Palette Inline */}
             <div className="bg-white rounded-[5px] p-4 shadow-sm border border-gray-100 mt-2 mb-4">
                 <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm text-gray-900">Question Palette</h4>
                    <button className="text-primary text-xs font-semibold">View All</button>
                 </div>
                 <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                   {Array.from({length: blueprint.questions}).map((_, qIdx) => {
                      const qStatus = statuses[qIdx];
                      const isCurrent = activeQuestionIdx === qIdx;
                      
                      let bgClass = "bg-white border-gray-200 text-gray-600";
                      if (qStatus === 'answered') bgClass = "bg-green-100 border-green-500 text-green-700";
                      else if (qStatus === 'review') bgClass = "bg-orange-100 border-orange-500 text-orange-700";
                      else if (qStatus === 'not_attempted') bgClass = "bg-gray-100 border-gray-300 text-gray-700";
                      
                      return (
                        <button
                          key={qIdx}
                          onClick={() => jumpToQuestion(qIdx)}
                          className={`w-full aspect-square rounded-[5px] flex items-center justify-center text-[10px] font-bold border ${bgClass} ${isCurrent ? 'border-primary bg-primary/10 text-primary' : ''}`}
                        >
                          {qIdx + 1}
                        </button>
                      );
                   })}
                 </div>
             </div>
        </div>

        {/* MOBILE BOTTOM ACTION BAR */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2 z-20">
             <button onClick={goToPrevQuestion} disabled={activeQuestionIdx === 0} className="flex-1 flex justify-center items-center gap-1 py-3 border border-primary/20 text-primary rounded-[5px] font-semibold text-sm">
                 <ChevronLeft className="w-4 h-4"/> Previous
             </button>
             <button onClick={handleClearResponse} disabled={!answers[activeQuestionIdx]} className="flex-1 flex justify-center items-center gap-1 py-3 border border-gray-200 text-gray-600 rounded-[5px] font-semibold text-sm">
                 <Trash2 className="w-4 h-4"/> Clear
             </button>
             <button onClick={handleSaveAndNext} className="flex-[1.5] flex justify-center items-center gap-1 py-3 bg-primary text-white rounded-[5px] font-bold text-sm shadow-md">
                 Save & Next <ChevronRight className="w-4 h-4"/>
             </button>
        </div>


        {/* LEFT PANEL - QUESTION PALETTE (Desktop Only) */}
        <div className={`hidden md:flex bg-white border-gray-200 flex-col shrink-0 transition-all duration-300 md:min-h-0 z-20 ${isPaletteOpen ? 'w-80 border-r opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'}`}>
          <div className="p-5 border-b border-gray-100 w-80">
            <h3 className="font-bold text-gray-900 mb-4 text-base">Question Palette</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-medium text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-[5px] bg-green-500 text-white flex items-center justify-center shadow-sm">{stats.answered}</span> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-[5px] bg-orange-500 text-white flex items-center justify-center shadow-sm">{stats.review}</span> Review
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-[5px] bg-gray-200 text-gray-600 flex items-center justify-center shadow-inner border border-gray-300">{stats.notAttempted}</span> Not Attempted
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-[5px] bg-white text-gray-400 flex items-center justify-center border border-gray-200">{stats.notVisited}</span> Not Visited
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-6">
              {sections.map((section, sIdx) => (
                <div key={sIdx}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="font-bold text-sm text-gray-800">{section.subject}</h4>
                    <span className="text-xs font-semibold text-gray-400">{section.count} Qs</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({length: section.count}).map((_, offset) => {
                      const qIdx = section.startIndex + offset;
                      const qStatus = statuses[qIdx];
                      const isCurrent = activeQuestionIdx === qIdx;
                      
                      let bgClass = "bg-white border-gray-200 text-gray-600 hover:border-primary"; // not visited
                      if (qStatus === 'answered') bgClass = "bg-green-500 border-green-600 text-white hover:bg-green-600";
                      else if (qStatus === 'review') bgClass = "bg-orange-500 border-orange-600 text-white hover:bg-orange-600";
                      else if (qStatus === 'not_attempted') bgClass = "bg-gray-100 border-gray-300 text-gray-700 shadow-inner hover:bg-gray-200";
                      
                      return (
                        <button
                          key={qIdx}
                          onClick={() => jumpToQuestion(qIdx)}
                          className={`w-10 h-10 rounded-[5px] flex items-center justify-center text-sm font-bold border transition-all ${bgClass} ${isCurrent ? 'ring-2 ring-primary ring-offset-1 bg-primary border-primary text-white shadow-md z-10 scale-105' : ''}`}
                        >
                          {qIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER PANEL - QUESTION DISPLAY (Desktop Only) */}
        <div className="hidden md:flex flex-1 flex-col bg-white overflow-hidden relative md:min-h-0">
          
          <div className="flex-1 flex flex-col p-8 overflow-y-auto md:min-h-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Question {activeQuestionIdx + 1}</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-[5px] border border-gray-200">
                  <Clock className="w-4 h-4" />
                  <span className={`font-bold font-mono tracking-tight ${timeLeft < 300 ? 'text-red-500 animate-pulse' : ''}`}>{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-8">
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-[5px] border border-green-100">+2.0 Marks</span>
              <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-[5px] border border-red-100">-0.66 Marks</span>
            </div>

            {qStatus === 'GENERATING' || qStatus === 'PENDING' ? (
                <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                  <p className="text-base font-medium">Generating Question...</p>
                </div>
            ) : qStatus === 'FAILED' ? (
                <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                  <AlertCircle className="w-10 h-10 mb-4 text-red-500" />
                  <p className="text-base font-medium text-red-600 mb-4">Failed to load question</p>
                  <button 
                    onClick={() => adapter?.retryQuestion(activeQuestionIdx)}
                    className="px-6 py-2 bg-primary text-white rounded-[5px] font-medium"
                  >
                    Retry
                  </button>
                </div>
            ) : currentQuestion ? (
              <div className="flex-1 flex flex-col h-full">
                {!isCodingQuestion && (
                  <div className="prose max-w-none mb-6">
                    <p className="text-[15px] text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                      {currentQuestion.question}
                    </p>
                  </div>
                )}

                {isCodingQuestion ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 h-full min-h-[500px]">
                    {/* LEFT COLUMN (50% Width) - PROBLEM STATEMENT & CONSTRAINTS */}
                    <div className="bg-slate-50 border border-gray-200 rounded-xl p-6 flex flex-col overflow-y-auto space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
                          Problem Statement
                        </span>
                        <span className="text-xs font-semibold text-gray-500">Google SDE OA Format</span>
                      </div>

                      <div className="prose max-w-none text-gray-800 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                        {currentQuestion.question}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">Sample Constraints:</h5>
                        <ul className="text-xs font-mono text-gray-700 space-y-1 list-disc pl-4">
                          <li>1 &lt;= N &lt;= 10^5</li>
                          <li>-10^9 &lt;= Node.val &lt;= 10^9</li>
                          <li>Expected Time Complexity: O(N)</li>
                          <li>Expected Auxiliary Space: O(H)</li>
                        </ul>
                      </div>
                    </div>

                    {/* RIGHT COLUMN (50% Width) - DARK MODE CODE EDITOR IDE */}
                    <div className="flex flex-col gap-3 h-full">
                      {/* IDE Header */}
                      <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-t-xl border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Language:</span>
                          <select
                            value={codeLanguage}
                            onChange={(e: any) => setCodeLanguage(e.target.value)}
                            className="bg-slate-800 text-white text-xs font-bold py-1 px-3 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="javascript">JavaScript (Node.js)</option>
                            <option value="python">Python 3</option>
                            <option value="cpp">C++ (GCC 11)</option>
                            <option value="java">Java 17</option>
                          </select>
                        </div>
                        <button
                          onClick={handleRunCode}
                          disabled={codeRunning}
                          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow transition-all disabled:opacity-50"
                        >
                          {codeRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{codeRunning ? "Executing..." : "Run Code Sandbox"}</span>
                        </button>
                      </div>

                      {/* Code Editor Textarea */}
                      <div className="flex-1 border border-slate-800 bg-slate-950 rounded-b-xl overflow-hidden shadow-inner flex flex-col min-h-[320px]">
                        <textarea
                          value={codeText}
                          onChange={(e) => {
                            setCodeText(e.target.value);
                            handleOptionSelect(e.target.value);
                          }}
                          placeholder="// Write your solution function here..."
                          className="w-full h-full p-4 font-mono text-sm bg-slate-950 text-emerald-400 focus:outline-none resize-none leading-relaxed flex-1"
                          spellCheck={false}
                        />
                      </div>

                      {/* Execution Output Panel */}
                      {codeResult && (
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs space-y-2 max-h-40 overflow-y-auto">
                          <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-2">
                            <span>Execution Console</span>
                            <span className={codeResult.allPassed ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                              Passed {codeResult.passedCount}/{codeResult.totalTestCases} Test Cases ({codeResult.passPercentage?.toFixed(0)}%)
                            </span>
                          </div>
                          {codeResult.results?.map((r: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/50">
                              <span>Test Case #{r.testCaseIndex}</span>
                              <span className={r.status === "PASSED" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                                {r.status} ({r.executionTimeMs}ms)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((opt, oIdx) => {
                      const label = String.fromCharCode(65 + oIdx);
                      const isSelected = answers[activeQuestionIdx] === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionSelect(opt)}
                          className={`flex items-center text-left py-3 px-4 rounded-[5px] border-2 transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                            isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-bold text-gray-900 text-[15px]">{label}.</span>
                            <span className="text-gray-800 text-[15px] leading-snug">{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkForReview}
                className="px-6 py-2.5 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-sm rounded-[5px] transition-colors flex items-center gap-2"
              >
                <Flag className="w-4 h-4" /> Mark for Review
              </button>
              <button
                onClick={handleClearResponse}
                disabled={!answers[activeQuestionIdx]}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 font-bold text-sm rounded-[5px] transition-colors"
              >
                Clear Response
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrevQuestion}
                disabled={activeQuestionIdx === 0}
                className="px-6 py-2.5 border border-primary/30 text-primary hover:bg-primary/5 disabled:opacity-50 font-bold text-sm rounded-[5px] transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={handleSaveAndNext}
                className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-[5px] shadow-sm transition-all flex items-center gap-2"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return mounted ? createPortal(simulatorUI, document.body) : null;
};

export default FullExamSimulator;
