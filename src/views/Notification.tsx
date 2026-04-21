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
    User,
    Trophy,
    Sparkles,
    Briefcase
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
    const [filter, setFilter] = useState<string>("all");
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
            toast.success("Notification synced");
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Notification dismissed");
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.isRead;
        return true;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'job_alert': return <Briefcase size={20} className="text-primary" />;
            case 'application_update': return <CheckCircle size={20} className="text-emerald-500" />;
            case 'ai_tip': return <Sparkles size={20} className="text-purple-500" />;
            case 'skill_improvement': return <Trophy size={20} className="text-amber-500" />;
            default: return <Bell size={20} className="text-gray-400" />;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f3f2ef] overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-white border-b border-gray-200 w-full shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-[#202124] tracking-tight">Notification Hub</h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchNotifications}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all"
                        title="Sync Intelligence"
                    >
                        <Clock size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto md:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-6 h-full">
                    
                    {/* Left Sidebar - Management */}
                    {!isMobile && (
                        <div className="w-full lg:w-72 shrink-0 space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Manage Stream</h3>
                                </div>
                                <div className="p-2 flex flex-col gap-1">
                                    {[
                                        { id: 'all', label: 'All Notifications', icon: <Bell size={18} /> },
                                        { id: 'unread', label: 'Unread Only', icon: <Circle size={18} /> },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setFilter(item.id)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                                filter === item.id 
                                                ? "bg-primary/10 text-primary" 
                                                : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                    Manage your professional updates and neural alerts. Stay connected with the mission.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Main Feed */}
                    <div className="flex-1 space-y-4 pb-20">
                        {loading && notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 gap-4">
                                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Streams...</span>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                                    <Bell size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-[#202124] mb-2">Clear Frequency</h3>
                                <p className="text-gray-500 font-medium">No {filter === 'unread' ? 'unread' : ''} messages detected in the stream.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                {filteredNotifications.map((n, idx) => (
                                    <div 
                                        key={n.id}
                                        onClick={() => {
                                            setSelected(n);
                                            markAsRead(n);
                                        }}
                                        className={`group flex items-start gap-4 p-4 md:p-6 border-b border-gray-100 last:border-none transition-all cursor-pointer hover:bg-gray-50 relative ${!n.isRead ? 'bg-primary/5' : ''}`}
                                    >
                                        {!n.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}
                                        
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                                            {getIcon(n.type)}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{typeLabel(n.type)}</span>
                                                <span className="text-[10px] text-gray-400">•</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className={`text-[15px] leading-snug break-words ${!n.isRead ? 'font-bold text-[#202124]' : 'font-medium text-gray-600'}`}>
                                                {n.title || n.message?.slice(0, 100) + '...'}
                                            </h3>
                                            <p className="mt-1 text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(n.id);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative z-10 w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        {getIcon(selected.type)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{typeLabel(selected.type)}</p>
                                        <h2 className="text-xl font-bold text-[#202124] leading-tight">{selected.title || "Message Update"}</h2>
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="text-[#3c4043] leading-relaxed text-[15px] font-medium whitespace-pre-wrap mb-10 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                                {selected.message}
                            </div>

                            <div className="flex items-center gap-3">
                                {selected.link && (
                                    <button 
                                        onClick={() => window.open(selected.link, '_blank')}
                                        className="flex-1 py-4 bg-primary text-white font-bold text-[14px] rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <LinkIcon size={16} /> View Details
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSelected(null)}
                                    className="flex-1 py-4 bg-gray-100 text-[#202124] font-bold text-[14px] rounded-xl hover:bg-gray-200 transition-all font-bold"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;
