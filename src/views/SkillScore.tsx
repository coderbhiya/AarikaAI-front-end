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
  User
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const answerIndex = currentIndex;

    const userMsg: Message = { id: `a-${Date.now()}`, role: "user", message: text };
    setMessages((prev) => [...prev, userMsg]);

    const updatedAnswers = [...answers];
    updatedAnswers[answerIndex] = text;
    setAnswers(updatedAnswers);

    const nextIndex = answerIndex + 1;
    setCurrentIndex(nextIndex);

    if (nextIndex < 10) {
      const nextQ = questions[nextIndex] || "Acknowledged. Next question...";
      const aiMsg: Message = { id: `q-${nextIndex + 1}`, role: "assistant", message: nextQ };
      setTimeout(() => setMessages((prev) => [...prev, aiMsg]), 600);
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
        setTimeout(() => {
          setMessages((prev) => [...prev, aiMsg]);
          toast.success("Skill synchronization complete.");
        }, 1000);
      } catch (error) {
        console.error(error);
        toast.error("Failed to calculate assessment score.");
      } finally {
        setIsLoading(false);
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
      <main className="flex-1 overflow-y-auto scrollbar-none relative z-10 px-4 md:px-8 pt-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
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

              <div className={`message-bubble-${m.role === "user" ? "user" : "ai"} transition-all duration-300`}>
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

      {/* Input Field */}
      {currentIndex < 10 && (
        <footer className="absolute bottom-0 left-0 right-0 z-30 px-3 md:px-6 pb-6 pt-2 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              fileInputShow={false}
            />
          </div>
        </footer>
      )}
    </div>
  );
};

export default SkillScore;
