import React, { useEffect, useState } from "react";
import { ArrowLeft, Bell, Link as LinkIcon, CheckCircle, Circle } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

const typeLabel = (type) => {
  const map = {
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
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (n) => {
    if (!n || n.targetAll || n.isRead) return;
    try {
      await axiosInstance.patch(`/notifications/${n.id}/read`);
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
      setSelected((prev) => (prev && prev.id === n.id ? { ...prev, isRead: true } : prev));
      toast.success("Marked as read");
    } catch (err) {
      console.error("Failed to mark as read", err);
      toast.error("Could not mark as read");
    }
  };

  const openLink = (url) => {
    try {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground px-4">
      {/* Mobile/Header */}
      <div className="mobile-header border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="mobile-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Bell size={18} /> Notifications
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="mobile-content p-4">
        {/* List */}
        <div className="space-y-2 p-4">
          {loading && (
            <div className="text-sm text-gray-400">Loading notifications...</div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="text-sm text-gray-400">No notifications yet.</div>
          )}

          {!loading && notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelected(n)}
              className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {n.isRead ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {typeLabel(n.type)}
                      </span>
                      {n.targetAll && (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Broadcast
                        </span>
                      )}
                      {n.isRead && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                          Read
                        </span>
                      )}
                    </div>
                    <div className="font-medium">
                      {n.title || n.message?.slice(0, 80) || "Untitled"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {n.link && (
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openLink(n.link); }}>
                    <LinkIcon className="w-4 h-4 mr-2" /> Open
                  </Button>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)}></div>
            <div className="relative z-10 w-full max-w-lg p-6 rounded-lg bg-neutral-900 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-5 h-5" />
                    <span className="text-sm px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {typeLabel(selected.type)}
                    </span>
                    {selected.targetAll && (
                      <span className="text-sm px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Broadcast
                      </span>
                    )}
                    {selected.isRead && (
                      <span className="text-sm px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                        Read
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">{selected.title || "Notification"}</h2>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              </div>

              <div className="text-sm whitespace-pre-wrap">
                {selected.message}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {selected.link && (
                  <Button onClick={() => openLink(selected.link)}>
                    <LinkIcon className="w-4 h-4 mr-2" /> Open Link
                  </Button>
                )}
                {!selected.targetAll && !selected.isRead && (
                  <Button variant="secondary" onClick={() => markAsRead(selected)}>Mark as Read</Button>
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