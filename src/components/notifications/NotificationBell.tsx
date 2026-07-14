"use client";

import React, { useEffect, useState } from "react";
import { Bell, Briefcase, CheckCircle, Sparkles, Trophy, Trash2, BellRing } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { subscribeUserToPush } from "@/utils/pushNotifications";
import { toast } from "sonner";

export function NotificationBell() {
    const navigate = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await axiosInstance.get("/notifications");
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error("Failed to load notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Check push permission
        if ('Notification' in window) {
            setPushEnabled(Notification.permission === 'granted');
        }
        
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            fetchNotifications();
        }
    };

    const markAsRead = async (n: any) => {
        if (!n || n.targetAll || n.isRead) return;
        try {
            await axiosInstance.patch(`/notifications/${n.id}/read`);
            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === n.id ? { ...item, isRead: true } : item
                )
            );
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const deleteNotification = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await axiosInstance.delete(`/notifications/${id}`);
        } catch (err) {}
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const enablePushNotifications = async () => {
        const success = await subscribeUserToPush();
        if (success) {
            setPushEnabled(true);
            toast.success("Desktop notifications enabled!");
        } else {
            toast.error("Failed to enable notifications. Please check your browser settings.");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'job_alert': return <Briefcase size={16} className="text-primary" />;
            case 'application_update': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'ai_tip': return <Sparkles size={16} className="text-purple-500" />;
            case 'skill_improvement': return <Trophy size={16} className="text-amber-500" />;
            default: return <Bell size={16} className="text-gray-400" />;
        }
    };

    const handleNotificationClick = (n: any) => {
        markAsRead(n);
        if (n.link) {
            navigate.push(n.link);
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button className="relative w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm group">
                    <Bell size={18} className="group-hover:animate-pulse" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0 mr-4 md:mr-6 shadow-xl border-gray-100 rounded-xl overflow-hidden" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-white">
                    <h3 className="font-semibold text-[14px] text-slate-800 flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {unreadCount} new
                            </span>
                        )}
                    </h3>
                </div>
                
                {!pushEnabled && (
                    <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-700">
                            <BellRing size={14} />
                            <span className="text-[11px] font-medium">Never miss an alert</span>
                        </div>
                        <button 
                            onClick={enablePushNotifications}
                            className="text-[11px] font-bold text-primary hover:underline"
                        >
                            Turn on
                        </button>
                    </div>
                )}

                <div className="max-h-[360px] overflow-y-auto scrollbar-thin bg-white">
                    {notifications.length === 0 ? (
                        <div className="py-10 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <Bell className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-[13px] font-medium text-gray-900">You're all caught up</p>
                            <p className="text-[11px] text-gray-500 mt-1">No new notifications right now</p>
                        </div>
                    ) : (
                        notifications.slice(0, 10).map((n) => (
                            <div 
                                key={n.id} 
                                onClick={() => handleNotificationClick(n)}
                                className={`flex gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors relative group ${!n.isRead ? 'bg-primary/5' : 'bg-white'}`}
                            >
                                <div className="mt-0.5 flex-shrink-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!n.isRead ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                                        {getIcon(n.type)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h4 className={`text-[13px] ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</h4>
                                    <p className="text-[12px] text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                                    <span className="text-[10px] text-gray-400 mt-1.5 block font-medium">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                {!n.targetAll && (
                                    <button 
                                        onClick={(e) => deleteNotification(e, n.id)}
                                        className="absolute right-3 top-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-red-50"
                                        title="Dismiss"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                    <Button 
                        variant="ghost" 
                        className="w-full text-[12px] h-9 font-medium text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                            setOpen(false);
                            navigate.push("/notifications");
                        }}
                    >
                        View all activity
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
