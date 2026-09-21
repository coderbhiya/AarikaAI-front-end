"use client";

import React, { useState, Suspense } from "react";
import { createPortal } from "react-dom";
import Sidebar from "@/components/Sidebar";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Check,
  FileText,
  Zap,
  Layers,
  Loader2,
  Menu,
} from "lucide-react";
import FullExamSimulator from "@/components/chat/cards/FullExamSimulator";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

// Exam names here just need to reach the backend's blueprint resolver
// (examBlueprintService.js) with a recognizable name — "IIT JEE"/"NEET"/
// "UPSC"/"UPSC CSAT"/"SSC CGL"/"IBPS PO"/"CAT"/"CA Foundation" hit its
// hardcoded fast-path table; everything else (any board/class/subject,
// GATE, Railway, State PSC, ...) falls through to its LLM-based generator,
// which is why "Other Exam" below accepts free text instead of needing a
// hardcoded entry per exam. `subjects` is just this page's convenience
// preset list — the real section names come back from the resolved
// blueprint once "Generate & Start Exam" is clicked.
const EXAMS = [
  { id: "IIT JEE", name: "IIT JEE", description: "Joint Entrance Examination for Engineering", subjects: ["Full Exam", "Physics", "Chemistry", "Mathematics"] },
  { id: "NEET", name: "NEET", description: "National Eligibility cum Entrance Test for Medical", subjects: ["Full Exam", "Physics", "Chemistry", "Biology"] },
  { id: "UPSC", name: "UPSC Civil Services (Prelims GS)", description: "General Studies Paper 1", subjects: ["Full Exam", "General Studies"] },
  { id: "UPSC CSAT", name: "UPSC CSAT (Prelims Paper 2)", description: "Qualifying aptitude paper", subjects: ["Full Exam", "CSAT (Aptitude & Comprehension)"] },
  { id: "SSC CGL", name: "SSC CGL", description: "Staff Selection Commission exams", subjects: ["Full Exam", "Quantitative Aptitude", "General Intelligence", "English", "General Awareness"] },
  { id: "IBPS PO", name: "Banking (IBPS/SBI PO Prelims)", description: "Bank PO/Clerk prelims pattern", subjects: ["Full Exam", "English Language", "Quantitative Aptitude", "Reasoning Ability"] },
  { id: "CAT", name: "CAT", description: "Common Admission Test for MBA", subjects: ["Full Exam", "Verbal Ability & Reading Comprehension", "Data Interpretation & Logical Reasoning", "Quantitative Aptitude"] },
  { id: "CA Foundation", name: "CA Foundation (MCQ Papers)", description: "Business Economics & Quantitative Aptitude", subjects: ["Full Exam", "Business Economics", "Quantitative Aptitude"] },
  { id: "CBSE Class 12", name: "CBSE Class 12", description: "Board exam pattern (pick a subject below)", subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "English"] },
  { id: "CBSE Class 10", name: "CBSE Class 10", description: "Board exam pattern (pick a subject below)", subjects: ["Science", "Mathematics", "Social Science", "English"] },
  { id: "__custom__", name: "Other Exam (type below)", description: "Any exam — GATE, Railway RRB, State PSC, Police, Teaching (CTET/TET), a specific ICSE/state-board subject, etc.", subjects: ["Full Exam"] },
];

const LANGUAGES = [
  { id: "english", name: "English" },
  { id: "hindi", name: "Hindi (हिंदी)" },
  { id: "hinglish", name: "Hinglish" }
];

const DIFFICULTIES = ["Beginner", "Medium", "Experienced", "Hard"];
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

export default function ExamSimulatorPage() {
  const { toggleSidebar } = useAuth();

  // Configuration State
  const [selectedExam, setSelectedExam] = useState("IIT JEE");
  const [customExamName, setCustomExamName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Full Exam");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [sourceType, setSourceType] = useState("pyq"); // pyq or ai
  const [selectedYear, setSelectedYear] = useState(2023);
  const [examMode, setExamMode] = useState("quick"); // quick or official

  // Full Exam Simulator Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isResolvingBlueprint, setIsResolvingBlueprint] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const handleStartExam = async () => {
    const effectiveExamName = selectedExam === "__custom__" ? customExamName.trim() : selectedExam;
    if (!effectiveExamName) {
      setResolveError("Enter an exam name first.");
      return;
    }

    setResolveError(null);
    setIsResolvingBlueprint(true);
    try {
      // Real blueprint (duration/marking/sections) resolved server-side —
      // examBlueprintService.js's hardcoded fast-path for well-known exams,
      // or an LLM-generated realistic pattern for anything else (any board/
      // class/subject, GATE, Railway, a state PSC, ...). This replaces the
      // old client-hardcoded nested-ternary guesses that only recognized 5
      // exam names and silently gave every other exam an arbitrary, likely
      // wrong duration/section/marking scheme.
      const res = await axiosInstance.get("/assessment/blueprint", { params: { examName: effectiveExamName } });
      const resolvedBlueprint = res.data?.blueprint;
      if (!resolvedBlueprint || !Array.isArray(resolvedBlueprint.sections) || resolvedBlueprint.sections.length === 0) {
        throw new Error("Blueprint resolver returned no sections");
      }

      const quickQuestionsPerSection = 5;

      let distribution: Record<string, number> = {};
      if (selectedSubject === "Full Exam") {
        for (const sec of resolvedBlueprint.sections) {
          distribution[sec.name] = examMode === "official" ? sec.questionCount : Math.min(quickQuestionsPerSection, sec.questionCount);
        }
      } else {
        // A specific subject was picked — use just that section's real
        // question count if the resolved blueprint has a matching section
        // name, else fall back to a flat 10/30 (e.g. this page's preset
        // subject list didn't exactly match the resolver's section naming).
        const matchedSection = resolvedBlueprint.sections.find(
          (s: { name: string; questionCount: number }) => s.name.toLowerCase() === selectedSubject.toLowerCase()
        );
        const fallbackCount = examMode === "official" ? 30 : 10;
        distribution = { [selectedSubject]: matchedSection ? (examMode === "official" ? matchedSection.questionCount : Math.min(quickQuestionsPerSection, matchedSection.questionCount)) : fallbackCount };
      }

      const totalQuestions = Object.values(distribution).reduce((sum, n) => sum + n, 0);
      const duration = examMode === "official" ? resolvedBlueprint.durationMinutes : 10;

      const blueprintObj = {
        exam: effectiveExamName,
        questions: totalQuestions,
        durationMinutes: duration,
        difficulty: { easy: 0, medium: totalQuestions, hard: 0 },
        distribution,
        markingScheme: resolvedBlueprint.markingScheme,
        // Custom attributes read by interceptor
        year: selectedYear,
        language: selectedLanguage,
        sourceType: sourceType,
        mode: examMode,
        targetTopic: selectedSubject
      };

      setBlueprint(blueprintObj);
      setIsOpen(true);
    } catch (err) {
      console.error("[ExamSimulatorPage] Failed to resolve exam blueprint:", err);
      setResolveError("Couldn't resolve this exam's pattern right now. Please try again.");
    } finally {
      setIsResolvingBlueprint(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header — Sidebar is hidden by default (off-screen) on mobile and
            only opens via a per-page toggle button; this page previously had
            none, so a mobile user landing here had no way to navigate back
            to chat or anywhere else in the app. */}
        <header className="h-14 border-b border-border/60 flex items-center justify-between px-3 md:px-6 shrink-0 bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleSidebar}
              className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors active:scale-95"
              title="Toggle Sidebar"
            >
              <Menu className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </button>
            <GraduationCap className="w-5 h-5 text-primary" />
            <h1 className="text-[15px] font-semibold tracking-tight">Real Exam Simulator</h1>
          </div>
        </header>

        {/* Configuration Setup Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight">Configure Official Mock Exams</h2>
              <p className="text-[13px] text-muted-foreground font-medium">Train under official exam blueprints, durations, sections, and negative marking rules.</p>
            </div>

            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExamMode("quick")}
                className={`border rounded-xl p-4 text-left transition-all relative ${examMode === "quick" ? "border-primary bg-primary/5 text-primary shadow-xs" : "border-border hover:border-gray-300 bg-background text-muted-foreground hover:text-foreground"}`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-[13px] font-bold">Quick Practice Mode</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Shortened questions practice set for quick revision (10 min timer).</p>
                {examMode === "quick" && <Check className="absolute top-4 right-4 w-4 h-4 text-primary" />}
              </button>

              <button
                onClick={() => setExamMode("official")}
                className={`border rounded-xl p-4 text-left transition-all relative ${examMode === "official" ? "border-primary bg-primary/5 text-primary shadow-xs" : "border-border hover:border-gray-300 bg-background text-muted-foreground hover:text-foreground"}`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span className="text-[13px] font-bold">Official Exam Mode</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Full question count, official section breakdown, negative marking, and real duration.</p>
                {examMode === "official" && <Check className="absolute top-4 right-4 w-4 h-4 text-primary" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left card: Exam & Subject */}
              <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Target Exam</label>
                  <select 
                    value={selectedExam}
                    onChange={(e) => {
                      setSelectedExam(e.target.value);
                      const match = EXAMS.find(ex => ex.id === e.target.value);
                      if (match) setSelectedSubject(match.subjects[0]);
                    }}
                    className="w-full bg-background border border-border rounded-lg p-2.5 outline-none text-[13px] text-foreground focus:border-primary"
                  >
                    {EXAMS.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                {selectedExam === "__custom__" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Exam Name</label>
                    <input
                      type="text"
                      value={customExamName}
                      onChange={(e) => setCustomExamName(e.target.value)}
                      placeholder="e.g. GATE Computer Science, Railway RRB NTPC, ICSE Class 9 Physics"
                      className="w-full bg-background border border-border rounded-lg p-2.5 outline-none text-[13px] text-foreground focus:border-primary"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Subject / Topic</label>
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2.5 outline-none text-[13px] text-foreground focus:border-primary"
                  >
                    {EXAMS.find(ex => ex.id === selectedExam)?.subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right card: Difficulty & Language */}
              <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Difficulty level</label>
                  <div className="grid grid-cols-4 gap-1 bg-muted p-0.5 rounded-lg">
                    {DIFFICULTIES.map(diff => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`text-[11px] font-medium py-1.5 rounded-md transition-colors ${selectedDifficulty === diff ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Preferred Language</label>
                  <div className="flex gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`flex-1 border text-[12px] font-medium py-2 rounded-lg transition-all ${selectedLanguage === lang.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-gray-300 bg-background text-muted-foreground hover:text-foreground"}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Source Type selection */}
            <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paper Source Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSourceType("pyq")}
                    className={`flex-1 border rounded-xl p-4 text-left transition-all relative ${sourceType === "pyq" ? "border-primary bg-primary/5 text-primary shadow-xs" : "border-border hover:border-gray-300 bg-background text-muted-foreground hover:text-foreground"}`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-[13px] font-bold">Previous Years' Papers (PYQ)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 font-medium">Real historical questions scraped dynamically from academic servers.</p>
                    {sourceType === "pyq" && <Check className="absolute top-4 right-4 w-4 h-4 text-primary" />}
                  </button>

                  <button
                    onClick={() => setSourceType("ai")}
                    className={`flex-1 border rounded-xl p-4 text-left transition-all relative ${sourceType === "ai" ? "border-primary bg-primary/5 text-primary shadow-xs" : "border-border hover:border-gray-300 bg-background text-muted-foreground hover:text-foreground"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[13px] font-bold">AI Sample Paper (Fresh Generate)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 font-medium">Brand new sample questions generated adaptively to your target level.</p>
                    {sourceType === "ai" && <Check className="absolute top-4 right-4 w-4 h-4 text-primary" />}
                  </button>
                </div>
              </div>

              {sourceType === "pyq" && (
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select PYQ Exam Year</label>
                  <div className="flex gap-2">
                    {YEARS.map(yr => (
                      <button
                        key={yr}
                        onClick={() => setSelectedYear(yr)}
                        className={`w-12 py-2 rounded-lg border text-[12px] font-semibold transition-all ${selectedYear === yr ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-gray-300 bg-background text-muted-foreground"}`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Start CTA */}
            <div className="flex flex-col items-end gap-2">
              {resolveError && (
                <p className="text-[12px] font-semibold text-red-600">{resolveError}</p>
              )}
              <button
                onClick={handleStartExam}
                disabled={isResolvingBlueprint}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isResolvingBlueprint ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resolving exam pattern...</span>
                  </>
                ) : (
                  <>
                    <span>Generate & Start Exam</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Render the premium Full Exam Simulator overlay when open */}
      {isOpen && blueprint && typeof window !== "undefined" && createPortal(
        <FullExamSimulator 
          blueprint={blueprint} 
          onClose={() => setIsOpen(false)} 
        />,
        document.body
      )}
    </div>
  );
}
