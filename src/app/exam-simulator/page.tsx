"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Sidebar from "@/components/Sidebar";
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  Check, 
  FileText, 
  Zap, 
  Layers
} from "lucide-react";
import FullExamSimulator from "@/components/chat/cards/FullExamSimulator";

const EXAMS = [
  { id: "IIT JEE", name: "IIT JEE", description: "Joint Entrance Examination for Engineering", subjects: ["Full Exam", "Physics", "Chemistry", "Mathematics"] },
  { id: "NEET", name: "NEET", description: "National Eligibility cum Entrance Test for Medical", subjects: ["Full Exam", "Physics", "Chemistry", "Biology"] },
  { id: "UPSC", name: "UPSC Civil Services", description: "Union Public Service Commission Exams", subjects: ["Full Exam", "General Studies", "History", "Polity", "Geography"] },
  { id: "CBSE 12", name: "CBSE Class 12", description: "Board Examination Sample Papers", subjects: ["Full Exam", "Physics", "Chemistry", "Mathematics", "Biology"] },
  { id: "SSC CGL", name: "SSC CGL", description: "Staff Selection Commission exams", subjects: ["Full Exam", "Quantitative Aptitude", "General Intelligence", "English"] }
];

const LANGUAGES = [
  { id: "english", name: "English" },
  { id: "hindi", name: "Hindi (हिंदी)" },
  { id: "hinglish", name: "Hinglish" }
];

const DIFFICULTIES = ["Beginner", "Medium", "Experienced", "Hard"];
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

export default function ExamSimulatorPage() {
  // Configuration State
  const [selectedExam, setSelectedExam] = useState("IIT JEE");
  const [selectedSubject, setSelectedSubject] = useState("Full Exam");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [sourceType, setSourceType] = useState("pyq"); // pyq or ai
  const [selectedYear, setSelectedYear] = useState(2023);
  const [examMode, setExamMode] = useState("quick"); // quick or official

  // Full Exam Simulator Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);

  const handleStartExam = () => {
    const totalQuestions = examMode === "official"
      ? (selectedExam === "IIT JEE" ? 90 : selectedExam === "NEET" ? 200 : selectedExam === "UPSC" ? 100 : selectedExam === "SSC CGL" ? 100 : 30)
      : (selectedSubject === "Full Exam" ? (selectedExam === "IIT JEE" ? 15 : selectedExam === "NEET" ? 15 : selectedExam === "SSC CGL" ? 20 : 15) : 10);

    const duration = examMode === "official"
      ? (selectedExam === "IIT JEE" ? 180 : selectedExam === "NEET" ? 200 : selectedExam === "UPSC" ? 120 : selectedExam === "SSC CGL" ? 60 : 180)
      : 10;

    // Distribution map based on subjects selected
    let distribution: Record<string, number> = {};
    if (selectedSubject === "Full Exam") {
      if (selectedExam === "IIT JEE") {
        const qPerSub = examMode === "official" ? 30 : 5;
        distribution = { Physics: qPerSub, Chemistry: qPerSub, Mathematics: qPerSub };
      } else if (selectedExam === "NEET") {
        const qPerSub = examMode === "official" ? 50 : 5;
        distribution = { Physics: qPerSub, Chemistry: qPerSub, Biology: examMode === "official" ? 100 : 5 };
      } else if (selectedExam === "SSC CGL") {
        const qPerSub = examMode === "official" ? 25 : 5;
        distribution = { "Quantitative Aptitude": qPerSub, "General Intelligence": qPerSub, English: qPerSub, "General Awareness": qPerSub };
      } else {
        distribution = { "General Studies": examMode === "official" ? 40 : 5, History: examMode === "official" ? 30 : 5, Polity: examMode === "official" ? 30 : 5 };
      }
    } else {
      distribution = { [selectedSubject]: totalQuestions };
    }

    const blueprintObj = {
      exam: selectedExam,
      questions: totalQuestions,
      durationMinutes: duration,
      difficulty: { easy: 0, medium: totalQuestions, hard: 0 },
      distribution,
      // Custom attributes read by interceptor
      year: selectedYear,
      language: selectedLanguage,
      sourceType: sourceType,
      mode: examMode,
      targetTopic: selectedSubject
    };

    setBlueprint(blueprintObj);
    setIsOpen(true);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-14 border-b border-border/60 flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
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
            <div className="flex justify-end">
              <button
                onClick={handleStartExam}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Generate & Start Exam</span>
                <ArrowRight className="w-4 h-4" />
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
