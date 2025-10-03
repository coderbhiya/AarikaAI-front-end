import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ChatInput from "@/components/ChatInput";
import axiosInstance from "@/lib/axios";
import Markdown from "@/components/common/Markdown";
import { toast } from "@/components/ui/sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
}

const SkillScore: React.FC = () => {
  const { skillId } = useParams();
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
          message: `We'll assess your ${sName}. I will ask you 10 concise questions. Answer honestly based on your experience. Ready?`,
        },
        {
          id: "q1",
          role: "assistant",
          message: qs[0] || "Tell me about your recent experience using this skill.",
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skillId) {
      loadQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const answerIndex = currentIndex;

    // Append user message
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
      const nextQ = questions[nextIndex] || "Thanks. Next, share a specific challenge and how you solved it.";
      const aiMsg: Message = { id: `q-${nextIndex + 1}`, role: "assistant", message: nextQ };
      setMessages((prev) => [...prev, aiMsg]);
    } else {
      // All answers collected; evaluate
      setIsLoading(true);
      try {
        const res = await axiosInstance.post(`/skill-score/${skillId}/score`, { answers: updatedAnswers.length ? updatedAnswers : answers });
        const { score, feedback } = res.data || {};
        const aiMsg: Message = {
          id: "score",
          role: "assistant",
          message: `Your ${skillName} score is ${typeof score === "number" ? score : "--"}/100.\n\nFeedback: ${feedback || "No feedback available."}`,
        };
        setMessages((prev) => [...prev, aiMsg]);
        toast.success("Skill score updated");
      } catch (error) {
        console.error(error);
        toast.error("Failed to evaluate skill");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-8 w-full max-w-4xl mx-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 w-[80%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
            >
              <div className="text-white">
                {m.message.split("\n\n").map((paragraph, idx) => (
                  <p key={idx} className="mb-4">
                    <Markdown text={paragraph} />
                  </p>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="text-white animate-pulse">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 border-t border-white/10">
        {/* ChatInput expects (message: string, files?: File[]) */}
        <ChatInput onSendMessage={(msg) => handleSendMessage(msg)} isLoading={isLoading} fileInputShow={false} />
      </div>
    </div>
  );
};

export default SkillScore;
