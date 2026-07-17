"use client";

import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, User, Sparkles, Zap, Shield, Globe, Plus, ArrowRight, Compass, FileText, Code, Lightbulb, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChats, uploadFile, getWelcomeMessage, truncateChat } from "@/services/chatService";
import { autoFillProfileFromResume } from "@/services/profileService";
import { detectResume } from "@/utils/resumeDetector";
import { NotificationBell } from "./notifications/NotificationBell";
import MessageList from "./chat/MessageList";
import BrainLogo from "./BrainLogo";
import { Message, FileAttachment } from "@/types";
import { ProfileSyncModal } from "./profile/ProfileSyncModal";
import { sendChatMessage } from "@/services/chatService";

// Bug #7 fix: sanitize AI-generated SVG to prevent XSS via <script>, onload, foreignObject, etc.
const sanitizeSvg = (svgMarkup: string): string => {
    if (typeof window === "undefined" || !svgMarkup) return "";
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
        if (doc.querySelector("parsererror")) return "";
        const dangerousTags = ["script", "foreignObject", "use", "animate"];
        const dangerousAttrs = ["onload", "onerror", "onclick", "onmouseover", "onfocus", "onblur", "onkeydown"];
        dangerousTags.forEach((tag) => doc.querySelectorAll(tag).forEach((el) => el.remove()));
        doc.querySelectorAll("*").forEach((el) => {
            dangerousAttrs.forEach((attr) => el.removeAttribute(attr));
            const href = el.getAttribute("href") || el.getAttribute("xlink:href") || "";
            if (href.toLowerCase().startsWith("javascript:")) el.removeAttribute("href");
        });
        return new XMLSerializer().serializeToString(doc.documentElement);
    } catch {
        return "";
    }
};

const renderArtifactPreview = (artifact: any) => {
    if (!artifact || !artifact.data) return null;

    const { type, data } = artifact;

    switch (type) {
        case "html_preview": {
            const htmlContent = data.html || "";
            const cssContent = data.css || "";
            const jsContent = data.js || "";
            const srcDoc = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #1a1a1a; line-height: 1.5; }
                        ${cssContent}
                    </style>
                </head>
                <body>
                    ${htmlContent}
                    <script>${jsContent}</script>
                </body>
                </html>
            `;
            return (
                <div className="w-full h-full min-h-[450px] border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col">
                    <div className="bg-slate-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs text-slate-500 font-semibold select-none">
                        <span>Web Simulation</span>
                        <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                        </div>
                    </div>
                    <iframe
                        srcDoc={srcDoc}
                        title={artifact.title || "HTML Preview"}
                        className="flex-1 w-full border-none bg-white"
                        sandbox="allow-scripts"
                    />
                </div>
            );
        }

        case "svg_render": {
            // Bug #7 fix: sanitize before injecting into DOM
            const svgMarkup = sanitizeSvg(data.svg || "");
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-2xl w-full min-h-[350px] shadow-sm overflow-auto">
                    <div
                        className="max-w-full max-h-[400px] flex items-center justify-center svg-preview-container"
                        dangerouslySetInnerHTML={{ __html: svgMarkup }}
                    />
                </div>
            );
        }

        case "code_snippet": {
            return (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-slate-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between text-xs text-slate-500 font-semibold select-none">
                        <span className="font-mono text-[11px]">{data.filename || "code_file"}</span>
                        <span className="uppercase text-[10px] tracking-wider">{data.language || "code"}</span>
                    </div>
                    <pre className="text-xs bg-slate-900 text-slate-100 p-5 overflow-x-auto font-mono leading-relaxed">
                        <code>{data.code}</code>
                    </pre>
                </div>
            );
        }

        case "career_roadmap": {
            const milestones = data.milestones || [];
            return (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest">Target Objective</h4>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">{data.goal || "Career Roadmap Target"}</h3>
                        {data.timeline && (
                            <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">
                                Timeline: {data.timeline}
                            </span>
                        )}
                    </div>

                    <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-8 mt-4">
                        {milestones.map((milestone: any, index: number) => (
                            <div key={index} className="relative">
                                {/* Timeline Bullet node */}
                                <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-white flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <h4 className="text-sm font-bold text-slate-800">
                                            Step {index + 1}: {milestone.title}
                                        </h4>
                                        {milestone.duration && (
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                {milestone.duration}
                                            </span>
                                        )}
                                    </div>

                                    {milestone.skills && milestone.skills.length > 0 && (
                                        <div className="flex items-center gap-1 flex-wrap pt-1">
                                            {milestone.skills.map((skill: string, sIndex: number) => (
                                                <span key={sIndex} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {milestone.steps && milestone.steps.length > 0 && (
                                        <ul className="mt-2.5 space-y-1.5 pl-1.5 text-xs text-slate-600 font-medium font-medium">
                                            {milestone.steps.map((step: string, stepIndex: number) => (
                                                <li key={stepIndex} className="flex items-start gap-2">
                                                    <span className="text-primary mt-0.5">✓</span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        case "resume_analysis": {
            const strengths = data.strengths || [];
            const weaknesses = data.weaknesses || [];
            const atsRisks = data.atsRisks || [];
            const score = data.score || 70;

            return (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                    {/* Score section */}
                    <div className="flex items-center gap-4 border-b border-gray-50 pb-5">
                        <div className="relative w-16 h-16 rounded-full border-4 border-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                            {score}%
                            <div className="absolute inset-[-4px] rounded-full border-4 border-primary border-t-transparent animate-spin-slow opacity-30" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Resume ATS Assessment</h3>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                {score >= 80 ? "Highly competitive profile structure" : score >= 60 ? "Requires incremental improvements" : "Critical structural updates required"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {strengths.length > 0 && (
                            <div className="space-y-1.5">
                                <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Core Strengths
                                </h4>
                                <ul className="space-y-1.5 pl-3 border-l border-emerald-100 text-xs text-slate-600 font-medium">
                                    {strengths.map((str: string, index: number) => (
                                        <li key={index}>{str}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {weaknesses.length > 0 && (
                            <div className="space-y-1.5">
                                <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Areas of Improvement
                                </h4>
                                <ul className="space-y-1.5 pl-3 border-l border-amber-100 text-xs text-slate-600 font-medium">
                                    {weaknesses.map((weak: string, index: number) => (
                                        <li key={index}>{weak}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {atsRisks.length > 0 && (
                            <div className="space-y-1.5">
                                <h4 className="text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    ATS Parsing Risks
                                </h4>
                                <ul className="space-y-1.5 pl-3 border-l border-red-100 text-xs text-slate-600 font-medium">
                                    {atsRisks.map((risk: string, index: number) => (
                                        <li key={index}>{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        case "interview_prep": {
            const questions = data.questions || [];
            return (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest">Prep Session</h4>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">Mock Interview Q&A Cards</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Click questions to expand and study model answers.</p>
                    </div>

                    <div className="space-y-3">
                        {questions.map((q: any, index: number) => (
                            <details key={index} className="group border border-slate-100 rounded-xl bg-slate-50/50 p-4 transition-all duration-300 open:bg-white open:shadow-sm">
                                <summary className="flex items-center justify-between font-bold text-xs text-slate-800 cursor-pointer list-none select-none">
                                    <span className="pr-4 leading-relaxed">Q{index + 1}: {q.question}</span>
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">▼</span>
                                </summary>
                                <div className="mt-3 text-xs text-slate-600 font-medium border-t border-slate-100 pt-3 leading-relaxed space-y-2">
                                    <p className="font-semibold text-slate-700">Recommended Response:</p>
                                    <p className="bg-slate-50 p-3 rounded-lg text-slate-600">{q.answer}</p>
                                    {q.tips && (
                                        <p className="text-[11px] text-primary italic mt-2">
                                            💡 Pro Tip: {q.tips}
                                        </p>
                                    )}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            );
        }

        default: {
            return (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-800 uppercase mb-4">Structured Data View</h3>
                    <pre className="text-xs bg-gray-50 p-4 rounded-xl border border-gray-100 overflow-x-auto leading-relaxed font-mono">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            );
        }
    }
};

interface ChatAreaProps {
    embeddedContext?: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({ embeddedContext }) => {
    const isMobile = useIsMobile();
    const navigate = useRouter();
    const queryClient = useQueryClient();
    const { user, toggleSidebar, syncProfile } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [pendingSnapshotForModal, setPendingSnapshotForModal] = useState<any>(null);
    const [activeArtifact, setActiveArtifact] = useState<any>(null);
    const [workspaceTab, setWorkspaceTab] = useState<"preview" | "code">("preview");
    const [isPersonalized, setIsPersonalized] = useState<boolean>(true);

    const searchParams = useSearchParams();
    const router = useRouter();

    const [streamingReply, setStreamingReply] = useState<string | null>(null);
    const [searchProgress, setSearchProgress] = useState<string | null>(null);

    // Derive a stable, consistent cache key for this thread.
    // When threadId is in the URL we use it; otherwise we use the literal
    // string "default" so that all hooks (query, onMutate, onSuccess, etc.)
    // reference the same bucket and there is no key split.
    const activeThreadKey = searchParams.get("threadId") || "default";

    const { data: messages = [], isLoading: isChatsLoading, isError, error } = useQuery({
        queryKey: ["chats", activeThreadKey],
        queryFn: async () => {
            // Pass the real UUID if present; pass nothing when there is no thread
            // so the backend's `threadId || null` query matches null-stored messages.
            const tid = searchParams.get("threadId") || undefined;
            return await getChats(tid);
        },
    });

    // Auto-send query param message if exists — Bug #3 fix: wait until chat history is loaded
    // so messages.length is accurate and embeddedContext is only injected when appropriate.
    const hasHandledMsg = useRef(false);
    useEffect(() => {
        const msg = searchParams.get("msg");
        if (msg && !isChatsLoading && !hasHandledMsg.current) {
            hasHandledMsg.current = true;
            handleSendMessage(msg);
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("msg");
            router.replace(`${window.location.pathname}?${newParams.toString()}`);
        }
    }, [searchParams, isChatsLoading]);

    // Fix 1 & 3: Welcome Message Logic & Memory Leak Fix
    const hasFetchedWelcome = useRef(false);
    useEffect(() => {
        let isMounted = true;

        if (!isChatsLoading && !hasFetchedWelcome.current) {
            hasFetchedWelcome.current = true;
            getWelcomeMessage().then((msg) => {
                if (msg && isMounted) {
                    queryClient.setQueryData<Message[]>(["chats", activeThreadKey], (old) => {
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

    // Intelligent Auto Scroll setup
    const isUserScrolledUp = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    // Bug #5 fix: track context injection with a stable ref instead of messages.length
    const hasInjectedContext = useRef(false);
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 50;
    };

    const chatMutation = useMutation({
        mutationFn: async ({ text, files, webSearch, engine, isPersonalized, threadId }: { text: string; files: FileAttachment[]; webSearch?: boolean; engine?: string; isPersonalized?: boolean; threadId?: string }) => {
            setStreamingReply("");
            setSearchProgress("Searching career trends...");
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            // BUG-03 fix: forward the active threadId so the backend appends
            // the message to the correct thread instead of creating a new UUID thread.
            return await sendChatMessage(text, files, webSearch, engine, (chunk) => {
                if (chunk.type === "progress") {
                    setSearchProgress(chunk.message);
                } else if (chunk.type === "text") {
                    setSearchProgress(null);
                    setStreamingReply((prev) => (prev || "") + chunk.content);
                }
            }, abortController.signal, threadId, undefined, isPersonalized);
        },
        onMutate: async ({ text, files }) => {
            await queryClient.cancelQueries({ queryKey: ["chats", activeThreadKey] });
            const previousChats = queryClient.getQueryData<Message[]>(["chats", activeThreadKey]);

            const tempId = `temp-user-${Date.now()}`;
            const newUserMessage: Message = {
                id: tempId,
                message: text,
                role: "user",
                FileAttachments: files.length > 0 ? files : null,
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData<Message[]>(["chats", activeThreadKey], (old) => [...(old || []), newUserMessage]);
            return { previousChats, tempId };
        },
        onError: (err, newMessage, context) => {
            queryClient.setQueryData(["chats", activeThreadKey], context?.previousChats);
            setStreamingReply(null);
            setSearchProgress(null);
            toast.error("Transmission failed. Please retry.");
        },
        onSuccess: (result, variables, context) => {
            const aiMessage: Message = {
                id: `temp-ai-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                message: result.reply || "",
                role: "assistant",
                citations: result.citations,
                artifact: result.artifact,
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData<Message[]>(["chats", activeThreadKey], (old) => {
                const existing = old || [];

                // Remove the optimistic user message (tempId) and any exact AI message match
                const filtered = existing.filter(msg =>
                    msg.id !== context.tempId &&
                    !(msg.role === "assistant" && msg.message === result.reply)
                );

                const finalArray = [...filtered];

                const realUserMessageExists = filtered.some(msg =>
                    msg.role === "user" &&
                    msg.message === variables.text &&
                    !String(msg.id).startsWith("temp-")
                );

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

            // Delay invalidation so the optimistic AI reply renders first before
            // the background refetch overwrites the cache.
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ["chats", activeThreadKey] });
                // Refresh sidebar conversation list so new threads appear immediately
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
            }, 1500);
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
        let currentThreadId = searchParams.get("threadId");
        if (!currentThreadId || currentThreadId === "default") {
            currentThreadId = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            // Seed the new thread's cache bucket with whatever is in the current bucket
            // (e.g. the welcome message) so messages don't flash away during navigation.
            // Use activeThreadKey to read from the correct pre-navigate bucket.
            const oldMessages = queryClient.getQueryData<Message[]>(["chats", activeThreadKey]) || [];
            queryClient.setQueryData<Message[]>(["chats", currentThreadId], oldMessages);

            navigate.replace(`/chat?threadId=${currentThreadId}`);
        }

        const uploadedFiles = attachedFiles ? await handleFileUploads(attachedFiles) : [];

        // Fix 3: Improved Resume Detection Logic
        if (uploadedFiles.length > 0) {
            const resumeFile = uploadedFiles.find(f => {
                const detection = detectResume(f.originalName, f.fileType);
                return detection.isResume && detection.confidence >= 60;
            });

            if (resumeFile) {
                // BUG-15 fix: use a standalone async call instead of toast.promise so
                // we can show different toasts for success vs "no changes" vs error
                // without the success toast always firing when the promise resolves.
                (async () => {
                    const toastId = toast.loading("Parsing resume to update profile...");
                    try {
                        const res = await autoFillProfileFromResume(resumeFile.filePath, resumeFile.originalName);
                        if (res.success && res.diff && (res.diff.updatedFields?.length > 0 || res.diff.addedFields?.length > 0 || res.diff.conflicts?.length > 0)) {
                            const aiMessage: Message = {
                                // Bug #8 fix: Math.random() avoids Date.now() collision with AI reply temp ID
                                id: `temp-resume-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                                message: `[RESUME_SYNC_CARD]${JSON.stringify({ diff: res.diff, snapshot: res.snapshot })}[/RESUME_SYNC_CARD]`,
                                role: "assistant",
                                createdAt: new Date().toISOString(),
                            };
                            queryClient.setQueryData<Message[]>(["chats", currentThreadId!], (old) => [...(old || []), aiMessage]);
                            toast.success("Resume parsed! Review differences to update your profile.", { id: toastId });
                        } else {
                            toast.info("No profile updates detected in the uploaded resume.", { id: toastId });
                        }
                    } catch {
                        toast.error("Could not auto-fill profile.", { id: toastId });
                    }
                })();
            }
        }

        let finalText = (!text.trim() && uploadedFiles.length > 0) ? "I have attached a document." : text;

        // Bug #5 fix: use a stable ref instead of messages.length, which is unreliable after
        // re-mounts because the welcome message inflates the count before the first user message.
        if (embeddedContext && !hasInjectedContext.current) {
            hasInjectedContext.current = true;
            finalText = `[Context: ${embeddedContext}]\n${finalText}`;
        }

        chatMutation.mutate({ text: finalText, files: uploadedFiles, webSearch, engine, isPersonalized, threadId: currentThreadId ?? undefined });
    };

    const isProcessing = chatMutation.isPending || isUploading;

    return (
        <div className="flex-1 flex w-full h-full overflow-hidden">
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
                        {/* Personalized Mode Toggle */}
                        <div className="flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-2 bg-gray-50 border border-gray-100 px-2 sm:px-2.5 py-1 rounded-xl shadow-sm select-none">
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                {isPersonalized ? (
                                    <>
                                        <Sparkles size={10} className="text-primary sm:hidden" />
                                        <span>Personalized<span className="hidden sm:inline"> Mode</span></span>
                                    </>
                                ) : (
                                    <>
                                        <Globe size={10} className="text-gray-400 sm:hidden" />
                                        <span>Generic<span className="hidden sm:inline"> Mode</span></span>
                                    </>
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsPersonalized(!isPersonalized)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isPersonalized ? "bg-primary" : "bg-gray-300"
                                    }`}
                                title="Toggle between Personalized mode and Generic academic mode"
                            >
                                <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPersonalized ? "translate-x-4" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>

                        {!isMobile && (
                            <div className="flex items-center gap-1.5 mr-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px] font-medium text-gray-400">System Live</span>
                            </div>
                        )}
                        <NotificationBell />
                        <button className="hidden sm:flex w-9 h-9 rounded-full bg-primary/10 border border-primary/20 items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
                            <User size={18} />
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
                                    Hi {user?.displayName?.split(' ')[0] || (user as any)?.name?.split(' ')[0] || 'User'}! 👋
                                </h2>
                                <p className="text-[#6B7280] text-[15px] max-w-sm text-center mb-8 font-medium">
                                    Your AI Career Companion is ready to help you grow.
                                </p>

                                {/* Action Cards Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl px-4 md:px-2">
                                    {/* Card 1: Doubt Solving */}
                                    <div
                                        onClick={() => handleSendMessage("I have a doubt, can you help me solve it?")}
                                        className="relative overflow-hidden rounded-2xl md:rounded-[24px] p-4 md:p-5 flex flex-col items-start justify-between aspect-square cursor-pointer transition-all duration-300 group bg-gradient-to-br from-purple-50/80 to-white hover:shadow-[0_8px_24px_rgba(168,85,247,0.1)] border border-purple-100/50 hover:border-purple-200 hover:-translate-y-1"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center border border-white">
                                                <Sparkles size={14} className="text-purple-500" />
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 md:w-12 md:h-12 mb-3 rounded-2xl bg-white shadow-sm border border-purple-50 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <Lightbulb size={20} className="md:w-[22px] md:h-[22px]" />
                                        </div>
                                        <div className="flex-1 text-left w-full mt-auto">
                                            <h3 className="font-extrabold text-gray-900 text-[14px] md:text-[15px] leading-tight mb-1">Doubt Solving</h3>
                                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed font-medium">Instant help with your academic questions</p>
                                        </div>
                                    </div>

                                    {/* Card 2: Exam Preparation */}
                                    <div
                                        onClick={() => handleSendMessage("Help me prepare for my upcoming exams")}
                                        className="relative overflow-hidden rounded-2xl md:rounded-[24px] p-4 md:p-5 flex flex-col items-start justify-between aspect-square cursor-pointer transition-all duration-300 group bg-gradient-to-br from-rose-50/80 to-white hover:shadow-[0_8px_24px_rgba(244,63,94,0.1)] border border-rose-100/50 hover:border-rose-200 hover:-translate-y-1"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center border border-white">
                                                <Sparkles size={14} className="text-rose-500" />
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 md:w-12 md:h-12 mb-3 rounded-2xl bg-white shadow-sm border border-rose-50 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <FileText size={20} className="md:w-[22px] md:h-[22px]" />
                                        </div>
                                        <div className="flex-1 text-left w-full mt-auto">
                                            <h3 className="font-extrabold text-gray-900 text-[14px] md:text-[15px] leading-tight mb-1">Exam Prep</h3>
                                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed font-medium">Structured plans & mock tests</p>
                                        </div>
                                    </div>

                                    {/* Card 3: Resume Building */}
                                    <div
                                        onClick={() => handleSendMessage("Can you help me build and review my resume?")}
                                        className="relative overflow-hidden rounded-2xl md:rounded-[24px] p-4 md:p-5 flex flex-col items-start justify-between aspect-square cursor-pointer transition-all duration-300 group bg-gradient-to-br from-blue-50/80 to-white hover:shadow-[0_8px_24px_rgba(59,130,246,0.1)] border border-blue-100/50 hover:border-blue-200 hover:-translate-y-1"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center border border-white">
                                                <Sparkles size={14} className="text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 md:w-12 md:h-12 mb-3 rounded-2xl bg-white shadow-sm border border-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <Code size={20} className="md:w-[22px] md:h-[22px]" />
                                        </div>
                                        <div className="flex-1 text-left w-full mt-auto">
                                            <h3 className="font-extrabold text-gray-900 text-[14px] md:text-[15px] leading-tight mb-1">Resume Build</h3>
                                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed font-medium">ATS-friendly resume analysis</p>
                                        </div>
                                    </div>

                                    {/* Card 4: Career Guidance */}
                                    <div
                                        onClick={() => handleSendMessage("I need career guidance and a roadmap")}
                                        className="relative overflow-hidden rounded-2xl md:rounded-[24px] p-4 md:p-5 flex flex-col items-start justify-between aspect-square cursor-pointer transition-all duration-300 group bg-gradient-to-br from-emerald-50/80 to-white hover:shadow-[0_8px_24px_rgba(16,185,129,0.1)] border border-emerald-100/50 hover:border-emerald-200 hover:-translate-y-1"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center border border-white">
                                                <Sparkles size={14} className="text-emerald-500" />
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 md:w-12 md:h-12 mb-3 rounded-2xl bg-white shadow-sm border border-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <Compass size={20} className="md:w-[22px] md:h-[22px]" />
                                        </div>
                                        <div className="flex-1 text-left w-full mt-auto">
                                            <h3 className="font-extrabold text-gray-900 text-[14px] md:text-[15px] leading-tight mb-1">Career Guide</h3>
                                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed font-medium">Map out your dream career path</p>
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
                                onEditMessage={async (messageId: string | number, newText: string) => {
                                    try {
                                        const numId = Number(messageId);
                                        // BUG-13 fix: temp-ID messages ("temp-user-*", "temp-ai-*")
                                        // are not yet persisted — show a clear toast instead of
                                        // silently swallowing the action.
                                        if (isNaN(numId)) {
                                            toast.error("Message is still being saved. Please wait a moment and try again.");
                                            return;
                                        }

                                        queryClient.setQueryData<Message[]>(["chats", searchParams.get("threadId") ?? "default"], (old) => {
                                            const existing = old || [];
                                            const idx = existing.findIndex(m => String(m.id) === String(messageId));
                                            if (idx === -1) return existing;
                                            return existing.slice(0, idx); // remove this message and all after
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
                <footer className="absolute bottom-0 left-0 right-0 z-30 px-2 sm:px-4 pb-3 sm:pb-6 pt-2 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent shrink-0">
                    <div className="max-w-5xl mx-auto">
                        <ChatInput onSendMessage={handleSendMessage} onStopGenerate={() => abortControllerRef.current?.abort()} isLoading={isProcessing} />
                    </div>
                </footer>

                <ProfileSyncModal
                    isOpen={isSyncModalOpen}
                    onClose={async (updated) => {
                        setIsSyncModalOpen(false);
                        if (updated) {
                            // BUG-05 fix: syncProfile() refreshes the AuthContext user state
                            // (including UserProfile) so the profile header/banner reflects
                            // the newly approved resume data without a full page reload.
                            await syncProfile();
                            queryClient.invalidateQueries({ queryKey: ["profile"] });
                        }
                    }}
                    pendingResumeSnapshot={pendingSnapshotForModal}
                />
            </div>

            {/* Right/Workspace Area */}
            {activeArtifact && (
                <div className={`flex flex-col h-full bg-white relative overflow-hidden border-l border-gray-200 transition-all duration-300 ${isMobile ? 'w-full absolute inset-0 z-50' : 'w-1/2'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f9fafb]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-[#202124] truncate max-w-[150px] sm:max-w-[250px]">{activeArtifact.title || "Career Artifact"}</h3>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                    {activeArtifact.type?.replace("_", " ")} • v{activeArtifact.version || 1}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Tab Switcher */}
                            <div className="bg-gray-100/80 p-0.5 rounded-lg flex items-center shadow-inner">
                                <button
                                    onClick={() => setWorkspaceTab("preview")}
                                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${workspaceTab === "preview"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-800"
                                        }`}
                                >
                                    Preview
                                </button>
                                <button
                                    onClick={() => setWorkspaceTab("code")}
                                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${workspaceTab === "code"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-800"
                                        }`}
                                >
                                    Code
                                </button>
                            </div>

                            <button
                                onClick={() => setActiveArtifact(null)}
                                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors active:scale-95"
                                title="Close Workspace"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-slate-50/55">
                        {workspaceTab === "preview" ? (
                            renderArtifactPreview(activeArtifact)
                        ) : (
                            <div className="relative group">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            typeof activeArtifact.data === "string"
                                                ? activeArtifact.data
                                                : activeArtifact.data?.code || JSON.stringify(activeArtifact.data, null, 2)
                                        );
                                        toast.success("Artifact copied to clipboard!");
                                    }}
                                    className="absolute right-3 top-3 px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold rounded-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Copy Code
                                </button>
                                <pre className="text-xs bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 overflow-x-auto font-mono leading-relaxed shadow-sm">
                                    <code>
                                        {typeof activeArtifact.data === "string"
                                            ? activeArtifact.data
                                            : activeArtifact.data?.code || JSON.stringify(activeArtifact.data, null, 2)}
                                    </code>
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatArea;
