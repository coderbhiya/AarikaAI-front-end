"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Search,
  Compass,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  TrendingUp,
  FileText,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const STATE_BOARDS = [
  { value: "STATE_MP", label: "MP Board (MPBSE)" },
  { value: "STATE_UP", label: "UP Board (UPMSP)" },
  { value: "STATE_MH", label: "Maharashtra (SSC / HSC)" },
  { value: "STATE_RJ", label: "Rajasthan Board (RBSE)" },
  { value: "STATE_BR", label: "Bihar Board (BSEB)" },
  { value: "STATE_WB", label: "West Bengal (WBBSE)" },
  { value: "STATE_KA", label: "Karnataka (KSEEB / PUC)" },
  { value: "STATE_TN", label: "Tamil Nadu (TNBSE)" },
  { value: "STATE_AP", label: "Andhra Pradesh (BSEAP)" },
  { value: "STATE_TS", label: "Telangana (BSETS)" },
  { value: "STATE_GJ", label: "Gujarat Board (GSEB)" },
  { value: "STATE_HR", label: "Haryana Board (HBSE)" },
  { value: "STATE_PB", label: "Punjab Board (PSEB)" },
  { value: "STATE_OD", label: "Odisha Board (BSE)" },
  { value: "STATE_JH", label: "Jharkhand Board (JAC)" },
  { value: "STATE_CG", label: "Chhattisgarh (CGBSE)" },
  { value: "STATE_UK", label: "Uttarakhand (UBSE)" },
  { value: "STATE_HP", label: "Himachal Pradesh (HPBOSE)" },
  { value: "STATE_AS", label: "Assam Board (SEBA)" },
  { value: "STATE_KL", label: "Kerala Board (HSE)" },
  { value: "STATE_OTHER", label: "Other State Board" },
];

const EXAM_OPTIONS = [
  { value: "JEE_MAIN", label: "JEE Main", emoji: "⚙️" },
  { value: "JEE_ADV", label: "JEE Advanced", emoji: "🔬" },
  { value: "NEET", label: "NEET UG", emoji: "🩺" },
  { value: "CUET", label: "CUET UG", emoji: "📚" },
  { value: "NDA", label: "NDA", emoji: "🎖️" },
  { value: "BOARD_10", label: "Class 10 Boards", emoji: "🏅" },
  { value: "BOARD_12", label: "Class 12 Boards", emoji: "🏆" },
  { value: "OLYMPIAD", label: "Olympiads", emoji: "🧮" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED OPTION CARD
// ─────────────────────────────────────────────────────────────────────────────

function OptionCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-150",
        selected
          ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700",
        className
      )}
    >
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center pointer-events-none">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP: WHO ARE YOU
// ─────────────────────────────────────────────────────────────────────────────

function StepWho({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    {
      id: "student",
      label: "Student",
      desc: "School / College / Higher Ed",
      icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
    },
    {
      id: "professional",
      label: "Working Professional",
      desc: "Already working in industry",
      icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: "job_seeker",
      label: "Job Seeker",
      desc: "Looking for job opportunities",
      icon: <Search className="w-5 h-5 text-amber-600" />,
    },
    {
      id: "other",
      label: "Career Switcher",
      desc: "Exploring a new career domain",
      icon: <Compass className="w-5 h-5 text-purple-600" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          What is your current status?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          We'll personalize your experience based on where you are.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            selected={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            <div className="mb-3">{opt.icon}</div>
            <h3
              className={cn(
                "text-sm font-bold",
                value === opt.id
                  ? "text-blue-900 dark:text-blue-300"
                  : "text-slate-800 dark:text-slate-200"
              )}
            >
              {opt.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
              {opt.desc}
            </p>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP: SCHOOL OR COLLEGE
// ─────────────────────────────────────────────────────────────────────────────

function StepSchoolOrCollege({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Are you in school or college?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          This helps us tailor the right tools for you.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <OptionCard
          selected={value === "school"}
          onClick={() => onChange("school")}
        >
          <div className="flex flex-col items-center text-center gap-3 py-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <span className="text-3xl">🏫</span>
            </div>
            <div>
              <h3
                className={cn(
                  "text-sm font-bold",
                  value === "school"
                    ? "text-blue-900 dark:text-blue-300"
                    : "text-slate-800 dark:text-slate-200"
                )}
              >
                School
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Class 7th – 12th
              </p>
            </div>
          </div>
        </OptionCard>
        <OptionCard
          selected={value === "college"}
          onClick={() => onChange("college")}
        >
          <div className="flex flex-col items-center text-center gap-3 py-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
            <div>
              <h3
                className={cn(
                  "text-sm font-bold",
                  value === "college"
                    ? "text-blue-900 dark:text-blue-300"
                    : "text-slate-800 dark:text-slate-200"
                )}
              >
                College / University
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                UG, PG & Beyond
              </p>
            </div>
          </div>
        </OptionCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP: WHICH CLASS
// ─────────────────────────────────────────────────────────────────────────────

function StepClass({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const classes = ["7", "8", "9", "10", "11", "12"];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Which class are you in?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          We'll curate content and exam paths for your class.
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {classes.map((c) => (
          <OptionCard
            key={c}
            selected={value === c}
            onClick={() => onChange(c)}
          >
            <div className="text-center py-2">
              <span
                className={cn(
                  "text-xl font-extrabold block",
                  value === c
                    ? "text-blue-600"
                    : "text-slate-700 dark:text-slate-300"
                )}
              >
                {c}
                <sup className="text-xs font-semibold">th</sup>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Class
              </span>
            </div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP: BOARD + EXAM PREP
// ─────────────────────────────────────────────────────────────────────────────

function StepBoardAndExam({
  board,
  setBoard,
  stateBoard,
  setStateBoard,
  wantsExamPrep,
  setWantsExamPrep,
  targetExams,
  toggleExam,
}: {
  board: string;
  setBoard: (v: string) => void;
  stateBoard: string;
  setStateBoard: (v: string) => void;
  wantsExamPrep: boolean;
  setWantsExamPrep: (v: boolean) => void;
  targetExams: string[];
  toggleExam: (v: string) => void;
}) {
  const boardOptions = [
    { id: "CBSE", label: "CBSE", badge: "All India", emoji: "📘" },
    { id: "ICSE", label: "ICSE / CISCE", badge: "All India", emoji: "📗" },
    { id: "STATE", label: "State Board", badge: "Regional", emoji: "📍" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Board Selection ── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Which board are you in?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Helps us match the right syllabus for you.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {boardOptions.map((opt) => (
            <OptionCard
              key={opt.id}
              selected={board === opt.id}
              onClick={() => {
                setBoard(opt.id);
                if (opt.id !== "STATE") setStateBoard("");
              }}
            >
              <div className="text-center py-1">
                <span className="text-2xl block mb-1.5">{opt.emoji}</span>
                <h3
                  className={cn(
                    "text-xs font-bold leading-tight",
                    board === opt.id
                      ? "text-blue-900 dark:text-blue-300"
                      : "text-slate-800 dark:text-slate-200"
                  )}
                >
                  {opt.label}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {opt.badge}
                </p>
              </div>
            </OptionCard>
          ))}
        </div>

        {/* State Board Sub-Dropdown */}
        {board === "STATE" && (
          <div className="mt-1">
            <select
              value={stateBoard}
              onChange={(e) => setStateBoard(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="">— Select your state board —</option>
              {STATE_BOARDS.map((sb) => (
                <option key={sb.value} value={sb.value}>
                  {sb.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-200 dark:border-slate-800" />

      {/* ── Exam Prep Toggle ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Exam Goal? 🎯
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unlock JEE, NEET, Board prep &amp; more — free
            </p>
          </div>
          <button
            type="button"
            id="exam-prep-toggle"
            onClick={() => setWantsExamPrep(!wantsExamPrep)}
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 shrink-0",
              wantsExamPrep
                ? "bg-blue-600"
                : "bg-slate-300 dark:bg-slate-700"
            )}
            aria-pressed={wantsExamPrep}
            aria-label="Toggle exam prep"
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                wantsExamPrep ? "translate-x-7" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {/* Exam Grid */}
        {wantsExamPrep && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXAM_OPTIONS.map((ex) => {
              const isSelected = targetExams.includes(ex.value);
              return (
                <div
                  key={ex.value}
                  id={`exam-${ex.value.toLowerCase()}`}
                  onClick={() => toggleExam(ex.value)}
                  className={cn(
                    "cursor-pointer p-2.5 rounded-xl border-2 text-center transition-all duration-150",
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <span className="text-xl block mb-1">{ex.emoji}</span>
                  <p
                    className={cn(
                      "text-[11px] font-semibold leading-tight",
                      isSelected
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {ex.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP: PRIMARY GOAL (non-school paths)
// ─────────────────────────────────────────────────────────────────────────────

function StepGoal({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const goalOptions = [
    {
      id: "get_job",
      label: "Get a Job",
      desc: "Find opportunities & crack interviews",
      icon: <Briefcase className="w-4 h-4 text-blue-600" />,
    },
    {
      id: "upskill",
      label: "Upskill & Grow",
      desc: "Learn new skills & technologies",
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: "exam_prep",
      label: "Prepare for Exams",
      desc: "Crack competitive or academic exams",
      icon: <BookOpen className="w-4 h-4 text-amber-600" />,
    },
    {
      id: "switch_career",
      label: "Career Transition",
      desc: "Switch into a completely new field",
      icon: <Compass className="w-4 h-4 text-purple-600" />,
    },
    {
      id: "build_profile",
      label: "Build Personal Brand",
      desc: "Optimize resume, LinkedIn & portfolio",
      icon: <FileText className="w-4 h-4 text-rose-600" />,
    },
    {
      id: "explore",
      label: "Explore Options",
      desc: "Not sure yet, want AI guidance",
      icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          What is your primary goal?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          AarikaAI will focus on what matters most to you.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {goalOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            selected={value === opt.id}
            onClick={() => onChange(opt.id)}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
              {opt.icon}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h3
                className={cn(
                  "text-xs font-bold",
                  value === opt.id
                    ? "text-blue-900 dark:text-blue-300"
                    : "text-slate-800 dark:text-slate-200"
                )}
              >
                {opt.label}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {opt.desc}
              </p>
            </div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP: COMMUNICATION TONE (non-school paths)
// ─────────────────────────────────────────────────────────────────────────────

function StepTone({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const toneOptions = [
    {
      id: "Friendly & Casual (Hinglish)",
      title: "Friendly & Casual (Hinglish)",
      desc: "Conversational Hinglish like a mentor friend",
      badge: "Popular in India 🇮🇳",
    },
    {
      id: "Professional & Formal",
      title: "Professional & Formal",
      desc: "Crisp, structured formal English",
      badge: "Standard Professional",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          How should AarikaAI talk to you?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Choose your preferred communication style.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {toneOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            selected={value === opt.id}
            onClick={() => onChange(opt.id)}
            className="flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3
                  className={cn(
                    "text-sm font-bold",
                    value === opt.id
                      ? "text-blue-900 dark:text-blue-300"
                      : "text-slate-800 dark:text-slate-200"
                  )}
                >
                  {opt.title}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                  {opt.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {opt.desc}
              </p>
            </div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, syncProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ── Step tracking ──
  const [step, setStep] = useState(1);

  // ── Step 1: Who are you? ──
  const [currentStatus, setCurrentStatus] = useState("");

  // ── Step 2 (student): School or College? ──
  const [educationLevel, setEducationLevel] = useState("");

  // ── Step 3 (school): Which class? ──
  const [schoolClass, setSchoolClass] = useState("");

  // ── Step 4 (school): Board + Exam Prep ──
  const [board, setBoard] = useState("");
  const [stateBoard, setStateBoard] = useState("");
  const [wantsExamPrep, setWantsExamPrep] = useState(false);
  const [targetExams, setTargetExams] = useState<string[]>([]);

  // ── Non-school path (goal + tone) ──
  const [primaryGoal, setPrimaryGoal] = useState("get_job");
  const [communicationStyle, setCommunicationStyle] = useState(
    "Friendly & Casual (Hinglish)"
  );

  // ── Derived path flags ──
  const isStudent = currentStatus === "student";
  const isSchoolPath = isStudent && educationLevel === "school";
  const isCollegeStudent = isStudent && educationLevel === "college";

  // Total steps: student paths = 4, others = 3
  const totalSteps = isStudent || currentStatus === "" ? 4 : 3;

  // Effective board value for submission
  const getEffectiveBoard = () => (board === "STATE" ? stateBoard : board);

  // ── Step key mapping ──
  type StepKey =
    | "who"
    | "school_or_college"
    | "class"
    | "board_exam"
    | "goal"
    | "tone";

  const getStepKey = (): StepKey => {
    if (step === 1) return "who";
    if (step === 2) return isStudent ? "school_or_college" : "goal";
    if (step === 3) {
      if (isSchoolPath) return "class";
      if (isCollegeStudent) return "goal";
      return "tone"; // non-student last step
    }
    if (step === 4) {
      return isSchoolPath ? "board_exam" : "tone"; // college last step
    }
    return "who";
  };

  const stepKey = getStepKey();
  const isLastStep =
    (step === 3 && !isSchoolPath && !isCollegeStudent) || step === 4;

  // ── Proceed guard ──
  const canProceed = (): boolean => {
    if (step === 1) return !!currentStatus;
    if (step === 2) return isStudent ? !!educationLevel : !!primaryGoal;
    if (step === 3) {
      if (isSchoolPath) return !!schoolClass;
      if (isCollegeStudent) return !!primaryGoal;
      return !!communicationStyle;
    }
    if (step === 4) {
      if (isSchoolPath) return !!getEffectiveBoard();
      return !!communicationStyle;
    }
    return true;
  };

  // ── Navigation ──
  const goNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // Reset downstream state when user changes a branching selection
  const handleStatusChange = (v: string) => {
    setCurrentStatus(v);
    setEducationLevel("");
    setSchoolClass("");
    setBoard("");
    setStateBoard("");
    setWantsExamPrep(false);
    setTargetExams([]);
  };

  const handleEducationLevelChange = (v: string) => {
    setEducationLevel(v);
    setSchoolClass("");
    setBoard("");
    setStateBoard("");
    setWantsExamPrep(false);
    setTargetExams([]);
  };

  const toggleExam = (value: string) => {
    setTargetExams((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  // ── Submit to backend ──
  const handleFinish = async () => {
    setLoading(true);
    try {
      const effectiveBoard = getEffectiveBoard();

      const payload: Record<string, unknown> = {
        currentStatus,
        communicationStyle: isSchoolPath
          ? "Friendly & Casual (Hinglish)"
          : communicationStyle,
        primaryGoal: isSchoolPath
          ? wantsExamPrep
            ? "exam_prep"
            : "explore"
          : primaryGoal,
        ...(educationLevel && { educationLevel }),
        ...(isSchoolPath && {
          schoolClass,
          board: effectiveBoard,
          wantsExamPrep,
          targetExams: wantsExamPrep ? targetExams : [],
        }),
      };

      const response = await axiosInstance.post("/profile/onboarding", payload);

      if (response.data.success) {
        toast.success("Profile personalized! Welcome to AarikaAI 🎉");
        await syncProfile();
        onComplete();
        router.push("/chat");
      } else {
        toast.error(response.data.message || "Failed to save preferences.");
      }
    } catch (error: unknown) {
      console.error("Error saving onboarding preferences:", error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / totalSteps) * 100;
  const userName = user?.displayName || user?.name || "there";

  const stepSubheadings: Record<StepKey, string> = {
    who: `Welcome, ${userName}! 👋`,
    school_or_college: "Tell us more about yourself",
    class: "Tell us about your class",
    board_exam: "Almost done!",
    goal: "What's your goal?",
    tone: "One last thing",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-950 select-none">
      <div className="min-h-[100dvh] flex flex-col">
        {/* ── HEADER ── */}
        <header className="h-[60px] flex items-center justify-between px-6 lg:px-12 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              A
            </div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              Aarika<span className="text-blue-600">.AI</span>
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            Step {step} of {totalSteps}
          </div>
        </header>

        {/* ── PROGRESS BAR ── */}
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 shrink-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            {stepSubheadings[stepKey]}
          </p>

          {stepKey === "who" && (
            <StepWho value={currentStatus} onChange={handleStatusChange} />
          )}
          {stepKey === "school_or_college" && (
            <StepSchoolOrCollege
              value={educationLevel}
              onChange={handleEducationLevelChange}
            />
          )}
          {stepKey === "class" && (
            <StepClass value={schoolClass} onChange={setSchoolClass} />
          )}
          {stepKey === "board_exam" && (
            <StepBoardAndExam
              board={board}
              setBoard={setBoard}
              stateBoard={stateBoard}
              setStateBoard={setStateBoard}
              wantsExamPrep={wantsExamPrep}
              setWantsExamPrep={setWantsExamPrep}
              targetExams={targetExams}
              toggleExam={toggleExam}
            />
          )}
          {stepKey === "goal" && (
            <StepGoal value={primaryGoal} onChange={setPrimaryGoal} />
          )}
          {stepKey === "tone" && (
            <StepTone
              value={communicationStyle}
              onChange={setCommunicationStyle}
            />
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={step === 1 || loading}
            className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            id="onboarding-next-btn"
            onClick={goNext}
            disabled={!canProceed() || loading}
            className="h-11 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLastStep ? (
              "Let's Go 🚀"
            ) : (
              <>
                Next <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
