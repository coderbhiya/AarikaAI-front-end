"use client";

import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, User, Sparkles, Zap, Shield, Globe } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChats, sendChatMessage, uploadFile, getWelcomeMessage } from "@/services/chatService";
import { autoFillProfileFromResume } from "@/services/profileService";
import MessageList from "./chat/MessageList";
import BrainLogo from "./BrainLogo";
import SuggestionChips from "./chat/SuggestionChips";
import { Message, FileAttachment } from "@/types";
import { ProfileSyncModal } from "./profile/ProfileSyncModal";

const ChatArea: React.FC = () => {
    const isMobile = useIsMobile();
    const navigate = useRouter();
    const queryClient = useQueryClient();
    const { toggleSidebar } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [pendingSnapshotForModal, setPendingSnapshotForModal] = useState<any>(null);
    const [activeArtifact, setActiveArtifact] = useState<any>(null);

    const [streamingReply, setStreamingReply] = useState<string | null>(null);
    const [searchProgress, setSearchProgress] = useState<string | null>(null);

    const { data: messages = [], isLoading: isChatsLoading, isError, error } = useQuery({
        queryKey: ["chats"],
        queryFn: getChats,
    });

    useEffect(() => {
        // Fetch proactive welcome message once on mount if chat history exists
        if (!isChatsLoading && messages.length > 0) {
            getWelcomeMessage().then((msg) => {
                if (msg) {
                    queryClient.setQueryData<Message[]>(["chats"], (old) => [...(old || []), msg]);
                }
            }).catch(console.error);
        }
    }, [isChatsLoading, messages.length > 0]); // Run once when messages are first loaded

    const chatMutation = useMutation({
        mutationFn: async ({ text, files, webSearch }: { text: string; files: FileAttachment[]; webSearch?: boolean }) => {
            setStreamingReply("");
            setSearchProgress("Searching career trends...");
            return sendChatMessage(text, files, webSearch, (chunk) => {
                if (chunk.type === "progress") {
                    setSearchProgress(chunk.message);
                } else if (chunk.type === "text") {
                    setSearchProgress(null);
                    setStreamingReply((prev) => (prev || "") + chunk.content);
                }
            });
        },
        onMutate: async ({ text, files, webSearch }) => {
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
            setStreamingReply(null);
            setSearchProgress(null);
            toast.error("Transmission failed. Please retry.");
        },
        onSuccess: (result) => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                message: result.reply,
                role: "assistant",
                citations: result.citations,
                artifact: result.artifact,
                createdAt: new Date().toISOString(),
            };
            queryClient.setQueryData<Message[]>(["chats"], (old) => [...(old || []), aiMessage]);
            if (result.artifact) {
                setActiveArtifact(result.artifact);
            }
            setStreamingReply(null);
            setSearchProgress(null);
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

    const handleSendMessage = async (text: string, attachedFiles?: File[], webSearch?: boolean) => {
        const uploadedFiles = attachedFiles ? await handleFileUploads(attachedFiles) : [];

        // Check for resumes and trigger auto-fill
        if (uploadedFiles.length > 0) {
            const resumeFile = uploadedFiles.find(f =>
                f.originalName.toLowerCase().includes("resume") ||
                f.originalName.toLowerCase().includes("cv") ||
                [".pdf", ".doc", ".docx"].includes(f.fileType.toLowerCase())
            );

            if (resumeFile) {
                toast.promise(
                    (async () => {
                        const res = await autoFillProfileFromResume(resumeFile.filePath, resumeFile.originalName);
                        if (res.success && res.diff && (res.diff.updatedFields?.length > 0 || res.diff.addedFields?.length > 0 || res.diff.conflicts?.length > 0)) {
                            const aiMessage: Message = {
                                id: Date.now().toString(),
                                message: `[RESUME_SYNC_CARD]${JSON.stringify({ diff: res.diff, snapshot: res.snapshot })}[/RESUME_SYNC_CARD]`,
                                role: "assistant",
                                createdAt: new Date().toISOString(),
                            };
                            queryClient.setQueryData<Message[]>(["chats"], (old) => [...(old || []), aiMessage]);
                        } else {
                            toast.info("No profile updates detected in the uploaded resume.");
                        }
                        return res;
                    })(),
                    {
                        loading: "Parsing resume to update profile...",
                        success: "Resume parsed successfully! Review differences to update your profile.",
                        error: "Could not auto-fill profile."
                    }
                );
            }
        }

        chatMutation.mutate({ text, files: uploadedFiles, webSearch });
    };

    const isProcessing = chatMutation.isPending || isUploading;

    return (
        <div className="flex w-full h-full">
            {/* Left/Main Chat Area */}
            <div className={`flex flex-col h-full bg-[#F8F9FA] relative overflow-hidden transition-all duration-300 ${activeArtifact ? (isMobile ? 'w-full hidden' : 'w-1/2 border-r border-gray-200') : 'w-full'}`}>
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
                            <span className="text-[17px] font-semibold text-[#444746] tracking-tight">AarikaAI</span>
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
                    <div className="max-w-5xl mx-auto w-full">
                        {isError ? (
                            <div className="flex flex-col justify-center items-center h-[70vh] gap-4 p-8 text-center bg-red-50/50 rounded-3xl border border-red-100 animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-2">
                                    <Shield size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-red-900">Connection Interrupted</h3>
                                <p className="text-sm text-red-700 max-w-sm">
                                    {(error as any)?.response?.data?.message || (error as any)?.message || "The neural link could not be established. Please check your network and refresh."}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                                >
                                    Reconnect System
                                </button>
                            </div>
                        ) : isChatsLoading ? (
                            <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <span className="text-[13px] font-medium text-gray-400 animate-pulse">Establishing Connection...</span>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[75vh] text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                                <div className="mb-6 md:mb-8 p-1">
                                    <BrainLogo size={56} className="md:w-[72px] md:h-[72px] opacity-90 drop-shadow-2xl mx-auto" />
                                </div>
                                <h2 className="text-[26px] sm:text-[32px] md:text-[44px] font-medium text-[#202124] tracking-tight mb-3 md:mb-4 leading-tight px-4">
                                    Hello, how can I help <span className="gemini-gradient-text">your career today?</span>
                                </h2>
                                <p className="text-[#444746] text-sm md:text-lg max-w-5xl mx-auto mb-4 leading-relaxed font-normal opacity-90 px-4">
                                    I am your Career Strategist. Upload your resume to start analysis, or ask me about market trends and skills.
                                </p>

                                <SuggestionChips onSelect={(text) => handleSendMessage(text)} />
                            </div>
                        ) : (
                            <MessageList
                                messages={
                                    streamingReply
                                        ? [...messages, { id: "streaming", role: "assistant", message: streamingReply, createdAt: new Date().toISOString() }]
                                        : messages
                                }
                                onSendMessage={handleSendMessage}
                            />
                        )}

                        {isProcessing && !streamingReply && (
                            <div className="flex justify-start my-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                        <BrainLogo size={18} />
                                    </div>
                                    {searchProgress ? (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm">
                                            <div className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin shrink-0" />
                                            <span className="text-[12px] font-semibold text-gray-500 animate-pulse select-none">
                                                {searchProgress}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <div className="typing-dot" />
                                            <div className="typing-dot" />
                                            <div className="typing-dot" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Invisible spacer to allow scrolling past the fixed footer */}
                        <div className="h-32 md:h-40 flex-shrink-0 w-full" />
                    </div>
                </main>

                {/* Footer / Input Area */}
                <footer className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-2 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent shrink-0">
                    <div className="max-w-5xl mx-auto">
                        <ChatInput onSendMessage={handleSendMessage} isLoading={isProcessing} />
                    </div>
                </footer>

                <ProfileSyncModal
                    isOpen={isSyncModalOpen}
                    onClose={(updated) => {
                        setIsSyncModalOpen(false);
                        if (updated) {
                            queryClient.invalidateQueries({ queryKey: ["profile"] });
                        }
                    }}
                    pendingResumeSnapshot={pendingSnapshotForModal}
                />
            </div>

            {/* Right/Workspace Area */}
            {activeArtifact && (
                <div className={`flex flex-col h-full bg-white relative overflow-hidden transition-all duration-300 ${isMobile ? 'w-full absolute inset-0 z-50' : 'w-1/2'}`}>
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f9fafb]">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-bold text-[#202124]">{activeArtifact.title || "Career Artifact"}</h3>
                                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">
                                    {activeArtifact.type?.replace("_", " ")} • v{activeArtifact.version || 1}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveArtifact(null)}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                        <pre className="text-xs bg-gray-50 p-4 rounded-xl border border-gray-100 overflow-x-auto">
                            {JSON.stringify(activeArtifact.data, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatArea;
