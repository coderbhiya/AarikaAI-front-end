"use client";

import React, { useEffect, useState } from "react";
import {
    ArrowLeft,
    Bell,
    Link as LinkIcon,
    CheckCircle,
    Circle,
    Menu,
    Clock,
    X,
    User
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const typeLabel = (type: string) => {
    const map: Record<string, string> = {
        job_alert: "Job Alert",
        application_update: "Application Update",
        ai_tip: "AI Tip",
        skill_improvement: "Skill Improvement",
        common: "Notification",
    };
    return map[type] || type;
};

const Notification = () => {
    const navigate = useRouter();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const { toggleSidebar } = useAuth();
    const isMobile = useIsMobile();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/notifications");
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error("Failed to load notifications", err);
            toast.error("Neural link failed to sync notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (n: any) => {
        if (!n || n.targetAll || n.isRead) return;
        try {
            await axiosInstance.patch(`/notifications/${n.id}/read`);
            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === n.id ? { ...item, isRead: true } : item
                )
            );
            setSelected((prev: any) =>
                prev && prev.id === n.id ? { ...prev, isRead: true } : prev
            );
            toast.success("Intelligence mark as read");
        } catch (err) {
            console.error("Failed to mark as read", err);
            toast.error("Could not sync read status");
        }
    };

    const openLink = (url: string) => {
        try {
            if (url) window.open(url, "_blank", "noopener,noreferrer");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-transparent relative overflow-hidden pb-10 scrollbar-none">
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

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
                        <span className="text-[17px] font-semibold text-[#444746] tracking-tight">Intelligence Stream</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm" onClick={() => navigate.push("/profile")}>
                        <User size={16} />
                    </button>
                </div>
            </header>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 relative z-10 scrollbar-none">
                <div className="max-w-4xl mx-auto space-y-4">
                    {loading && (
                        <div className="flex flex-col items-center justify-center p-20 gap-4 animate-pulse">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Decoding Streams...</span>
                        </div>
                    )}

                    {!loading && notifications.length === 0 && (
                        <div className="p-16 text-center bg-white border border-slate-100 rounded-2xl animate-in zoom-in duration-700 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                            <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner text-slate-300 relative z-10">
                                <Bell size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 uppercase relative z-10">Clear Frequency</h3>
                            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest relative z-10 opacity-70">No neural notifications detected.</p>
                        </div>
                    )}

                    {!loading &&
                        notifications.map((n, idx) => (
                            <button
                                key={n.id}
                                onClick={() => setSelected(n)}
                                className={`w-full text-left p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden`}
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="flex items-start justify-between gap-6 relative z-10">
                                    <div className="flex items-start gap-5">
                                        <div className={`mt-1.5 p-1 rounded-full ${n.isRead ? 'text-slate-200' : 'text-primary'}`}>
                                            {n.isRead ? <CheckCircle size={18} /> : <Circle size={18} fill="currentColor" fillOpacity={0.2} strokeWidth={3} className="animate-pulse" />}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`text-[7px] font-bold px-2.5 py-1 rounded bg-slate-50 text-slate-400 border border-slate-100 tracking-widest uppercase transition-all duration-500 ${!n.isRead && 'group-hover:bg-primary group-hover:text-white group-hover:border-primary'}`}>
                                                    {typeLabel(n.type)}
                                                </span>
                                                {n.targetAll && (
                                                    <span className="text-[7px] font-bold px-2.5 py-1 rounded bg-purple-50 text-purple-600 border border-purple-100 tracking-widest uppercase">
                                                        Broadcast
                                                    </span>
                                                )}
                                                {n.isRead && (
                                                    <span className="text-[7px] font-bold px-2.5 py-1 rounded bg-slate-50 text-slate-300 border border-slate-100 tracking-widest uppercase">
                                                        Synced
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`text-base md:text-lg font-bold tracking-tight leading-tight transition-colors duration-500 ${n.isRead ? 'text-slate-400' : 'text-slate-900 group-hover:text-primary'}`}>
                                                {n.title || n.message?.slice(0, 80) || "Neural Transmission"}
                                            </h3>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 opacity-50">
                                                <Clock size={10} className="text-slate-300" />
                                                {new Date(n.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    {n.link && (
                                        <div
                                            className="hidden md:flex p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openLink(n.link);
                                            }}
                                        >
                                            <LinkIcon size={12} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                </div>
            </div>

            {/* Modal - Liquid Glass */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10 animate-in fade-in duration-500">
                    <div
                        className="absolute inset-0 bg-slate-900/10 backdrop-blur-md"
                        onClick={() => setSelected(null)}
                    ></div>
                    <div className="relative z-10 w-full max-w-lg p-8 md:p-10 rounded-2xl bg-white border border-slate-100 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                        <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-50">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary shadow-inner border border-slate-100">
                                        <Bell size={20} />
                                    </div>
                                    <span className="text-[7px] font-bold px-3 py-1 rounded bg-primary/5 text-primary border border-primary/10 tracking-widest uppercase">
                                        {typeLabel(selected.type)}
                                    </span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                                    {selected.title || "Neural Subject"}
                                </h2>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 opacity-60">
                                    <Clock size={11} className="text-slate-300" />
                                    {new Date(selected.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all duration-500 active:scale-90"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="text-slate-600 font-medium text-base leading-relaxed whitespace-pre-wrap mb-10 max-h-[30vh] overflow-y-auto pr-4 scrollbar-none opacity-90">
                            {selected.message}
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-3">
                            {selected.link && (
                                <button
                                    onClick={() => openLink(selected.link)}
                                    className="w-full md:w-auto px-10 py-3.5 bg-slate-900 hover:bg-primary text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all duration-500 shadow-md active:scale-95 flex items-center justify-center gap-2.5"
                                >
                                    <LinkIcon size={14} /> Open Destination
                                </button>
                            )}
                            {!selected.targetAll && !selected.isRead && (
                                <button
                                    className="w-full md:w-auto px-10 py-3.5 bg-white border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all duration-500 shadow-sm active:scale-95 flex items-center justify-center gap-2.5"
                                    onClick={() => markAsRead(selected)}
                                >
                                    <CheckCircle size={14} /> Mark as Synced
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;
