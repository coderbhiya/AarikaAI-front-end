"use client";

import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, User, Sparkles, Zap, Shield, Globe, Plus, ArrowRight, Compass, FileText, Code, Lightbulb } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChats, sendChatMessage, uploadFile, getWelcomeMessage } from "@/services/chatService";
import { autoFillProfileFromResume } from "@/services/profileService";
import { detectResume } from "@/utils/resumeDetector";
import MessageList from "./chat/MessageList";
import BrainLogo from "./BrainLogo";
import SuggestionChips from "./chat/SuggestionChips";
import { Message, FileAttachment } from "@/types";
import { ProfileSyncModal } from "./profile/ProfileSyncModal";

const ChatArea: React.FC = () => {
    const isMobile = useIsMobile();
    const navigate = useRouter();
    const queryClient = useQueryClient();
    const { user, toggleSidebar } = useAuth();
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

    // Fix 1 & 3: Welcome Message Logic & Memory Leak Fix
    const hasFetchedWelcome = useRef(false);
    useEffect(() => {
        let isMounted = true;
        
        if (!isChatsLoading && !hasFetchedWelcome.current) {
            hasFetchedWelcome.current = true;
            getWelcomeMessage().then((msg) => {
                if (msg && isMounted) {
                    queryClient.setQueryData<Message[]>(["chats"], (old) => {
                        const existing = old || [];
                        if (existing.some(m => m.id === msg.id || m.message === msg.message)) return existing;
                        return [...existing, msg];
                    });
                }
            }).catch((err) => {
                if (isMounted) console.error("Welcome message fetch failed:", err);
            });
        }
        
        return () => {
            isMounted = false;
        };
    }, [isChatsLoading, queryClient]);

    // Fix 5: Intelligent Auto Scroll setup
    const isUserScrolledUp = useRef(false);
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 50;
    };

    const chatMutation = useMutation({
        // Fix 1: Add engine parameter
        mutationFn: async ({ text, files, webSearch, engine }: { text: string; files: FileAttachment[]; webSearch?: boolean; engine?: string }) => {
            setStreamingReply("");
            setSearchProgress("Searching career trends...");
            return sendChatMessage(text, files, webSearch, engine, (chunk) => {
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

            const tempId = `temp-user-${Date.now()}`;
            const newUserMessage: Message = {
                id: tempId,
                message: text,
                role: "user",
                FileAttachments: files.length > 0 ? files : null,
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData<Message[]>(["chats"], (old) => [...(old || []), newUserMessage]);
            return { previousChats, tempId };
        },
        onError: (err, newMessage, context) => {
            queryClient.setQueryData(["chats"], context?.previousChats);
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
            
            queryClient.setQueryData<Message[]>(["chats"], (old) => {
                const existing = old || [];
                
                // Remove the optimistic user message (tempId) and any exact AI message match
                const filtered = existing.filter(msg => 
                    msg.id !== context.tempId && 
                    !(msg.role === "assistant" && msg.message === result.reply)
                );
                
                const finalArray = [...filtered];
                
                // If a background fetch resolved during the stream, the real database 
                // user message will already exist in the cache. We must prevent duplicating it.
                const realUserMessageExists = filtered.some(msg => 
                    msg.role === "user" && 
                    msg.message === variables.text && 
                    !msg.id.startsWith("temp-")
                );
                
                // Only re-add the temporary user message if the real DB message hasn't arrived yet
                if (!realUserMessageExists) {
                    finalArray.push({
                        id: context.tempId, 
                        message: variables.text, 
                        role: "user", 
                        FileAttachments: variables.files.length > 0 ? variables.files : undefined,
                        createdAt: new Date().toISOString()
                    });
                }
                
                finalArray.push(aiMessage);
                return finalArray;
            });

            if (result.artifact) {
                setActiveArtifact(result.artifact);
            }
            setStreamingReply(null);
            setSearchProgress(null);
            
            // Background fetch to sync real DB IDs
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        },
    });

    // Fix 5: Intelligent Streaming Auto Scroll
    useEffect(() => {
        if (scrollRef.current && !isUserScrolledUp.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, streamingReply, chatMutation.isPending]);

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

    const handleSendMessage = async (text: string, attachedFiles?: File[], webSearch?: boolean, engine?: string) => {
        const uploadedFiles = attachedFiles ? await handleFileUploads(attachedFiles) : [];

        // Fix 3: Improved Resume Detection Logic
        if (uploadedFiles.length > 0) {
            const resumeFile = uploadedFiles.find(f => {
                const detection = detectResume(f.originalName, f.fileType);
                return detection.isResume && detection.confidence >= 60;
            });

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

        chatMutation.mutate({ text, files: uploadedFiles, webSearch, engine });
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
                <main ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-none relative z-10 px-3 md:px-6 pt-4 md:pt-6 pb-24 md:pb-20">
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
                            <div className="flex flex-col items-center justify-start min-h-[75vh] px-2 pt-6 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out w-full">
                                {/* Concentric Logo Rings */}
                                <div className="relative mb-8 w-32 h-32 flex items-center justify-center mt-4">
                                    <div className="absolute inset-[-20px] rounded-full border border-gray-200/40 shadow-[0_0_40px_-10px_rgba(0,0,0,0.03)]"></div>
                                    <div className="absolute inset-[-4px] rounded-full border border-gray-200/60"></div>
                                    <div className="absolute inset-3 rounded-full border border-gray-200/80 flex items-center justify-center bg-white shadow-sm z-10">
                                        <BrainLogo size={56} className="opacity-100" />
                                    </div>
                                    {/* Decorative scattered dots */}
                                    <div className="absolute top-0 -left-6 w-1.5 h-1.5 rounded-sm bg-blue-500 rotate-45"></div>
                                    <div className="absolute -top-4 right-2 w-1.5 h-1.5 rounded-sm bg-red-500 rotate-12"></div>
                                    <div className="absolute bottom-6 -left-12 w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <div className="absolute -bottom-8 left-4 w-1.5 h-1.5 rounded-sm bg-blue-400 rotate-45"></div>
                                    <div className="absolute top-8 -right-10 w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <div className="absolute bottom-2 -right-4 w-1.5 h-1.5 rounded-sm bg-yellow-400 rotate-45"></div>
                                    <div className="absolute top-1/2 -left-20 w-8 h-8 rounded-full bg-yellow-100/50 blur-xl"></div>
                                    <div className="absolute top-1/2 -right-20 w-12 h-12 rounded-full bg-blue-100/50 blur-xl"></div>
                                </div>

                                <h2 className="text-[28px] md:text-[32px] font-bold text-[#1F2937] tracking-tight mb-2 text-center">
                                    Hi {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'}! 👋
                                </h2>
                                <p className="text-[#6B7280] text-[15px] max-w-sm text-center mb-8 font-medium">
                                    Your AI Career Companion is ready to help you grow.
                                </p>

                                <button 
                                    onClick={() => handleSendMessage("Hi, let's start a new chat!")}
                                    className="w-full md:w-[80%] max-w-md bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[20px] py-4 mb-8 text-[16px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200/50 transition-all active:scale-95"
                                >
                                    <Plus size={20} /> New Chat
                                </button>

                                {/* Action Cards Grid */}
                                <div className="grid grid-cols-2 gap-4 w-full md:w-[80%] max-w-md">
                                    {/* Card 1 */}
                                    <div 
                                        onClick={() => handleSendMessage("I need career guidance and a roadmap")}
                                        className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between aspect-square cursor-pointer hover:shadow-md transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-3">
                                            <Compass size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-[14px] leading-tight mb-1.5">Career Guidance</h3>
                                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-snug font-medium">Get personalized career advice and roadmap</p>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 2 */}
                                    <div 
                                        onClick={() => handleSendMessage("Can you review my resume?")}
                                        className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between aspect-square cursor-pointer hover:shadow-md transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white mb-3">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-[14px] leading-tight mb-1.5">Resume Review</h3>
                                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-snug font-medium">Analyze your resume and improve it</p>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-[#3B82F6] group-hover:bg-blue-50 transition-colors">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 3 */}
                                    <div 
                                        onClick={() => handleSendMessage("I need help with coding")}
                                        className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between aspect-square cursor-pointer hover:shadow-md transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#EF4444] flex items-center justify-center text-white mb-3">
                                            <Code size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-[14px] leading-tight mb-1.5">Coding Help</h3>
                                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-snug font-medium">Debug, explain or generate code</p>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-[#EF4444] group-hover:bg-red-50 transition-colors">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 4 */}
                                    <div 
                                        onClick={() => handleSendMessage("Help me prepare for an interview")}
                                        className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between aspect-square cursor-pointer hover:shadow-md transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center text-white mb-3">
                                            <Lightbulb size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-[14px] leading-tight mb-1.5">Interview Prep</h3>
                                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-snug font-medium">Practice mock interviews and get better</p>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-[#F59E0B] group-hover:bg-amber-50 transition-colors">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
