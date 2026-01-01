import React, { useEffect, useState } from "react";
import {
    ArrowLeft,
    Bell,
    Link as LinkIcon,
    CheckCircle2,
    Circle,
    Menu,
    MoreHorizontal,
    ExternalLink,
    MailOpen,
    Mail,
    Loader2,
    X
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationItem {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    targetAll: boolean;
    link: string;
    createdAt: string;
}

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
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [selected, setSelected] = useState<NotificationItem | null>(null);
    const { toggleSidebar } = useAuth();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/notifications");
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error("Failed to load notifications", err);
            toast.error("Failed to synchronize notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (n: NotificationItem) => {
        if (!n || n.targetAll || n.isRead) return;
        try {
            await axiosInstance.patch(`/notifications/${n.id}/read`);
            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === n.id ? { ...item, isRead: true } : item
                )
            );
            setSelected((prev) =>
                prev && prev.id === n.id ? { ...prev, isRead: true } : prev
            );
            toast.success("Packet acknowledged");
        } catch (err) {
            console.error("Failed to mark as read", err);
            toast.error("Acknowledgment failed");
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
        <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-x-hidden">
            {/* Background Orbs */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all active:scale-95 group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Pulse</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Intelligence Feed</h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                <Loader2 size={48} className="text-primary animate-spin relative z-10" />
                            </div>
                            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Neural Streams...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="glass-card rounded-[3rem] p-20 text-center border-white/[0.05] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform duration-700">
                                    <Bell size={48} className="text-gray-800 group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">Void Detected</h3>
                                <p className="text-gray-500 max-w-xs mx-auto font-medium leading-relaxed">
                                    Your intelligence network is currently idling. New signals will manifest here as they are broadcast.
                                </p>
                            </div>
                        </div>
                    ) : (
                        notifications.map((n, idx) => (
                            <button
                                key={n.id}
                                onClick={() => setSelected(n)}
                                className={`w-full group text-left p-6 md:p-8 rounded-[2rem] border transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${n.isRead
                                    ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                                    : "bg-white/[0.05] border-primary/20 hover:border-primary/40 shadow-lg shadow-primary/5"
                                    }`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${n.isRead ? 'bg-white/[0.03] border-white/10 text-gray-600' : 'bg-primary/20 border-primary/30 text-primary'
                                            }`}>
                                            {n.isRead ? <MailOpen size={20} /> : <Mail size={20} />}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                    {typeLabel(n.type)}
                                                </span>
                                                {n.targetAll && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                                        Broadcast
                                                    </span>
                                                )}
                                                {!n.isRead && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                )}
                                            </div>

                                            <h3 className={`text-lg font-bold tracking-tight mb-2 ${n.isRead ? 'text-gray-400' : 'text-white'}`}>
                                                {n.title || n.message?.slice(0, 80) || "Untitled Event"}
                                            </h3>

                                            <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                                                {new Date(n.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </div>
                                        </div>
                                    </div>

                                    {n.link && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openLink(n.link);
                                            }}
                                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-primary transition-all active:scale-95 hidden md:block"
                                        >
                                            <ExternalLink size={18} />
                                        </button>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Neural Overlay (Modal) */}
                {selected && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setSelected(null)}
                        ></div>
                        <div className="relative z-10 w-full max-w-xl glass-card rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="flex items-start justify-between gap-6 mb-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                            {typeLabel(selected.type)}
                                        </span>
                                        {selected.targetAll && (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                                Global Broadcast
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-black text-white leading-tight">
                                        {selected.title || "Observation Point"}
                                    </h2>
                                    <div className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">
                                        {new Date(selected.createdAt).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-500 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="text-gray-400 font-medium leading-relaxed text-sm whitespace-pre-wrap mb-10 border-l-2 border-primary/20 pl-6 py-2">
                                {selected.message}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
                                {selected.link && (
                                    <button
                                        onClick={() => openLink(selected.link)}
                                        className="flex-1 px-8 py-3 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={16} /> Open Resource
                                    </button>
                                )}
                                {!selected.targetAll && !selected.isRead && (
                                    <button
                                        onClick={() => markAsRead(selected)}
                                        className="flex-1 px-8 py-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                                    >
                                        Acknowledge
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notification;
