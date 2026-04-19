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
  const { toggleSidebar } = useAuth();
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
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-100/50 w-full">
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
          <div className="hidden sm:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${(currentIndex / 10) * 100}%` }}
              />
            </div>
            <span className="text-[12px] font-medium text-[#202124]">{currentIndex}/10</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
            <User size={16} />
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-10 scrollbar-none">
        <div className="max-w-4xl mx-auto space-y-12 pb-32">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`flex items-center gap-3 mb-2 px-1 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                {!m.role.includes("assistant") ? (
                  <div className="w-6 h-6 rounded-full bg-gray-200" />
                ) : (
                  <BrainLogo size={16} />
                )}
                <span className="text-[11px] font-medium text-gray-400">
                  {m.role === "user" ? "You" : "CareerAI"}
                </span>
              </div>

              <div className={`message-bubble-${m.role === "user" ? "user" : "ai"} p-4 rounded-2xl bg-white shadow-sm border border-gray-100`}>
                <Markdown text={m.message} />
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-4 animate-pulse">
              <Loader2 size={18} className="text-primary animate-spin" />
              <p className="text-[13px] text-gray-400">Analyzing your response...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Field */}
      {currentIndex < 10 && (
        <div className="fixed bottom-8 left-0 right-0 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="p-2 shadow-2xl bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                fileInputShow={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillScore;
