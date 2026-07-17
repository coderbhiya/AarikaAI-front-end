"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getChats, sendChatMessage, uploadFile, getWelcomeMessage, truncateChat } from "@/services/chatService";
import MessageList from "../chat/MessageList";
import BrainLogo from "../BrainLogo";
import { Message, FileAttachment } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Paperclip, X, Globe, Send, HelpCircle, FileText, Code, Lightbulb, Compass, ArrowRight } from "lucide-react";

interface WorkspaceChatAreaProps {
  embeddedContext?: string;
  courseId: string;
  activeVideoId?: string;
}

const WorkspaceChatArea: React.FC<WorkspaceChatAreaProps> = ({ embeddedContext, courseId, activeVideoId }) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [webSearchActive, setWebSearchActive] = useState(false);
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState<string | null>(null);

  const threadId = `course_${courseId}`;

  // Local query parameters listener (MCQ quiz or shortcuts)
  const hasHandledMsg = useRef(false);
  useEffect(() => {
    const msg = searchParams.get("msg");
    if (msg && !hasHandledMsg.current) {
      hasHandledMsg.current = true;
      handleSendMessage(msg);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  // Load message logs from thread
  const { data: messages = [], isLoading: isChatsLoading, isError, error } = useQuery({
    queryKey: ["workspace_chats", courseId],
    queryFn: () => getChats(threadId),
  });

  // Load welcome message if empty
  const hasFetchedWelcome = useRef(false);
  useEffect(() => {
    let isMounted = true;

    if (!isChatsLoading && !hasFetchedWelcome.current) {
      hasFetchedWelcome.current = true;
      getWelcomeMessage(threadId)
        .then((msg) => {
          if (msg && isMounted) {
            queryClient.setQueryData<Message[]>(["workspace_chats", courseId], (old) => {
              const existing = old || [];
              if (existing.some((m) => m.id === msg.id || m.message === msg.message)) return existing;
              return [...existing, msg];
            });
          }
        })
        .catch((err) => {
          if (isMounted) console.error("Welcome message fetch failed:", err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isChatsLoading, courseId, queryClient, threadId]);

  // Scroll details
  const isUserScrolledUp = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 50;
  };

  useEffect(() => {
    if (scrollRef.current && !isUserScrolledUp.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamingReply]);

  // Send message mutation
  const chatMutation = useMutation({
    mutationFn: async ({ text, files, webSearch, activeVideoId }: { text: string; files: FileAttachment[]; webSearch?: boolean; activeVideoId?: string }) => {
      setStreamingReply("");
      setSearchProgress("Searching course index...");
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      try {
        return await sendChatMessage(
          text,
          files,
          webSearch,
          "query_intent",
          (chunk) => {
            if (chunk.type === "progress") {
              setSearchProgress(chunk.message);
            } else if (chunk.type === "text") {
              setSearchProgress(null);
              setStreamingReply((prev) => (prev || "") + chunk.content);
            }
          },
          abortController.signal,
          threadId,
          activeVideoId
        );
      } catch (err: any) {
        if (err.message === "AbortError" || err.name === "AbortError") {
          return { reply: streamingReply || "", citations: [] };
        }
        throw err;
      }
    },
    onMutate: async ({ text, files }) => {
      await queryClient.cancelQueries({ queryKey: ["workspace_chats", courseId] });
      const previousChats = queryClient.getQueryData<Message[]>(["workspace_chats", courseId]);

      const tempId = `temp-user-${Date.now()}`;
      const newUserMessage: Message = {
        id: tempId,
        message: text.startsWith("[Context:") ? text.split("\n").slice(1).join("\n") : text,
        role: "user",
        FileAttachments: files.length > 0 ? files : null,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(["workspace_chats", courseId], (old) => [...(old || []), newUserMessage]);
      return { previousChats, tempId };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["workspace_chats", courseId], context?.previousChats);
      setStreamingReply(null);
      setSearchProgress(null);
      toast.error("Transmission failed. Please retry.");
    },
    onSuccess: (result, variables, context) => {
      const aiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        message: result.reply,
        role: "assistant",
        citations: result.citations,
        artifact: result.artifact,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(["workspace_chats", courseId], (old) => {
        const existing = old || [];
        const filtered = existing.filter((msg) => msg.id !== context.tempId);
        return [...filtered, aiMessage];
      });

      setStreamingReply(null);
      setSearchProgress(null);
      queryClient.invalidateQueries({ queryKey: ["workspace_chats", courseId] });
    },
  });

  const handleFileUploads = async (files: File[]): Promise<FileAttachment[]> => {
    if (files.length === 0) return [];
    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      toast.success("Assets integrated successfully");
      return results;
    } catch (error) {
      toast.error("File upload failed.");
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (chatMutation.isPending || isUploading) return;

    let finalText = text;
    if (embeddedContext && messages.length <= 1) {
      finalText = `[Context: ${embeddedContext}]\n${finalText}`;
    }

    chatMutation.mutate({ text: finalText, files: [], webSearch: webSearchActive, activeVideoId });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((messageText.trim() || selectedFiles.length > 0) && !chatMutation.isPending && !isUploading) {
      const uploadedFiles = await handleFileUploads(selectedFiles);
      
      let finalText = messageText;
      if (embeddedContext && messages.length <= 1) {
        finalText = `[Context: ${embeddedContext}]\n${finalText}`;
      }

      chatMutation.mutate({ text: finalText, files: uploadedFiles, webSearch: webSearchActive, activeVideoId });
      setMessageText("");
      setSelectedFiles([]);
    }
  };

  const isProcessing = chatMutation.isPending || isUploading;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFF] relative overflow-hidden">
      {/* Scrollable chat body */}
      <main
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 relative z-10 px-4 pt-4 pb-32"
      >
        <div className="max-w-3xl mx-auto w-full">
          {isError ? (
            <div className="flex flex-col justify-center items-center h-[50vh] gap-3 p-6 text-center bg-red-50/50 rounded-2xl border border-red-100 animate-in fade-in duration-300">
              <h3 className="font-bold text-red-900 text-sm">Connection Interrupted</h3>
              <p className="text-xs text-red-700">
                {(error as any)?.message || "Failed to load chat thread."}
              </p>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["workspace_chats", courseId] })}
                className="mt-2 px-4 py-1.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all active:scale-95"
              >
                Retry Connection
              </button>
            </div>
          ) : isChatsLoading ? (
            <div className="flex flex-col justify-center items-center h-[50vh] gap-3">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-400 animate-pulse">Syncing Learning Logs...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-start min-h-[50vh] px-1 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out w-full">
              {/* Welcome Card */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-2 w-full mb-6 text-left">
                <h3 className="font-bold text-slate-900 text-[14px] flex items-center gap-2">
                  <span className="text-lg">👋</span> Hello! I'm AarikaAI
                </h3>
                <p className="text-[13px] text-[#444746] font-medium leading-relaxed">
                  I can help you understand this lesson better. How can I assist you today?
                </p>
              </div>

              {/* Quick Actions Header */}
              <div className="w-full text-left mb-3">
                <h3 className="font-bold text-slate-900 text-[13px]">Quick Actions</h3>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {[
                  {
                    title: "Summarize Lesson",
                    desc: "Summarize the entire lesson video",
                    prompt: "Please summarize this lesson video for me, highlighting the main timeline events and key topics covered.",
                    color: "bg-blue-50 text-blue-600 border-blue-100/50 hover:bg-blue-100/50",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )
                  },
                  {
                    title: "Key Concepts",
                    desc: "List main key points and concepts",
                    prompt: "What are the key concepts and core topics taught in this lesson? Please list them clearly with brief explanations.",
                    color: "bg-emerald-50 text-emerald-600 border-emerald-100/50 hover:bg-emerald-100/50",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    )
                  },
                  {
                    title: "MCQ Quiz",
                    desc: "Test yourself with multiple choice questions",
                    prompt: "Based on this lesson, please prepare a 5-question multiple-choice quiz (MCQ) for me to test my understanding.",
                    color: "bg-purple-50 text-purple-600 border-purple-100/50 hover:bg-purple-100/50",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    )
                  },
                  {
                    title: "Explain Topic",
                    desc: "Explain specific topics from the lesson",
                    prompt: "Can you explain the main topic of this lesson in simple terms? Please break down any complex jargon.",
                    color: "bg-amber-50 text-amber-600 border-amber-100/50 hover:bg-amber-100/50",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )
                  },
                  {
                    title: "Prepare Notes",
                    desc: "Format and compile study notes",
                    prompt: "Please generate comprehensive study notes for this lesson video, formatted in markdown with clear headings.",
                    color: "bg-pink-50 text-pink-600 border-pink-100/50 hover:bg-pink-100/50",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )
                  },
                  {
                    title: "Doubt Solver",
                    desc: "Solve specific doubts and questions",
                    prompt: "I have a few doubts about this lesson. Can we do a question-and-answer session to resolve them?",
                    color: "bg-cyan-50 text-cyan-600 border-cyan-100/50 hover:bg-cyan-100/50",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )
                  }
                ].map((action, i) => (
                  <div
                    key={i}
                    onClick={() => handleSendMessage(action.prompt)}
                    className="flex gap-3 items-center p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-[#F8FAFF] transition-all duration-300 group cursor-pointer text-left w-full"
                  >
                    <div className={`shrink-0 w-9 h-9 rounded-xl ${action.color} flex items-center justify-center`}>
                      {action.icon}
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-extrabold text-[12.5px] group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-slate-400 text-[10px] font-semibold">{action.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <MessageList
              messages={
                streamingReply
                  ? [
                      ...messages,
                      {
                        id: "streaming",
                        role: "assistant",
                        message: streamingReply,
                        createdAt: new Date().toISOString(),
                      },
                    ]
                  : messages
              }
              onSendMessage={handleSendMessage}
              onEditMessage={async (messageId: string | number, newText: string) => {
                try {
                  const numId = Number(messageId);
                  if (isNaN(numId)) return;

                  queryClient.setQueryData<Message[]>(["workspace_chats", courseId], (old) => {
                    const existing = old || [];
                    const idx = existing.findIndex((m) => String(m.id) === String(messageId));
                    if (idx === -1) return existing;
                    return existing.slice(0, idx);
                  });

                  await truncateChat(numId);
                  handleSendMessage(newText);
                } catch (err) {
                  toast.error("Failed to edit message");
                }
              }}
            />
          )}

          {isProcessing && !streamingReply && (
            <div className="flex justify-start my-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
                  <BrainLogo size={18} />
                </div>
                {searchProgress ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm">
                    <div className="w-3.5 h-3.5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shrink-0" />
                    <span className="text-[12px] font-semibold text-slate-500 animate-pulse select-none">
                      {searchProgress}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="typing-dot bg-slate-300 w-1.5 h-1.5 rounded-full animate-bounce" />
                    <div className="typing-dot bg-slate-300 w-1.5 h-1.5 rounded-full animate-bounce delay-75" />
                    <div className="typing-dot bg-slate-300 w-1.5 h-1.5 rounded-full animate-bounce delay-150" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Input Toolbar */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-5 pt-2 bg-gradient-to-t from-[#F8FAFF] via-[#F8FAFF] to-transparent shrink-0">
        <div className="max-w-3xl mx-auto w-full">
          {/* Files preview list */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 animate-in fade-in duration-300">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-white border border-slate-100 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-bold"
                >
                  <Paperclip size={12} className="mr-1.5 text-blue-500" />
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="ml-2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input container */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full bg-white border border-slate-200/60 rounded-2xl shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all duration-300"
          >
            <div className="flex flex-col w-full px-4 pt-3 pb-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={isProcessing ? "Tuning response..." : "Ask AarikaAI anything..."}
                className="w-full bg-transparent text-slate-800 focus:outline-none resize-none text-sm placeholder-slate-400 font-medium min-h-[40px] max-h-[160px] scrollbar-none leading-relaxed"
                rows={1}
                disabled={isProcessing}
              />

              {/* Toolbar button row */}
              <div className="flex items-center justify-between border-t border-slate-50 mt-2.5 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all active:scale-95 duration-200"
                    disabled={isProcessing}
                  >
                    <Paperclip size={13} />
                    <span>Attach</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWebSearchActive(!webSearchActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 duration-200 ${
                      webSearchActive
                        ? "bg-blue-50 border-blue-200 text-blue-600"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                    disabled={isProcessing}
                  >
                    <Globe size={13} />
                    <span>Search Web</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!(messageText.trim() || selectedFiles.length > 0) || isProcessing}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    (messageText.trim() || selectedFiles.length > 0) && !isProcessing
                      ? "bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95"
                      : "bg-slate-50 text-slate-300 cursor-not-allowed"
                  }`}
                >
                  <Send size={13} className="ml-[1.5px]" />
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </form>
        </div>
      </footer>
    </div>
  );
};

export default WorkspaceChatArea;
