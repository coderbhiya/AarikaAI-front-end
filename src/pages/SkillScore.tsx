import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatInput from "@/components/ChatInput";
import axiosInstance from "@/lib/axios";
import Markdown from "@/components/common/Markdown";
import { toast } from "@/components/ui/sonner";
import {
  Target,
  Brain,
  Cpu,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Trophy,
  Activity,
  Zap,
  CheckCircle2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
}

const SkillScore: React.FC = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [skillName, setSkillName] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/skill-score/${skillId}/questions`);
      const qs: string[] = res.data?.questions || [];
      const sName = res.data?.skill?.name || "Skill";
      setSkillName(sName);
      setQuestions(qs);
      setAnswers(Array(10).fill(""));
      setCurrentIndex(0);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          message: `### Neural Skill Assessment: ${sName}\n\nI will initiate a 10-point diagnostic evaluation of your capabilities. Please provide detailed, objective technical responses to ensure accurate profiling.\n\nInitializing core protocols. **System ready.**`,
        },
        {
          id: "q1",
          role: "assistant",
          message: qs[0] || "Specify your primary area of specialization within this technical domain.",
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Packet loss detected during question retrieval.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skillId) {
      loadQuestions();
    }
  }, [skillId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const answerIndex = currentIndex;

    const userMsg: Message = { id: `a-${Date.now()}`, role: "user", message: text };
    setMessages((prev) => [...prev, userMsg]);

    let updatedAnswers: string[] = [];
    setAnswers((prev) => {
      const next = [...prev];
      next[answerIndex] = text;
      updatedAnswers = next;
      return next;
    });

    const nextIndex = answerIndex + 1;
    setCurrentIndex(nextIndex);

    if (nextIndex < 10) {
      const nextQ = questions[nextIndex] || "Log acknowledged. Moving to next probe.";
      const aiMsg: Message = { id: `q-${nextIndex + 1}`, role: "assistant", message: nextQ };
      setMessages((prev) => [...prev, aiMsg]);
    } else {
      setIsLoading(true);
      try {
        const res = await axiosInstance.post(`/skill-score/${skillId}/score`, {
          answers: updatedAnswers.length ? updatedAnswers : answers
        });
        const { score, feedback } = res.data || {};

        const aiMsg: Message = {
          id: "score",
          role: "assistant",
          message: `## Diagnostic Complete\n\n**Calculated Proficiency Index:** \`${typeof score === "number" ? score : "--"}/100\`\n\n**Neural Feedback:**\n${feedback || "No performance data available."}`,
        };
        setMessages((prev) => [...prev, aiMsg]);
        toast.success("Skill profile synchronization successful.");
      } catch (error) {
        console.error(error);
        toast.error("Assessment evaluation process failure.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-8 py-4 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Brain size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">{skillName} Diagnostic</h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Probe</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentIndex < 10 ? (
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] px-4 py-1.5 rounded-full">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Progress</div>
              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 translate-x-3 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  style={{ width: `${(currentIndex / 10) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{currentIndex}/10</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 size={12} /> Sync Complete
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden pt-12 pb-24 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {messages.map((m, idx) => (
            <div
              key={m.id}
              className={`flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 ${m.role === "user" ? "items-end" : "items-start"}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`flex items-center gap-3 mb-2 px-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${m.role === "user" ? "bg-white/5 border-white/10 text-gray-400" : "bg-primary/20 border-primary/30 text-primary"
                  }`}>
                  {m.role === "user" ? <Activity size={14} /> : <Cpu size={14} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                  {m.role === "user" ? "Entity" : "Career AI Core"}
                </span>
              </div>

              <div className={`
                relative overflow-hidden
                p-6 rounded-[2rem] 
                ${m.role === "user"
                  ? "bg-white/[0.03] border border-white/10 text-white rounded-tr-none min-w-[200px] max-w-[80%]"
                  : "bg-primary/5 border border-primary/20 text-white rounded-tl-none max-w-[85%] shadow-lg shadow-primary/5"
                }
              `}>
                <div className="relative z-10 font-medium leading-relaxed">
                  <Markdown text={m.message} />
                </div>
                {m.role === "assistant" && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-4 py-4 animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <Loader2 size={14} className="animate-spin" />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] animate-pulse">Running Diagnostic Computations...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Overlay */}
      {currentIndex < 10 && (
        <div className="relative z-20 p-8 pt-0 mt-auto">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative">
              <ChatInput
                onSendMessage={(msg) => handleSendMessage(msg)}
                isLoading={isLoading}
                fileInputShow={false}
              />
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">Neural Assessment Engine • Phase 1 Core v8.5</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillScore;
