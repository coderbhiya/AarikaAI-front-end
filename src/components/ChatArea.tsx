"use client";

import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, User, Sparkles, Zap, Shield, Globe } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChats, sendChatMessage, uploadFile } from "@/services/chatService";
import MessageList from "./chat/MessageList";
import BrainLogo from "./BrainLogo";
import SuggestionChips from "./chat/SuggestionChips";
import { Message, FileAttachment } from "@/types";

const ChatArea: React.FC = () => {
    const isMobile = useIsMobile();
    const navigate = useRouter();
    const queryClient = useQueryClient();
    const { toggleSidebar } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: messages = [], isLoading: isChatsLoading } = useQuery({
        queryKey: ["chats"],
        queryFn: getChats,
    });

    const chatMutation = useMutation({
        mutationFn: async ({ text, files }: { text: string; files: FileAttachment[] }) => {
            return sendChatMessage(text, files);
        },
        onMutate: async ({ text, files }) => {
            await queryClient.cancelQueries({ queryKey: ["chats"] });
            const previousChats = queryClient.getQueryData<Message[]>(["chats"]);

            const newUserMessage: Message = {
                id: Date.now().toString(),
                message: text,
                role: "user",
                FileAttachments: files.length > 0 ? files : null,
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData<Message[]>(["chats"], (old) => [...(old || []), newUserMessage]);
            return { previousChats };
        },
        onError: (err, newMessage, context) => {
            queryClient.setQueryData(["chats"], context?.previousChats);
            toast.error("Transmission failed. Please retry.");
        },
        onSuccess: (reply) => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                message: reply,
                role: "assistant",
                createdAt: new Date().toISOString(),
            };
            queryClient.setQueryData<Message[]>(["chats"], (old) => [...(old || []), aiMessage]);
        },
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, chatMutation.isPending]);

    const handleFileUploads = async (files: File[]): Promise<FileAttachment[]> => {
        if (files.length === 0) return [];
        setIsUploading(true);
        try {
            const uploadPromises = files.map(file => uploadFile(file));
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

    const handleSendMessage = async (text: string, attachedFiles?: File[]) => {
        const uploadedFiles = attachedFiles ? await handleFileUploads(attachedFiles) : [];
        chatMutation.mutate({ text, files: uploadedFiles });
    };

    const isProcessing = chatMutation.isPending || isUploading;

    return (
        <div className="flex-1 flex flex-col h-full w-full bg-[#F8F9FA] relative overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-100/50">
                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 md:p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors active:scale-95"
                    >
                        <Menu size={18} className="md:w-5 md:h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-[17px] font-semibold text-[#444746] tracking-tight">CareerAI</span>
                        <div className="px-1.5 py-0.5 rounded-md bg-primary/5 border border-primary/10">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-tight">v3.0</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isMobile && (
                        <div className="flex items-center gap-1.5 mr-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-medium text-gray-400">System Live</span>
                        </div>
                    )}
                    <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
                        <User size={16} />
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-none relative z-10 px-3 md:px-6 pt-4 md:pt-6 pb-24 md:pb-20">
                <div className="max-w-4xl mx-auto w-full">
                    {isChatsLoading ? (
                        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <span className="text-[13px] font-medium text-gray-400 animate-pulse">Establishing Connection...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[75vh] text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                            <div className="mb-8 p-1">
                                <BrainLogo size={72} className="opacity-90 drop-shadow-2xl" />
                            </div>
                            <h2 className="text-[32px] md:text-[44px] font-medium text-[#202124] tracking-tight mb-4 leading-tight">
                                Hello, how can I help <span className="gemini-gradient-text">your career today?</span>
                            </h2>
                            <p className="text-[#444746] text-sm md:text-lg max-w-xl mx-auto mb-4 leading-relaxed font-normal opacity-90">
                                I am your Career Strategist. Upload your resume to start analysis, or ask me about market trends and skills.
                            </p>

                            <SuggestionChips onSelect={(text) => handleSendMessage(text)} />
                        </div>
                    ) : (
                        <MessageList messages={messages} />
                    )}

                    {isProcessing && (
                        <div className="flex justify-start my-8 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center gap-3 px-1">
                                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                    <BrainLogo size={18} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="typing-dot" />
                                    <div className="typing-dot" />
                                    <div className="typing-dot" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer / Input Area */}
            <footer className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-2 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent shrink-0">
                <div className="max-w-4xl mx-auto">
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isProcessing} />
                </div>
            </footer>
        </div>
    );
};

export default ChatArea;
