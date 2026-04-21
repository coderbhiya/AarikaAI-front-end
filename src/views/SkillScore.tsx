"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ChatInput from "@/components/ChatInput";
import axiosInstance from "@/lib/axios";
import Markdown from "@/components/common/Markdown";
import { toast } from "sonner";
import {
  Brain,
  ArrowLeft,
  Loader2,
  Menu,
  User,
  Share2,
  Download,
  RefreshCcw,
  Trophy,
  Target,
  Shield,
  BadgeCheck,
  TrendingUp,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import BrainLogo from "@/components/BrainLogo";

interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
}

const SkillScore: React.FC = () => {
  const { user, toggleSidebar } = useAuth();
  const searchParams = useSearchParams();
  const skillId = searchParams.get("skillId");
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const [skillName, setSkillName] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(""));
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isAssessmentStarted, setIsAssessmentStarted] = useState<boolean>(false);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef<boolean>(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/skill-score/${skillId}/questions`);
      const qs: string[] = res.data?.questions || [];
      const sName = res.data?.skill?.name || "Technical Domain";
      setSkillName(sName);
      setQuestions(qs);
      setAnswers(Array(10).fill(""));
      setCurrentIndex(0);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          message: `### Welcome to the ${sName} Assessment\n\nI will guide you through a 10-question deep-dive to evaluate your proficiency. Please be as detailed as possible in your responses.`,
        },
        {
          id: "q1",
          role: "assistant",
          message: qs[0] || "Could you provide an overview of your experience in this field?",
        },
      ]);
      setTimeLeft(30);
      setIsAssessmentStarted(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assessment questions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skillId) loadQuestions();
  }, [skillId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAssessmentStarted && !isLoading && currentIndex < 10) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAssessmentStarted, isLoading, currentIndex]);

  useEffect(() => {
    if (timeLeft === 0 && isAssessmentStarted && !isLoading && !isTransitioning.current && currentIndex < 10) {
      handleSendMessage("Time limit exceeded. Moving to next question.");
    }
  }, [timeLeft]);

  const handleSendMessage = async (text: string) => {
    if ((!text.trim() && text !== "") || isLoading || isTransitioning.current) return;
    
    isTransitioning.current = true;
    const answerIndex = currentIndex;

    // Clear any pending AI question timeout to prevent duplication
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }

    const userMsg: Message = { id: `a-${Date.now()}`, role: "user", message: text || "Timed out" };
    setMessages((prev) => [...prev, userMsg]);

    const updatedAnswers = [...answers];
    updatedAnswers[answerIndex] = text || "Timed out";
    setAnswers(updatedAnswers);

    const nextIndex = answerIndex + 1;
    setCurrentIndex(nextIndex);

    if (nextIndex < 10) {
      const nextQ = questions[nextIndex] || "Acknowledged. Next question...";
      const aiMsg: Message = { id: `q-${nextIndex + 1}`, role: "assistant", message: nextQ };
      
      aiTimeoutRef.current = setTimeout(() => {
        setMessages((prev) => [...prev, aiMsg]);
        setTimeLeft(30);
        isTransitioning.current = false;
        aiTimeoutRef.current = null;
      }, 800);
    } else {
      setIsLoading(true);
      try {
        const res = await axiosInstance.post(`/skill-score/${skillId}/score`, {
          answers: updatedAnswers
        });
        const { score, feedback } = res.data || {};

        const aiMsg: Message = {
          id: "score",
          role: "assistant",
          message: `## Assessment Complete\n\n**Your Proficiency Index:** \`${score || "--"}/100\`\n\n**Strategic Feedback:**\n${feedback || "Analysis complete. You can view your detailed report in your profile."}`,
        };
        
        aiTimeoutRef.current = setTimeout(() => {
          setMessages((prev) => [...prev, aiMsg]);
          setResult({ score: score || 0, feedback: feedback || "" });
          toast.success("Skill synchronization complete.");
          setIsLoading(false);
          isTransitioning.current = false;
          aiTimeoutRef.current = null;
          setTimeLeft(0);
        }, 1000);
      } catch (error) {
        console.error(error);
        toast.error("Failed to calculate assessment score.");
        setIsLoading(false);
        isTransitioning.current = false;
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#F8F9FA] relative">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-100/50 w-full animate-in fade-in slide-in-from-top duration-500">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 md:p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors active:scale-95"
          >
            <Menu size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold text-[#444746] tracking-tight">Skill Assessment</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentIndex < 10 && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              timeLeft < 10 ? "bg-red-50 border-red-100 text-red-600 animate-pulse" : "bg-emerald-50 border-emerald-100 text-emerald-600"
            } transition-colors`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="text-[12px] font-bold tabular-nums">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center w-32">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                <span className="text-[10px] font-bold text-primary">{Math.round((currentIndex / 10) * 100)}%</span>
              </div>
              <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(currentIndex / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
             {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={16} />
              )}
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      {!result ? (
        <main className="flex-1 overflow-y-auto scrollbar-none relative z-10 px-4 md:px-8 pt-6 pb-32">
          <div className="max-w-4xl mx-auto space-y-8 text-wrap break-words">
            {messages.map((m, idx) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`flex items-center gap-2.5 mb-2 px-1 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-sm overflow-hidden ${
                    m.role === "user" ? "bg-white border-gray-100" : "bg-primary/5 border-primary/10"
                  }`}>
                    {m.role === "user" ? (
                      user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-primary">{user?.displayName?.[0] || user?.email?.[0] || "U"}</span>
                    ) : (
                      <BrainLogo size={18} />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                    {m.role === "user" ? "Identity" : "AarikaAI Analyst"}
                  </span>
                </div>

                <div className={`message-bubble-${m.role === "user" ? "user" : "ai"} transition-all duration-300 max-w-full overflow-hidden break-words w-auto`}>
                  <Markdown text={m.message} />
                </div>
              </div>
            ))}

            {isLoading && currentIndex < 10 && (
              <div className="flex justify-start my-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                    <BrainLogo size={16} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            {isLoading && currentIndex >= 10 && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in zoom-in-95 duration-700">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[14px] font-medium text-gray-400 animate-pulse tracking-tight">Synthesizing Assessment Data...</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>
      ) : (
        <main className="flex-1 overflow-y-auto scrollbar-none relative z-10 px-4 md:px-8 pt-8 pb-16 animate-in fade-in zoom-in-95 duration-700">
          <div className="max-w-3xl mx-auto">
            {/* Scorecard Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-4">
                <Trophy size={12} />
                Strategic Proficiency Report
              </div>
              <h2 className="text-3xl font-bold text-[#202124] tracking-tight mb-2">Assessment Results</h2>
              <p className="text-gray-500 text-sm">Targeted insights based on your technical performance.</p>
            </div>

            {/* Score Gauge Section */}
            <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden mb-8">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <BrainLogo size={200} />
               </div>

               <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                  <div className="relative flex items-center justify-center w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96" cy="96" r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-gray-100"
                      />
                      <circle
                        cx="96" cy="96" r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={552.92}
                        strokeDashoffset={552.92 - (552.92 * result.score) / 100}
                        strokeLinecap="round"
                        className="text-primary transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-bold tracking-tighter text-primary">{result.score}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Index</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                           <Shield className="text-primary" size={16} />
                           <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Strategic Level</h4>
                        </div>
                        <p className="text-2xl font-bold text-[#202124]">
                           {result.score >= 80 ? "Strategic Innovator" : result.score >= 60 ? "Professional Expert" : result.score >= 40 ? "Proficient Specialist" : "Adaptive Talent"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                          <div className="flex items-center gap-1.5 mb-1 text-primary">
                             <Target size={14} />
                             <span className="text-[10px] font-bold uppercase">Accuracy</span>
                          </div>
                          <span className="text-lg font-bold">92%</span>
                       </div>
                       <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                          <div className="flex items-center gap-1.5 mb-1 text-primary">
                             <TrendingUp size={14} />
                             <span className="text-[10px] font-bold uppercase">Growth</span>
                          </div>
                          <span className="text-lg font-bold">High</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Detailed Feedback Card */}
            <div className="bg-[#F8F9FA] rounded-[32px] p-8 border border-white shadow-sm mb-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                     <Brain size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-[#202124]">Analytical Insights</h3>
               </div>
               
               <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-4">
                  <Markdown text={result.feedback} />
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
               <button className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95" onClick={() => toast.info("Report generation initiated...")}>
                  <Download size={18} />
                  Download Complete Report
               </button>
               <button className="flex-1 py-4 rounded-2xl bg-white border border-gray-200 text-[#202124] font-bold text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 active:scale-95" onClick={() => window.location.reload()}>
                  <RefreshCcw size={18} />
                  Retake Assessment
               </button>
               <button className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all active:scale-95">
                  <Share2 size={20} />
               </button>
            </div>
            
            <p className="text-center mt-12 text-[11px] text-gray-400 font-medium">
               AarikaAI Strategic Intel • Ref ID: {Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </main>
      )}

      {/* Input Field */}
      {currentIndex < 10 && !result && (
        <footer className="absolute bottom-0 left-0 right-0 z-30 px-3 md:px-6 pb-6 pt-2 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              fileInputShow={false}
              disablePaste={true}
            />
          </div>
        </footer>
      )}
    </div>
  );
};

export default SkillScore;
