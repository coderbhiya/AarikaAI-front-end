import React, { useEffect, useState, useRef } from "react";
import ChatInput from "./ChatInput";
import BrainLogo from "./BrainLogo";
import { Copy, Edit, ArrowLeft, MoreHorizontal, Share, ArrowRight } from "lucide-react";
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
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      {messages.map((message) => (
        <div key={message.id} className={`rounded-2xl p-2 bg-white/5 backdrop-blur-sm border border-white/10 w-fit max-w-[60%] text-white ${message.role === "user" ? "ml-auto" : "mr-auto"}`}>
          {message.message.split("\n\n").map((paragraph, idx) => {
            return (
                <Markdown text={paragraph} />
            );
          })}
          {/* File Attachments Display */}
          {message.FileAttachments && message.FileAttachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.FileAttachments.map((file, index) => (
                <div key={index} className={`flex items-center space-x-3 p-3 rounded-xl bg-gray-700/50 border border-gray-600}`}>
                  <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate text-gray-200`}>{file.originalName}</p>
                    <p className={`text-xs text-gray-400`}>{formatFileSize(file.fileSize)}</p>
                  </div>
                  <button onClick={() => window.open(`${file.filePath}`, "_blank")} className={`p-2 rounded-lg hover:bg-gray-600 text-gray-300 transition-colors`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const ChatArea: React.FC<ChatAreaProps> = ({ onSendMessage, showWelcome: externalShowWelcome }) => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchAIResponse = async (userMessage: string, fileAttachments?: FileAttachment[]) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/chat", {
        message: userMessage,
        fileAttachments: fileAttachments || [],
      });

      return response.data.reply.replace(/\n/g, "<br />");
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
      fileAttachments: uploadedFiles.length > 0 ? uploadedFiles : null,
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

  // Handle more options button click in mobile view
  const handleMoreButtonClick = () => {};

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-background">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="mobile-back-button">
            <ArrowLeft size={24} />
          </button>

          <button className="mobile-more-button" onClick={handleMoreButtonClick}>
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Mobile Content */}
        <div className="mobile-content">
          <>
            <MessageList messages={messages} />
            {isLoading && (
              <div className="flex justify-center my-4">
                <div className="text-white animate-pulse">Thinking...</div>
              </div>
            )}
          </>
        </div>

        {/* Mobile Footer */}
        <div className="mobile-footer">
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 p-6 overflow-y-auto">
        <MessageList messages={messages} />
        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="text-white animate-pulse">Thinking...</div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/10">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatArea;

