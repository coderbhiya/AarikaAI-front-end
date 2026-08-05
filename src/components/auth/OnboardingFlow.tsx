"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  Sparkles, 
  User, 
  Briefcase, 
  Search, 
  Compass, 
  ArrowRight,
  GraduationCap,
  Target,
  MessageSquare,
  BookOpen,
  TrendingUp,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, syncProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State - 3 Micro Questions
  const [currentStatus, setCurrentStatus] = useState("student");
  const [primaryGoal, setPrimaryGoal] = useState("get_job");
  const [communicationStyle, setCommunicationStyle] = useState("Friendly & Casual (Hinglish)");

  const handleFinish = async () => {
    if (!currentStatus || !primaryGoal || !communicationStyle) {
      toast.error("Please select all 3 options to customize your experience.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/profile/onboarding", {
        currentStatus,
        primaryGoal,
        communicationStyle,
      });

      if (response.data.success) {
        toast.success("Profile personalized successfully!");
        await syncProfile();
        onComplete();
        router.push("/chat");
      } else {
        toast.error(response.data.message || "Failed to save preferences.");
      }
    } catch (error: any) {
      console.error("Error saving onboarding preferences:", error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { 
      id: "student", 
      label: "Student", 
      desc: "School / College / Higher Ed",
      icon: <GraduationCap className="w-5 h-5 text-blue-600" /> 
    },
    { 
      id: "professional", 
      label: "Working Professional", 
      desc: "Already working in industry",
      icon: <Briefcase className="w-5 h-5 text-emerald-600" /> 
    },
    { 
      id: "job_seeker", 
      label: "Job Seeker", 
      desc: "Looking for job opportunities",
      icon: <Search className="w-5 h-5 text-amber-600" /> 
    },
    { 
      id: "other", 
      label: "Career Switcher", 
      desc: "Exploring a new career domain",
      icon: <Compass className="w-5 h-5 text-purple-600" /> 
    },
  ];

  const goalOptions = [
    { id: "get_job", label: "Get a Job", desc: "Find opportunities & crack interviews", icon: <Briefcase className="w-4 h-4 text-blue-600" /> },
    { id: "upskill", label: "Upskill & Grow", desc: "Learn new skills & technologies", icon: <TrendingUp className="w-4 h-4 text-emerald-600" /> },
    { id: "exam_prep", label: "Prepare for Exams", desc: "Crack competitive or academic exams", icon: <BookOpen className="w-4 h-4 text-amber-600" /> },
    { id: "switch_career", label: "Career Transition", desc: "Switch into a completely new field", icon: <Compass className="w-4 h-4 text-purple-600" /> },
    { id: "build_profile", label: "Build Personal Brand", desc: "Optimize resume, LinkedIn & portfolio", icon: <FileText className="w-4 h-4 text-rose-600" /> },
    { id: "explore", label: "Explore Options", desc: "Not sure yet, want AI guidance", icon: <Sparkles className="w-4 h-4 text-indigo-600" /> },
  ];

  const toneOptions = [
    {
      id: "Friendly & Casual (Hinglish)",
      title: "Friendly & Casual (Hinglish)",
      desc: "Conversational Hinglish & casual tone like a mentor friend",
      badge: "Popular in India 🇮🇳"
    },
    {
      id: "Professional & Formal",
      title: "Professional & Formal",
      desc: "Crisp, structured, and formal English for professional guidance",
      badge: "Standard Professional"
    }
  ];

  const userName = user?.displayName || user?.name || "there";

  return (
    <div className="w-screen h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col fixed inset-0 z-50 select-none">
      
      {/* HEADER */}
      <header className="h-[60px] flex items-center justify-between px-6 lg:px-12 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            A
          </div>
          <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
            Aarika<span className="text-blue-600">.AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>15-Second Personalization</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        <div className="space-y-6">
          
          {/* TITLE BANNER */}
          <div className="text-center max-w-xl mx-auto pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome, {userName}! 👋
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 font-medium">
              Help AarikaAI understand your goal & preferred tone to give you instant, personalized career guidance.
            </p>
          </div>

          {/* QUESTION 1: STATUS */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">What is your current status?</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statusOptions.map((opt) => {
                const isSelected = currentStatus === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setCurrentStatus(opt.id)}
                    className={cn(
                      "cursor-pointer relative p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between",
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                    <div className="mb-2">{opt.icon}</div>
                    <div>
                      <h3 className={cn("text-xs font-bold", isSelected ? "text-blue-900 dark:text-blue-300" : "text-slate-800 dark:text-slate-200")}>
                        {opt.label}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUESTION 2: PRIMARY GOAL */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">What is your primary goal right now?</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {goalOptions.map((opt) => {
                const isSelected = primaryGoal === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPrimaryGoal(opt.id)}
                    className={cn(
                      "cursor-pointer relative p-3 rounded-xl border-2 transition-all flex items-start gap-3",
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className={cn("text-xs font-bold truncate", isSelected ? "text-blue-900 dark:text-blue-300" : "text-slate-800 dark:text-slate-200")}>
                        {opt.label}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 absolute top-3 right-3" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUESTION 3: COMMUNICATION TONE */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">3</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">How should AarikaAI talk to you?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {toneOptions.map((opt) => {
                const isSelected = communicationStyle === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setCommunicationStyle(opt.id)}
                    className={cn(
                      "cursor-pointer relative p-3.5 rounded-xl border-2 transition-all flex items-start gap-3",
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={cn("text-xs font-bold", isSelected ? "text-blue-900 dark:text-blue-300" : "text-slate-800 dark:text-slate-200")}>
                          {opt.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {opt.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BUTTON */}
        <div className="pt-6 pb-2 border-t border-slate-200/60 dark:border-slate-800 mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Takes &lt; 15 seconds</span>
          </div>
          <Button
            onClick={handleFinish}
            disabled={loading}
            className="h-11 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Start Chat <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
