import React, { useEffect, useState, useRef } from "react";
import ChatInput from "./ChatInput";
import BrainLogo from "./BrainLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Copy,
  Edit,
  ArrowLeft,
  Menu,
  Share,
  ArrowRight,
  User,
  Brain,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/sonner";
import axiosInstance from "@/lib/axios";
import Markdown from "@/components/common/Markdown";

interface ChatAreaProps {
  onSendMessage: (message: string) => void;
  onSelectCategory: (category: string) => void;
  showWelcome?: boolean;
  toggleSidebar?: () => void;
}

interface FileAttachment {
  id: number;
  filePath: string;
  chatMessageId: number;
  fileName: number;
  originalName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface Message {
  id: string;
  message: string;
  role: "user" | "assistant";
  FileAttachments?: FileAttachment[] | null;
  createdAt: Date;
}

const getFileIcon = (fileType) => {
  if (fileType.startsWith("image/")) {
    return "🖼️";
  } else if (fileType === "application/pdf") {
    return "📄";
  } else if (fileType.includes("word")) {
    return "📝";
  } else if (fileType.includes("excel") || fileType.includes("sheet")) {
    return "📊";
  } else {
    return "📎";
  }
};

const MessageList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-12 w-full max-w-4xl mx-auto pb-20">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`group animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          <div className={`flex gap-4 sm:gap-6 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar/Icon Section */}
            <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold border ${message.role === "user"
              ? "bg-white/[0.05] border-white/10 text-gray-300"
              : "bg-primary/20 border-primary/20 text-primary"
              }`}>
              {message.role === "user" ? <User size={18} /> : <Brain size={20} />}
            </div>

            {/* Content Section */}
            <div className={`flex-1 min-w-0 space-y-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block text-base sm:text-lg leading-relaxed ${message.role === "user"
                ? "bg-white/[0.03] border border-white/[0.08] px-5 py-3 rounded-2xl text-gray-200"
                : "text-gray-100 w-full"
                }`}>
                {message.message.split("\n\n").map((paragraph, idx) => (
                  <div key={idx} className={idx > 0 ? "mt-4" : ""}>
                    <Markdown text={paragraph} />
                  </div>
                ))}
              </div>

              {/* File Attachments */}
              {message.FileAttachments && message.FileAttachments.length > 0 && (
                <div className={`flex flex-wrap gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.FileAttachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all cursor-pointer group/file"
                      onClick={() => window.open(`${file.filePath}`, "_blank")}
                    >
                      <span className="text-xl shrink-0 group-hover/file:scale-110 transition-transform">{getFileIcon(file.mimeType)}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate text-gray-300">
                          {file.originalName}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mt-0.5">
                          {formatFileSize(file.fileSize)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className={`flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <button
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText(message.message);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy size={14} />
                </button>
                <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] transition-all">
                  <Share size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};


const ChatArea: React.FC<ChatAreaProps> = ({
  onSendMessage,
  showWelcome: externalShowWelcome,
}) => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getChats = async () => {
    try {
      const chatResposnce = await axiosInstance.get("/chat");
      setMessages(chatResposnce.data.chats);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getChats();
  }, []);

  const fetchAIResponse = async (
    userMessage: string,
    fileAttachments?: FileAttachment[]
  ) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/chat", {
        message: userMessage,
        fileAttachments: fileAttachments || [],
      });

      // Return raw markdown/text; let Markdown component render formatting
      return response.data.reply;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast.error("Failed to connect to the AI service", {
        description: "Please try again later.",
      });
      return "Sorry, I couldn't connect to the AI service. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string, attachedFiles?: File[]) => {
    let uploadedFiles: FileAttachment[] = [];

    // Upload files if any are attached
    if (attachedFiles && attachedFiles.length > 0) {
      uploadedFiles = await uploadFiles(attachedFiles);
    }

    // Add user message to the chat
    const newUserMessage = {
      id: Date.now().toString(),
      message: text,
      role: "user" as const,
      FileAttachments: uploadedFiles.length > 0 ? uploadedFiles : null,
      createdAt: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    onSendMessage(text);

    // Get AI response from API
    const aiResponseText = await fetchAIResponse(text, uploadedFiles);

    // Add AI response to the chat
    const newAiMessage = {
      id: (Date.now() + 1).toString(),
      message: aiResponseText,
      role: "assistant" as const,
      createdAt: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newAiMessage]);
  };

  const uploadFiles = async (files: File[]) => {
    const uploadedFiles: FileAttachment[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axiosInstance.post("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        uploadedFiles.push(response.data.file);
        toast.success(`File "${file.name}" uploaded successfully`);
      } catch (error) {
        console.error("File upload failed:", error);
        toast.error(`Failed to upload "${file.name}"`);
      }
    }

    return uploadedFiles;
  };

  const { toggleSidebar } = useAuth();

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-[#0a0a0a]">
        {/* Mobile Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.05]">
          <button
            className="p-2 rounded-xl glass-button text-gray-400"
            onClick={() => navigate("/profile")}
          >
            <User size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-white font-semibold text-sm">CareerAI</span>
          </div>

          <button
            className="p-2 rounded-xl glass-button text-gray-400"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth">
          <MessageList messages={messages} />
          {isLoading && (
            <div className="flex justify-start my-8 ml-4">
              <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-primary animate-pulse text-sm font-medium flex items-center gap-2">
                <Brain size={16} className="animate-bounce" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Mobile Footer */}
        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Desktop Header */}
      <div className="hidden md:flex sticky top-0 z-40 items-center justify-between px-8 py-5 bg-[#0a0a0a]/40 backdrop-blur-md border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Brain size={18} />
          </div>
          <span className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Career AI Core</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Active</span>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 overflow-y-auto mt-6 px-6 py-8 md:py-12 h-screen scroll-smooth relative z-10">
        <MessageList messages={messages} />
        {isLoading && (
          <div className="max-w-4xl mx-auto flex justify-start my-8">
            <div className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-primary animate-pulse text-sm font-medium flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
              </div>
              CareerAI is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Blur/Fade Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none z-20" />

      <div className="relative z-30 pb-6 px-6">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};


export default ChatArea;
