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
  Sparkles,
  MessageSquare,
  TrendingUp,
  FileText,
  BookOpen,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import BrainLogo from "@/components/BrainLogo";

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

// Same category vocabulary the backend already uses to tag government
// jobs/exams (governmentParser.js's LLM-extraction enum), kept to the subset
// that's actually "an aspirant preparing for a competitive exam" rather than
// e.g. Engineering/Medical/Law which are qualification fields, not exam types.
const GOVT_EXAM_OPTIONS = [
  { value: "UPSC", label: "UPSC (Civil Services)", emoji: "🏛️" },
  { value: "SSC", label: "SSC (CGL / CHSL / etc.)", emoji: "📋" },
  { value: "Banking", label: "Banking (IBPS / SBI)", emoji: "🏦" },
  { value: "Railway", label: "Railway (RRB)", emoji: "🚆" },
  { value: "State PSC", label: "State PSC", emoji: "📍" },
  { value: "Police", label: "Police / Defence", emoji: "🎖️" },
  { value: "Teaching", label: "Teaching (CTET / TET)", emoji: "🍎" },
];

const GOVT_CATEGORY_OPTIONS = ["General", "OBC", "SC", "ST", "EWS"];

const GOVT_QUALIFICATION_OPTIONS = ["12th Pass", "Graduation", "Post-Graduation", "Diploma", "Other"];

// Matches governmentEligibilityEngine.js's UR/General-quota vs state-quota
// matching — an aspirant's home state affects state-level exam eligibility.
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir",
  "Ladakh", "Puducherry", "Chandigarh", "Other",
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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Same look as the login page's input fields (LoginPage.tsx) — soft
        // gray field by default, white + primary ring when "active" (here,
        // selected instead of focused) — rather than a colored pill/card.
        // Full-width and stacked one below another, like a list of fields.
        "cursor-pointer flex items-center gap-2 w-full h-11 px-4 rounded-lg border text-sm font-medium transition-all duration-300",
        selected
          ? "border-primary/40 bg-white text-[#202124] dark:text-white ring-4 ring-primary/5 shadow-sm"
          : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600",
        className
      )}
    >
      {children}
    </button>
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
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: "professional",
      label: "Working Professional",
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: "job_seeker",
      label: "Job Seeker",
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: "other",
      label: "Career Switcher",
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: "govt_aspirant",
      label: "Government Exam Aspirant",
      icon: <Landmark className="w-4 h-4" />,
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
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            selected={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            {opt.icon}
            {opt.label}
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
      <div className="flex flex-col gap-2">
        <OptionCard
          selected={value === "school"}
          onClick={() => onChange("school")}
        >
          <span>🏫</span>
          School (Class 7th–12th)
        </OptionCard>
        <OptionCard
          selected={value === "college"}
          onClick={() => onChange("college")}
        >
          <span>🎓</span>
          College / University
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
  stream,
  onStreamChange,
}: {
  value: string;
  onChange: (v: string) => void;
  stream: string;
  onStreamChange: (v: string) => void;
}) {
  const classes = ["7", "8", "9", "10", "11", "12"];
  const showStream = value === "11" || value === "12";
  const streams = [
    { id: "SCIENCE", label: "Science", emoji: "🔬" },
    { id: "COMMERCE", label: "Commerce", emoji: "💼" },
    { id: "ARTS", label: "Arts", emoji: "🎨" },
  ];

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
      <div className="flex flex-col gap-2">
        {classes.map((c) => (
          <OptionCard
            key={c}
            selected={value === c}
            onClick={() => onChange(c)}
          >
            Class {c}
            <sup className="text-xs">th</sup>
          </OptionCard>
        ))}
      </div>

      {showStream && (
        <div className="space-y-3 pt-2">
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Which stream?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Helps us tailor subjects and exam prep for Class {value}.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {streams.map((s) => (
              <OptionCard
                key={s.id}
                selected={stream === s.id}
                onClick={() => onStreamChange(s.id)}
              >
                <span>{s.emoji}</span>
                {s.label}
              </OptionCard>
            ))}
          </div>
        </div>
      )}
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

        <div className="flex flex-col gap-2">
          {boardOptions.map((opt) => (
            <OptionCard
              key={opt.id}
              selected={board === opt.id}
              onClick={() => {
                setBoard(opt.id);
                if (opt.id !== "STATE") setStateBoard("");
              }}
            >
              <span>{opt.emoji}</span>
              {opt.label}
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
                "absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                wantsExamPrep ? "translate-x-7" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {/* Exam Chips */}
        {wantsExamPrep && (
          <div className="flex flex-col gap-2">
            {EXAM_OPTIONS.map((ex) => {
              const isSelected = targetExams.includes(ex.value);
              return (
                <OptionCard
                  key={ex.value}
                  selected={isSelected}
                  onClick={() => toggleExam(ex.value)}
                >
                  <span>{ex.emoji}</span>
                  {ex.label}
                </OptionCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP: GOVERNMENT EXAM DETAILS (govt aspirant path)
// ─────────────────────────────────────────────────────────────────────────────

const selectClasses = "w-full px-3 py-2.5 text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition-colors cursor-pointer";
const textInputClasses = "w-full px-3 py-2.5 text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition-colors";

function StepGovtExam({
  targetExams,
  toggleExam,
  category,
  setCategory,
  age,
  setAge,
  state,
  setState,
  qualification,
  setQualification,
  attemptYear,
  setAttemptYear,
}: {
  targetExams: string[];
  toggleExam: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  state: string;
  setState: (v: string) => void;
  qualification: string;
  setQualification: (v: string) => void;
  attemptYear: string;
  setAttemptYear: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Which exam(s) are you preparing for?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select all that apply — helps us track the right deadlines and results for you.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {GOVT_EXAM_OPTIONS.map((ex) => (
            <OptionCard
              key={ex.value}
              selected={targetExams.includes(ex.value)}
              onClick={() => toggleExam(ex.value)}
            >
              <span>{ex.emoji}</span>
              {ex.label}
            </OptionCard>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Your details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Used for accurate eligibility checks — age limits and category relaxation vary by exam.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            inputMode="numeric"
            min={16}
            max={70}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            className={textInputClasses}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClasses}
          >
            <option value="">Category</option>
            {GOVT_CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className={selectClasses}
        >
          <option value="">— Select your state —</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <select
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className={selectClasses}
          >
            <option value="">Qualification</option>
            {GOVT_QUALIFICATION_OPTIONS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          <input
            type="number"
            inputMode="numeric"
            value={attemptYear}
            onChange={(e) => setAttemptYear(e.target.value)}
            placeholder="Target year"
            className={textInputClasses}
          />
        </div>
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
    { id: "get_job", label: "Get a Job", icon: <Briefcase className="w-4 h-4" /> },
    { id: "upskill", label: "Upskill & Grow", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "exam_prep", label: "Prepare for Exams", icon: <BookOpen className="w-4 h-4" /> },
    { id: "switch_career", label: "Career Transition", icon: <Compass className="w-4 h-4" /> },
    { id: "build_profile", label: "Build Personal Brand", icon: <FileText className="w-4 h-4" /> },
    { id: "explore", label: "Explore Options", icon: <Sparkles className="w-4 h-4" /> },
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
      <div className="flex flex-col gap-2">
        {goalOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            selected={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            {opt.icon}
            {opt.label}
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP: COLLEGE DETAILS (college students)
// ─────────────────────────────────────────────────────────────────────────────

const DEGREE_OPTIONS = ["B.Tech / B.E.", "B.Sc", "B.Com", "BBA", "BCA", "B.A.", "MBBS / Medical", "Diploma", "M.Tech / M.E.", "MBA", "MCA", "M.Sc / M.A. / M.Com", "Other"];
const CURRENT_YEAR = new Date().getFullYear();

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
      {children}
      {optional && <span className="ml-1 font-normal text-slate-400">(optional)</span>}
    </label>
  );
}

function StepCollegeDetails({
  degree, setDegree, branch, setBranch, yearOfStudy, setYearOfStudy,
  graduationYear, setGraduationYear, institution, setInstitution,
  targetRole, setTargetRole, skills, setSkills,
}: {
  degree: string; setDegree: (v: string) => void;
  branch: string; setBranch: (v: string) => void;
  yearOfStudy: string; setYearOfStudy: (v: string) => void;
  graduationYear: string; setGraduationYear: (v: string) => void;
  institution: string; setInstitution: (v: string) => void;
  targetRole: string; setTargetRole: (v: string) => void;
  skills: string; setSkills: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tell us about your college</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We use this to find internships and placements that fit.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <FieldLabel>Degree</FieldLabel>
          <select id="onb-degree" className={selectClasses} value={degree} onChange={(e) => setDegree(e.target.value)}>
            <option value="">Select degree</option>
            {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Year of study</FieldLabel>
          <select id="onb-year" className={selectClasses} value={yearOfStudy} onChange={(e) => {
            setYearOfStudy(e.target.value);
            if (!graduationYear && e.target.value) setGraduationYear(String(CURRENT_YEAR + Math.max(0, 4 - Number(e.target.value))));
          }}>
            <option value="">Select year</option>
            {[1, 2, 3, 4, 5].map((y) => <option key={y} value={String(y)}>{y === 5 ? "5th year / final" : `${y}${["st", "nd", "rd", "th"][y - 1]} year`}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <FieldLabel optional>Branch / specialisation</FieldLabel>
          <input id="onb-branch" className={textInputClasses} placeholder="e.g. Computer Science" value={branch} onChange={(e) => setBranch(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel optional>Graduation year</FieldLabel>
          <select id="onb-grad-year" className={selectClasses} value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)}>
            <option value="">Select</option>
            {Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 1 + i).map((y) => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <FieldLabel optional>College name</FieldLabel>
          <input id="onb-institution" className={textInputClasses} placeholder="e.g. RTU Kota" value={institution} onChange={(e) => setInstitution(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <FieldLabel optional>Role you&apos;re aiming for</FieldLabel>
          <input id="onb-target-role" className={textInputClasses} placeholder="e.g. Data Analyst, Software Engineer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <FieldLabel optional>Skills (comma separated)</FieldLabel>
          <input id="onb-skills" className={textInputClasses} placeholder="e.g. Python, SQL, Excel" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP: WORK DETAILS (professional / job seeker / career switcher)
// ─────────────────────────────────────────────────────────────────────────────

const EXPERIENCE_OPTIONS = [
  { value: "0", label: "Fresher (0 years)" },
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "4", label: "3–5 years" },
  { value: "8", label: "6–10 years" },
  { value: "12", label: "10+ years" },
];

function StepWorkDetails({
  isSwitcher, isJobSeeker,
  currentRole, setCurrentRole, experienceYears, setExperienceYears,
  targetRole, setTargetRole, skills, setSkills, preferredLocation, setPreferredLocation,
}: {
  isSwitcher: boolean; isJobSeeker: boolean;
  currentRole: string; setCurrentRole: (v: string) => void;
  experienceYears: string; setExperienceYears: (v: string) => void;
  targetRole: string; setTargetRole: (v: string) => void;
  skills: string; setSkills: (v: string) => void;
  preferredLocation: string; setPreferredLocation: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isSwitcher ? "Where are you, and where do you want to go?" : "Tell us about your work"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This makes job matches and advice specific to you.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <FieldLabel optional={isJobSeeker}>{isSwitcher ? "Current role / field" : isJobSeeker ? "Last or current role" : "Current role"}</FieldLabel>
          <input id="onb-current-role" className={textInputClasses} placeholder={isSwitcher ? "e.g. School Teacher" : "e.g. Software Engineer"} value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Experience</FieldLabel>
          <select id="onb-experience" className={selectClasses} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}>
            <option value="">Select</option>
            {EXPERIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <FieldLabel optional={!isSwitcher}>{isSwitcher ? "Role or field you want to move into" : "Target role"}</FieldLabel>
          <input id="onb-target-role" className={textInputClasses} placeholder={isSwitcher ? "e.g. Product Manager" : "e.g. Senior Software Engineer"} value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <FieldLabel optional>Top skills (comma separated)</FieldLabel>
          <input id="onb-skills" className={textInputClasses} placeholder="e.g. Java, AWS, Stakeholder management" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <FieldLabel optional>Preferred city</FieldLabel>
          <input id="onb-location" className={textInputClasses} placeholder="e.g. Bengaluru, Remote" value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} />
        </div>
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
    { id: "Friendly & Casual (Hinglish)", title: "Friendly & Casual (Hinglish) 🇮🇳" },
    { id: "Professional & Formal", title: "Professional & Formal" },
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
      <div className="flex flex-col gap-2">
        {toneOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            selected={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            <MessageSquare className="w-4 h-4" />
            {opt.title}
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
  const [stream, setStream] = useState(""); // only meaningful for class 11/12

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

  // ── Step 2 (govt aspirant): exam + eligibility details ──
  const [govtTargetExams, setGovtTargetExams] = useState<string[]>([]);
  const [govtCategory, setGovtCategory] = useState("");
  const [govtAge, setGovtAge] = useState("");
  const [govtState, setGovtState] = useState("");
  const [govtQualification, setGovtQualification] = useState("");
  const [govtAttemptYear, setGovtAttemptYear] = useState("");

  // College + work details
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [institution, setInstitution] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");

  // ── Derived path flags ──
  const isStudent = currentStatus === "student";
  const isSchoolPath = isStudent && educationLevel === "school";
  const isCollegeStudent = isStudent && educationLevel === "college";
  const isGovtAspirant = currentStatus === "govt_aspirant";

  const isSwitcher = currentStatus === "other";
  const isJobSeeker = currentStatus === "job_seeker";
  const isWorkPath = currentStatus === "professional" || isJobSeeker || isSwitcher;

  // Effective board value for submission
  const getEffectiveBoard = () => (board === "STATE" ? stateBoard : board);

  // ── Steps per path ──
  type StepKey =
    | "who"
    | "school_or_college"
    | "class"
    | "board_exam"
    | "college_details"
    | "work_details"
    | "govt_details"
    | "goal"
    | "tone";

  const stepOrder: StepKey[] = (() => {
    if (isStudent) {
      if (isSchoolPath) return ["who", "school_or_college", "class", "board_exam"];
      if (isCollegeStudent) return ["who", "school_or_college", "college_details", "goal", "tone"];
      return ["who", "school_or_college", "class", "board_exam"]; // not chosen yet
    }
    if (isGovtAspirant) return ["who", "govt_details", "tone"];
    if (isWorkPath) return ["who", "work_details", "goal", "tone"];
    return ["who", "work_details", "goal", "tone"]; // nothing chosen yet: typical length for the step counter
  })();

  const totalSteps = stepOrder.length;
  const stepKey: StepKey = stepOrder[Math.min(step, totalSteps) - 1];
  const isLastStep = step === totalSteps && currentStatus !== "";

  // ── Proceed guard ──
  const canProceed = (): boolean => {
    switch (stepKey) {
      case "who": return !!currentStatus;
      case "school_or_college": return !!educationLevel;
      case "class":
        if (!schoolClass) return false;
        if ((schoolClass === "11" || schoolClass === "12") && !stream) return false;
        return true;
      case "board_exam": return !!getEffectiveBoard();
      case "govt_details": return govtTargetExams.length > 0 && !!govtAge && !!govtState;
      case "college_details": return !!degree && !!yearOfStudy;
      case "work_details":
        if (!experienceYears) return false;
        if (isSwitcher) return !!targetRole.trim();
        if (currentStatus === "professional") return !!currentRole.trim();
        return true;
      case "goal": return !!primaryGoal;
      case "tone": return !!communicationStyle;
      default: return true;
    }
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
    setStream("");
    setBoard("");
    setStateBoard("");
    setWantsExamPrep(false);
    setTargetExams([]);
    setGovtTargetExams([]);
    setGovtCategory("");
    setGovtAge("");
    setGovtState("");
    setGovtQualification("");
    setGovtAttemptYear("");
    setPrimaryGoal(v === "other" ? "switch_career" : v === "professional" ? "upskill" : "get_job");
  };

  const handleEducationLevelChange = (v: string) => {
    setEducationLevel(v);
    setSchoolClass("");
    setStream("");
    setBoard("");
    setStateBoard("");
    setWantsExamPrep(false);
    setTargetExams([]);
  };

  const handleSchoolClassChange = (v: string) => {
    setSchoolClass(v);
    if (v !== "11" && v !== "12") setStream("");
  };

  const toggleExam = (value: string) => {
    setTargetExams((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  const toggleGovtExam = (value: string) => {
    setGovtTargetExams((prev) =>
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
          : isGovtAspirant
            ? "exam_prep"
            : primaryGoal,
        ...(educationLevel && { educationLevel }),
        ...(isSchoolPath && {
          schoolClass,
          board: effectiveBoard,
          wantsExamPrep,
          targetExams: wantsExamPrep ? targetExams : [],
          ...((schoolClass === "11" || schoolClass === "12") && { stream }),
        }),
        ...(isCollegeStudent && {
          degree,
          branch,
          yearOfStudy,
          graduationYear,
          institution,
          ...(targetRole.trim() && { targetRole: targetRole.trim() }),
        }),
        ...(isWorkPath && {
          currentRole,
          experienceYears,
          preferredLocation,
          ...(isSwitcher
            ? { currentDomain: currentRole, targetDomain: targetRole }
            : targetRole.trim() && { targetRole: targetRole.trim() }),
        }),
        ...((isCollegeStudent || isWorkPath) && skillsText.trim() && {
          skills: skillsText.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 10),
        }),
        ...(isGovtAspirant && {
          govtTargetExams,
          govtCategory,
          govtAge,
          govtState,
          govtQualification,
          govtAttemptYear,
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
    govt_details: "Tell us more about yourself",
    college_details: "Your college",
    work_details: "Your experience",
    goal: "What's your goal?",
    tone: "One last thing",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-950 select-none">
      <div className="min-h-[100dvh] flex flex-col">
        {/* ── HEADER ── */}
        <header className="h-[60px] flex items-center justify-between px-6 lg:px-12 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
              <BrainLogo size={32} />
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
            <StepClass
              value={schoolClass}
              onChange={handleSchoolClassChange}
              stream={stream}
              onStreamChange={setStream}
            />
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
          {stepKey === "govt_details" && (
            <StepGovtExam
              targetExams={govtTargetExams}
              toggleExam={toggleGovtExam}
              category={govtCategory}
              setCategory={setGovtCategory}
              age={govtAge}
              setAge={setGovtAge}
              state={govtState}
              setState={setGovtState}
              qualification={govtQualification}
              setQualification={setGovtQualification}
              attemptYear={govtAttemptYear}
              setAttemptYear={setGovtAttemptYear}
            />
          )}
          {stepKey === "college_details" && (
            <StepCollegeDetails
              degree={degree} setDegree={setDegree}
              branch={branch} setBranch={setBranch}
              yearOfStudy={yearOfStudy} setYearOfStudy={setYearOfStudy}
              graduationYear={graduationYear} setGraduationYear={setGraduationYear}
              institution={institution} setInstitution={setInstitution}
              targetRole={targetRole} setTargetRole={setTargetRole}
              skills={skillsText} setSkills={setSkillsText}
            />
          )}
          {stepKey === "work_details" && (
            <StepWorkDetails
              isSwitcher={isSwitcher}
              isJobSeeker={isJobSeeker}
              currentRole={currentRole} setCurrentRole={setCurrentRole}
              experienceYears={experienceYears} setExperienceYears={setExperienceYears}
              targetRole={targetRole} setTargetRole={setTargetRole}
              skills={skillsText} setSkills={setSkillsText}
              preferredLocation={preferredLocation} setPreferredLocation={setPreferredLocation}
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

          {/* ── NAV BUTTONS — same look as the login page's Sign In button,
              placed right below the options in the normal page flow instead
              of a separate sticky bottom bar ── */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              id="onboarding-next-btn"
              onClick={goNext}
              disabled={!canProceed() || loading}
              className="w-full h-11 rounded-lg bg-[#202124] text-white text-sm font-bold hover:bg-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-50 shadow-md transition-all duration-300 gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : isLastStep ? (
                "Let's Go 🚀"
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {step > 1 && (
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={loading}
                className="w-full h-11 gap-2 text-gray-500 hover:text-[#202124] dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
